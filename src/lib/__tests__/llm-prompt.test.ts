import { describe, it, expect } from 'vitest'
import { LLM_RECIPE_PROMPT } from '@/lib/llm-prompt'
import { parseMarkdown } from '@/lib/recipe-utils'

describe('LLM recipe prompt', () => {
  it('describes each part of the format the parser reads', () => {
    for (const part of [
      'hash sign',
      'three dashes',
      'yield:',
      'time:',
      'dash and a space',
      'blank line',
    ]) {
      expect(LLM_RECIPE_PROMPT, part).toContain(part)
    }
  })

  it('does not contain a sample recipe the model could copy', () => {
    expect(LLM_RECIPE_PROMPT).not.toMatch(/^# /m)
    expect(LLM_RECIPE_PROMPT).not.toMatch(/^- /m)
  })

  it('names time formats the parser accepts', () => {
    for (const time of ['1:30', '1h 30m', '45m']) {
      const [recipe] = parseMarkdown(`# T\n---\ntime: ${time}\n---\n- a\n\n1. b`)
      expect(recipe.totalTime, time).toMatch(/^\d+:\d{2}$/)
      expect(LLM_RECIPE_PROMPT).toContain(time)
    }
  })

  it('produces output the parser reads when a model follows the rules', () => {
    // Output shaped by the rules: title, metadata block, one ingredient list, unnumbered steps
    const reply = [
      '# Tomato soup',
      '---',
      'yield: 4 servings',
      'time: 1h 15m',
      '---',
      '- 800 g tomatoes',
      '- 1 onion',
      '',
      'Soften the onion in oil.',
      'Add the tomatoes and simmer for 30 minutes.',
      '',
      '# Toast',
      '- 2 slices of bread',
      '',
      'Toast the bread.',
    ].join('\n')

    const [soup, toast] = parseMarkdown(reply)
    expect(soup.title).toBe('Tomato soup')
    expect(soup.yield).toBe('4 servings')
    expect(soup.totalTime).toBe('1:15')
    expect(soup.ingredients).toEqual([{ label: '', items: ['800 g tomatoes', '1 onion'] }])
    expect(soup.instructions).toHaveLength(2)
    expect(toast.title).toBe('Toast')
  })
})
