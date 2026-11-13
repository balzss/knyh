import { describe, it, expect } from 'vitest'
import { parseMarkdown, recipeToMarkdown, mergeIngredientGroups } from '@/lib/recipe-utils'
import type { Recipe } from '@/lib/types'

describe('recipe-utils parseMarkdown', () => {
  it('parses a single minimal recipe', () => {
    const md = `# Test Recipe\n- item 1\n- item 2\n\n1. Do something\n2. Do next`
    const parsed = parseMarkdown(md)
    expect(parsed.length).toBe(1)
    const r = parsed[0]
    expect(r.title).toBe('Test Recipe')
    expect(r.ingredients).toEqual([{ label: '', items: ['item 1', 'item 2'] }])
    expect(r.instructions).toEqual(['Do something', 'Do next'])
    expect(r.yield).toBe('')
    expect(r.totalTime).toBe('')
  })

  it('parses frontmatter with synonyms (servings & duration)', () => {
    const md = `# Fancy\n---\nservings: 4 people\nduration: 45m\n---\n- a\n- b\n\n1. cook\n2. eat`
    const [r] = parseMarkdown(md)
    expect(r.yield).toBe('4 people')
    expect(r.totalTime).toBe('0:45')
  })

  it('parses multiple recipes in one markdown', () => {
    const md = `# R1\n- i1\n\n1. step\n# R2\n---\nyield: 2\ntime: 10m\n---\n- x\n- y\n\n1. s1`
    const parsed = parseMarkdown(md)
    expect(parsed.length).toBe(2)
    expect(parsed[0].title).toBe('R1')
    expect(parsed[1].yield).toBe('2')
    expect(parsed[1].totalTime).toBe('0:10')
  })

  it('returns empty array for blank input', () => {
    expect(parseMarkdown('   \n\n')).toEqual([])
  })

  it('accepts recipes without ingredients or instructions', () => {
    const md = `# OnlyTitle\n\n# WithIngredientsOnly\n- a\n- b\n\n# WithStepsOnly\n\n1. step`
    const [title, ingredients, steps] = parseMarkdown(md)
    expect(title).toMatchObject({ title: 'OnlyTitle', ingredients: [], instructions: [] })
    expect(ingredients.ingredients).toEqual([{ label: '', items: ['a', 'b'] }])
    expect(ingredients.instructions).toEqual([])
    expect(steps.ingredients).toEqual([])
    expect(steps.instructions).toEqual(['step'])
  })

  it('handles ingredients as GroupData with empty label', () => {
    const md = `# Test Recipe\n- ingredient 1\n- ingredient 2\n\n1. First step`
    const parsed = parseMarkdown(md)
    expect(parsed.length).toBe(1)
    const r = parsed[0]
    expect(r.ingredients).toEqual([
      {
        label: '',
        items: ['ingredient 1', 'ingredient 2'],
      },
    ])
  })
})

describe('recipe-utils recipeToMarkdown', () => {
  it('roundtrips recipe -> markdown -> recipe', () => {
    const recipe: Recipe = {
      id: 'r1',
      title: 'Roundtrip',
      ingredients: [{ label: '', items: ['ing 1', 'ing 2'] }],
      instructions: ['Do A', 'Do B'],
      tags: [],
      yield: '3',
      totalTime: '0:15',
      archived: false,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    }
    const md = recipeToMarkdown(recipe)
    const parsed = parseMarkdown(md)
    expect(parsed.length).toBe(1)
    const r = parsed[0]
    expect(r.title).toBe(recipe.title)
    expect(r.ingredients).toEqual(recipe.ingredients)
    expect(r.instructions).toEqual(recipe.instructions)
    expect(r.yield).toBe(recipe.yield)
    expect(r.totalTime).toBe(recipe.totalTime)
  })
})

describe('mergeIngredientGroups', () => {
  const grouped = [
    { label: 'Dough', items: ['flour', 'water'] },
    { label: 'Sauce', items: ['tomato'] },
  ]
  const flat = [{ label: '', items: ['flour', 'water', 'tomato'] }]

  it('keeps the groups when the ingredients did not change', () => {
    expect(mergeIngredientGroups(grouped, flat)).toBe(grouped)
  })

  it('uses the new list when an ingredient changed', () => {
    const edited = [{ label: '', items: ['flour', 'water', 'basil'] }]
    expect(mergeIngredientGroups(grouped, edited)).toBe(edited)
  })

  it('uses the new list when there is nothing to keep', () => {
    expect(mergeIngredientGroups(undefined, flat)).toBe(flat)
  })

  it('survives a trip through markdown without losing groups', () => {
    const md = recipeToMarkdown({
      title: 'Pizza',
      ingredients: grouped,
      instructions: ['mix', 'bake'],
      yield: '2',
      totalTime: '1:00',
    })
    const [parsed] = parseMarkdown(md)
    expect(parsed.title).toBe('Pizza')
    expect(parsed.yield).toBe('2')
    expect(mergeIngredientGroups(grouped, parsed.ingredients)).toBe(grouped)
  })
})
