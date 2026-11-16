import { describe, it, expect } from 'vitest'
import { normalizeImportData } from '@/lib/import-validation'

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
