import { describe, expect, it } from 'vitest'
import { asEditor, call, makeToken, testEnv } from './helpers'

describe('edit mode', () => {
  it('reports no editor without a token', async () => {
    const response = await call('/api/session')
    expect(await response.json()).toEqual({ editor: false })
  })

  it('reports editor for a valid Access cookie', async () => {
    const response = await asEditor('/api/session')
    expect(await response.json()).toEqual({ editor: true })
  })

  it('accepts the token from the Access header too', async () => {
    const token = await makeToken()
    const response = await call('/api/session', { headers: { 'Cf-Access-Jwt-Assertion': token } })
    expect(await response.json()).toEqual({ editor: true })
  })

  it('rejects a token for another application', async () => {
    const token = await makeToken({ audience: 'someone-elses-app' })
    const response = await call('/api/session', { token })
    expect(await response.json()).toEqual({ editor: false })
  })

  it('rejects a token from another issuer', async () => {
    const token = await makeToken({ issuer: 'https://evil.cloudflareaccess.com' })
    const response = await call('/api/session', { token })
    expect(await response.json()).toEqual({ editor: false })
  })

  it('rejects an expired token', async () => {
    const token = await makeToken({ expiresIn: '-1m' })
    const response = await call('/api/session', { token })
    expect(await response.json()).toEqual({ editor: false })
  })

  it('rejects a garbage token', async () => {
    const response = await call('/api/session', { token: 'not-a-jwt' })
    expect(await response.json()).toEqual({ editor: false })
  })
})

describe('access rules', () => {
  it('lets anyone read recipes, tags and config', async () => {
    for (const path of ['/api/recipes', '/api/tags', '/api/config']) {
      expect((await call(path)).status, path).toBe(200)
    }
  })

  it('keeps archived recipes private', async () => {
    const created = await asEditor('/api/recipes', {
      method: 'POST',
      json: [{ title: 'Hidden', ingredients: [], instructions: [], archived: true }],
    })
    const [hidden] = (await created.json()) as { id: string }[]
    const ids = async (path: string, editor: boolean) =>
      ((await (editor ? asEditor(path) : call(path))).json() as Promise<{ id: string }[]>).then(
        (list) => list.map((recipe) => recipe.id)
      )

    // Visitors: an unfiltered list drops archived recipes, and asking for them is refused
    expect(await ids('/api/recipes', false)).not.toContain(hidden.id)
    expect(await ids('/api/recipes?archived=false', false)).not.toContain(hidden.id)
    expect((await call('/api/recipes?archived=true')).status).toBe(401)

    // The editor still sees them
    expect(await ids('/api/recipes', true)).toContain(hidden.id)
    expect(await ids('/api/recipes?archived=true', true)).toContain(hidden.id)
  })

  it('blocks every write without a token', async () => {
    const writes: [string, string, unknown?][] = [
      ['POST', '/api/recipes', [{ title: 'x', ingredients: [], instructions: [] }]],
      ['PATCH', '/api/recipes', { ids: ['a'], data: { archived: true } }],
      ['PUT', '/api/recipes/abc', { title: 'x', ingredients: [], instructions: [] }],
      ['DELETE', '/api/recipes/abc'],
      ['POST', '/api/tags', { displayName: 'x' }],
      ['PATCH', '/api/tags/abc', { displayName: 'x' }],
      ['DELETE', '/api/tags/abc'],
      ['PATCH', '/api/config', { language: 'hu' }],
      ['PUT', '/api/shopping-list', []],
      ['POST', '/api/import', {}],
    ]
    for (const [method, path, json] of writes) {
      const response = await call(path, { method, json })
      expect(response.status, `${method} ${path}`).toBe(401)
    }
  })

  it('keeps the shopping list and export private', async () => {
    expect((await call('/api/shopping-list')).status).toBe(401)
    expect((await call('/api/export')).status).toBe(401)
    expect((await asEditor('/api/shopping-list')).status).toBe(200)
    expect((await asEditor('/api/export')).status).toBe(200)
  })

  it('refuses writes that come from another site', async () => {
    const response = await asEditor('/api/tags', {
      method: 'POST',
      json: { displayName: 'cross-site' },
      headers: { Origin: 'https://evil.example' },
    })
    expect(response.status).toBe(403)
  })

  it('fails closed when Access is not configured', async () => {
    const token = await makeToken()
    const { default: app } = await import('../../worker')
    const response = await app.request(
      'https://knyh.test/api/tags',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `CF_Authorization=${token}` },
        body: JSON.stringify({ displayName: 'nope' }),
      },
      { ...testEnv, TEAM_DOMAIN: '', POLICY_AUD: '' }
    )
    expect(response.status).toBe(401)
  })
})
