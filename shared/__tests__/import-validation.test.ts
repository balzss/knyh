import { describe, it, expect } from 'vitest'
import { normalizeImportData, validateUniqueIds } from '../import-validation'

const library = (recipe: Record<string, unknown>) => ({
  recipes: [
    {
      id: 'r1',
      title: 'Soup',
      ingredients: [{ label: '', items: ['water'] }],
      instructions: ['Boil'],
      tags: [],
      ...recipe,
    },
  ],
  tags: [],
  userConfig: { name: 'KONYHA', language: 'en' },
  shoppingList: [],
})

describe('normalizeImportData notes', () => {
  it('gives recipes from older files an empty list of notes', () => {
    expect(normalizeImportData(library({})).recipes[0].notes).toEqual([])
  })

  it('keeps notes that are text', () => {
    const [recipe] = normalizeImportData(library({ notes: ['less salt', 'from Grandma'] })).recipes
    expect(recipe.notes).toEqual(['less salt', 'from Grandma'])
  })

  it('drops entries that are not text, and values that are not a list', () => {
    expect(
      normalizeImportData(library({ notes: ['ok', 3, null, { a: 1 }] })).recipes[0].notes
    ).toEqual(['ok'])
    expect(normalizeImportData(library({ notes: 'one long string' })).recipes[0].notes).toEqual([])
  })
})

describe('normalizeImportData ideas', () => {
  const idea = {
    id: 'i1',
    title: 'Ramen',
    notes: ['try miso'],
    createdAt: '2026-01-01T00:00:00.000Z',
  }

  it('gives files from before ideas existed an empty list', () => {
    expect(normalizeImportData(library({})).ideas).toEqual([])
  })

  it('keeps well-formed ideas in order', () => {
    const data = { ...library({}), ideas: [idea, { ...idea, id: 'i2', title: 'Pho' }] }
    expect(normalizeImportData(data).ideas.map((i) => i.title)).toEqual(['Ramen', 'Pho'])
  })

  it('drops ideas without an id or title, and notes that are not text', () => {
    const data = {
      ...library({}),
      ideas: [
        { ...idea, notes: ['ok', 3, null] },
        { ...idea, id: 'i2', title: '' },
        { title: 'x' },
      ],
    }
    const { ideas } = normalizeImportData(data)
    expect(ideas).toHaveLength(1)
    expect(ideas[0].notes).toEqual(['ok'])
  })

  it('rejects duplicate idea ids', () => {
    const data = normalizeImportData({ ...library({}), ideas: [idea, idea] })
    expect(validateUniqueIds(data).valid).toBe(false)
  })
})
