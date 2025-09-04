import { describe, it, expect } from 'vitest'
import { parseMarkdown, recipeToMarkdown } from '@/lib/recipe-utils'
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
    expect(r.totalTime).toBe('45m')
  })

  it('parses multiple recipes in one markdown', () => {
    const md = `# R1\n- i1\n\n1. step\n# R2\n---\nyield: 2\ntime: 10m\n---\n- x\n- y\n\n1. s1`
    const parsed = parseMarkdown(md)
    expect(parsed.length).toBe(2)
    expect(parsed[0].title).toBe('R1')
    expect(parsed[1].yield).toBe('2')
    expect(parsed[1].totalTime).toBe('10m')
  })

  it('returns empty array for blank input', () => {
    expect(parseMarkdown('   \n\n')).toEqual([])
  })

  it('ignores invalid blocks missing ingredients or instructions', () => {
    const md = `# OnlyTitle\n\n# WithIngredientsOnly\n- a\n- b\n\n# Good One\n- a\n\n1. step`
    const parsed = parseMarkdown(md)
    // Only the last one is valid
    expect(parsed.length).toBe(1)
    expect(parsed[0].title).toBe('Good One')
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
      userId: 'test-user',
      title: 'Roundtrip',
      ingredients: [{ label: '', items: ['ing 1', 'ing 2'] }],
      instructions: ['Do A', 'Do B'],
      tags: [],
      yield: '3',
      totalTime: '15m',
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
