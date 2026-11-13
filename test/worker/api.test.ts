import { describe, expect, it } from 'vitest'
import { asEditor, call } from './helpers'

type Tag = { id: string; displayName: string }
type Recipe = {
  id: string
  title: string
  tags: Tag[]
  archived: boolean
  totalTime: string | null
  updatedAt: string
}

const recipeBody = (overrides: Record<string, unknown> = {}) => ({
  title: 'Pancakes',
  ingredients: [{ label: '', items: ['flour', 'milk'] }],
  instructions: ['mix', 'fry'],
  tags: [],
  totalTime: '0:20',
  yield: '4',
  ...overrides,
})

async function createTag(displayName: string): Promise<Tag> {
  const response = await asEditor('/api/tags', { method: 'POST', json: { displayName } })
  expect(response.status).toBe(201)
  return response.json()
}

async function createRecipe(overrides: Record<string, unknown> = {}): Promise<Recipe> {
  const response = await asEditor('/api/recipes', { method: 'POST', json: [recipeBody(overrides)] })
  expect(response.status).toBe(201)
  return ((await response.json()) as Recipe[])[0]
}

describe('recipes', () => {
  it('creates a recipe with tags and lists it publicly', async () => {
    const tag = await createTag('breakfast')
    const created = await createRecipe({ tags: [{ id: tag.id }] })

    expect(created.id).toMatch(/^[a-z0-9]{8}$/)
    expect(created.tags).toEqual([tag])

    const list = (await (await call('/api/recipes')).json()) as Recipe[]
    expect(list.find((recipe) => recipe.id === created.id)?.title).toBe('Pancakes')
  })

  it('filters by archived', async () => {
    const live = await createRecipe({ title: 'live' })
    const archived = await createRecipe({ title: 'old', archived: true })

    const onlyArchived = (await (await call('/api/recipes?archived=true')).json()) as Recipe[]
    const onlyLive = (await (await call('/api/recipes?archived=false')).json()) as Recipe[]

    expect(onlyArchived.map((r) => r.id)).toContain(archived.id)
    expect(onlyArchived.map((r) => r.id)).not.toContain(live.id)
    expect(onlyLive.map((r) => r.id)).toContain(live.id)
    expect(onlyLive.map((r) => r.id)).not.toContain(archived.id)
  })

  it('replaces fields and tags on update, keeping createdAt', async () => {
    const tagA = await createTag('a-tag')
    const tagB = await createTag('b-tag')
    const created = await createRecipe({ tags: [{ id: tagA.id }] })

    const response = await asEditor(`/api/recipes/${created.id}`, {
      method: 'PUT',
      json: recipeBody({ title: 'Crepes', totalTime: null, tags: [{ id: tagB.id }] }),
    })
    const updated = (await response.json()) as Recipe & { createdAt: string }

    expect(response.status).toBe(200)
    expect(updated.title).toBe('Crepes')
    expect(updated.totalTime).toBeNull()
    expect(updated.tags).toEqual([tagB])
    expect(updated.createdAt).toBe((created as Recipe & { createdAt: string }).createdAt)
  })

  it('bulk-archives with PATCH', async () => {
    const one = await createRecipe({ title: 'one' })
    const two = await createRecipe({ title: 'two' })

    const response = await asEditor('/api/recipes', {
      method: 'PATCH',
      json: { ids: [one.id, two.id, 'missing1'], data: { archived: true } },
    })
    const updated = (await response.json()) as Recipe[]

    expect(updated.map((r) => r.id).sort()).toEqual([one.id, two.id].sort())
    expect(updated.every((r) => r.archived)).toBe(true)
  })

  it('returns 404 for a missing recipe', async () => {
    const put = await asEditor('/api/recipes/nope1234', { method: 'PUT', json: recipeBody() })
    const del = await asEditor('/api/recipes/nope1234', { method: 'DELETE' })
    expect(put.status).toBe(404)
    expect(del.status).toBe(404)
  })

  it('deletes a recipe', async () => {
    const created = await createRecipe()
    expect((await asEditor(`/api/recipes/${created.id}`, { method: 'DELETE' })).status).toBe(200)
    const list = (await (await call('/api/recipes')).json()) as Recipe[]
    expect(list.map((r) => r.id)).not.toContain(created.id)
  })

  it('rejects invalid payloads', async () => {
    const empty = await asEditor('/api/recipes', { method: 'POST', json: [] })
    const notArray = await asEditor('/api/recipes', { method: 'POST', json: recipeBody() })
    const noTitle = await asEditor('/api/recipes', {
      method: 'POST',
      json: [recipeBody({ title: '   ' })],
    })
    const badTag = await asEditor('/api/recipes', {
      method: 'POST',
      json: [recipeBody({ tags: [{ id: 'does-not-exist' }] })],
    })
    expect([empty.status, notArray.status, noTitle.status, badTag.status]).toEqual([
      400, 400, 400, 400,
    ])
  })

  it('treats a malformed body as a 400', async () => {
    const { default: app } = await import('../../worker')
    const { testEnv, makeToken } = await import('./helpers')
    const response = await app.request(
      'https://knyh.test/api/recipes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `CF_Authorization=${await makeToken()}`,
        },
        body: '{not json',
      },
      testEnv
    )
    expect(response.status).toBe(400)
  })
})

describe('tags', () => {
  it('rejects duplicate names case-insensitively', async () => {
    await createTag('Dessert')
    const response = await asEditor('/api/tags', {
      method: 'POST',
      json: { displayName: 'dessert' },
    })
    expect(response.status).toBe(409)
  })

  it('renames a tag, allowing a change of case on itself', async () => {
    const tag = await createTag('soup')
    const response = await asEditor(`/api/tags/${tag.id}`, {
      method: 'PATCH',
      json: { displayName: 'Soup' },
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ id: tag.id, displayName: 'Soup' })
  })

  it('removes a deleted tag from its recipes', async () => {
    const tag = await createTag('temporary')
    const recipe = await createRecipe({ tags: [{ id: tag.id }] })

    expect((await asEditor(`/api/tags/${tag.id}`, { method: 'DELETE' })).status).toBe(200)

    const list = (await (await call('/api/recipes')).json()) as Recipe[]
    expect(list.find((r) => r.id === recipe.id)?.tags).toEqual([])
  })
})

describe('config', () => {
  it('returns defaults and merges partial updates', async () => {
    const before = (await (await call('/api/config')).json()) as Record<string, unknown>
    expect(before.language).toBe('en')

    const response = await asEditor('/api/config', {
      method: 'PATCH',
      json: { language: 'hu', defaultLayout: 'grid', defaultGridCols: 4 },
    })
    expect(await response.json()).toMatchObject({
      language: 'hu',
      defaultLayout: 'grid',
      defaultGridCols: 4,
    })

    const after = (await asEditor('/api/config', { method: 'PATCH', json: { name: 'Home' } }).then(
      (r) => r.json()
    )) as Record<string, unknown>
    expect(after).toMatchObject({ name: 'Home', language: 'hu' })
  })

  it('rejects unsupported values', async () => {
    const response = await asEditor('/api/config', { method: 'PATCH', json: { language: 'xx' } })
    expect(response.status).toBe(400)
  })
})

describe('shopping list', () => {
  it('stores items in order and replaces them on write', async () => {
    const items = [
      { text: 'milk', checked: false },
      { text: 'eggs', checked: true },
    ]
    expect((await asEditor('/api/shopping-list', { method: 'PUT', json: items })).status).toBe(200)
    expect(await (await asEditor('/api/shopping-list')).json()).toEqual(items)

    await asEditor('/api/shopping-list', {
      method: 'PUT',
      json: [{ text: 'bread', checked: false }],
    })
    expect(await (await asEditor('/api/shopping-list')).json()).toEqual([
      { text: 'bread', checked: false },
    ])
  })
})

describe('import and export', () => {
  it('round-trips the library', async () => {
    const tag = await createTag('roundtrip')
    await createRecipe({ title: 'Keep me', tags: [{ id: tag.id }] })
    await asEditor('/api/shopping-list', {
      method: 'PUT',
      json: [{ text: 'salt', checked: false }],
    })

    const exported = await (await asEditor('/api/export')).json()

    // Wipe by importing an empty library, then restore from the export
    const empty = await asEditor('/api/import', {
      method: 'POST',
      json: { recipes: [], tags: [], userConfig: { name: 'x', language: 'en' } },
    })
    expect(empty.status).toBe(200)
    expect(await (await call('/api/recipes')).json()).toEqual([])

    const restored = await asEditor('/api/import', { method: 'POST', json: exported })
    expect(restored.status).toBe(200)
    expect(await (await asEditor('/api/export')).json()).toEqual(exported)
  })

  it('accepts the legacy file format', async () => {
    const response = await asEditor('/api/import', {
      method: 'POST',
      json: {
        recipes: [
          {
            id: 'legacy01',
            title: 'Old format',
            ingredients: [{ label: '', items: ['a'] }],
            instructions: ['b'],
            tags: ['t1'],
            metadata: { totalTime: '1:00', yield: '2' },
            createdAt: '2025-01-01T00:00:00.000Z',
            lastModified: '2025-02-01T00:00:00.000Z',
          },
        ],
        tags: [{ id: 't1', displayName: 'legacy' }],
        userConfig: { name: 'x', theme: 'dark', language: 'en' },
      },
    })
    expect(response.status).toBe(200)

    const list = (await (await call('/api/recipes')).json()) as (Recipe & { yield: string })[]
    expect(list[0]).toMatchObject({
      id: 'legacy01',
      totalTime: '1:00',
      yield: '2',
      tags: [{ id: 't1', displayName: 'legacy' }],
      updatedAt: '2025-02-01T00:00:00.000Z',
    })
  })

  it('rejects malformed and duplicate data', async () => {
    const malformed = await asEditor('/api/import', { method: 'POST', json: { recipes: 'nope' } })
    const duplicate = await asEditor('/api/import', {
      method: 'POST',
      json: {
        recipes: [],
        tags: [
          { id: 'same', displayName: 'a' },
          { id: 'same', displayName: 'b' },
        ],
        userConfig: { name: 'x', language: 'en' },
      },
    })
    expect(malformed.status).toBe(400)
    expect(duplicate.status).toBe(400)
  })
})
