import { describe, expect, it } from 'vitest'
import { searchRecipes } from '../search'
import type { Recipe } from '@shared/types'

const makeRecipe = (overrides: Partial<Recipe>): Recipe => ({
  id: overrides.title ?? 'id',
  title: 'Recipe',
  ingredients: [],
  instructions: [],
  notes: [],
  tags: [],
  status: 'ready',
  totalTime: null,
  yield: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  ...overrides,
})

describe('searchRecipes', () => {
  it('returns no results for a blank query', () => {
    const results = searchRecipes([makeRecipe({ title: 'Soup' })], '  ')
    expect(results.readyTitleMatches).toEqual([])
    expect(results.contentMatches).toEqual([])
  })

  it('groups title matches by status', () => {
    const ready = makeRecipe({ title: 'Tomato soup', status: 'ready' })
    const dev = makeRecipe({ title: 'Tomato tart', status: 'development' })
    const results = searchRecipes([dev, ready], 'tomato')
    expect(results.readyTitleMatches).toEqual([ready])
    expect(results.developmentTitleMatches).toEqual([dev])
  })

  it('ignores case and accents', () => {
    const recipe = makeRecipe({ title: 'Gulyásleves' })
    expect(searchRecipes([recipe], 'GULYAS').readyTitleMatches).toEqual([recipe])
  })

  it('puts titles starting with the query first', () => {
    const inner = makeRecipe({ title: 'Cream of tomato' })
    const prefix = makeRecipe({ title: 'Tomato soup' })
    expect(searchRecipes([inner, prefix], 'tomato').readyTitleMatches).toEqual([prefix, inner])
  })

  it('finds ingredients, instructions and notes, in that order of priority', () => {
    const byIngredient = makeRecipe({
      title: 'A',
      ingredients: [{ label: '', items: ['2 cloves garlic'] }],
      notes: ['garlic is optional'],
    })
    const byInstruction = makeRecipe({ title: 'B', instructions: ['Crush the garlic'] })
    const byNote = makeRecipe({ title: 'C', notes: ['Try roasted garlic'] })
    const { contentMatches } = searchRecipes([byIngredient, byInstruction, byNote], 'garlic')
    expect(contentMatches.map((m) => [m.recipe.title, m.match.kind])).toEqual([
      ['A', 'ingredient'],
      ['B', 'instruction'],
      ['C', 'note'],
    ])
    expect(contentMatches[0].match.text).toBe('2 cloves garlic')
  })

  it('does not repeat a title match under content matches', () => {
    const recipe = makeRecipe({ title: 'Garlic bread', notes: ['more garlic'] })
    const results = searchRecipes([recipe], 'garlic')
    expect(results.readyTitleMatches).toEqual([recipe])
    expect(results.contentMatches).toEqual([])
  })
})
