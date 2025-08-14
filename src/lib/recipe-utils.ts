// Recipe parsing & serialization utilities extracted from raw-view for reuse.
import type { Recipe, GroupData } from './types'

export type ParsedRecipe = {
  title: string
  ingredients: GroupData[]
  instructions: string[]
  metadata: { yield: string; totalTime: string }
}

/**
 * Parse a markdown document that may contain one or multiple recipes.
 * A new recipe starts at a line beginning with `# `.
 */
export function parseMarkdown(md: string): ParsedRecipe[] {
  const lines = md.split(/\r?\n/).map((l) => l.replace(/\s+$/, '')) // trim right only
  if (!lines.length) return []

  const recipes: ParsedRecipe[] = []
  let currentRecipeLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('# ') && currentRecipeLines.length > 0) {
      const recipe = parseSingleRecipe(currentRecipeLines.join('\n'))
      if (recipe) recipes.push(recipe)
      currentRecipeLines = [line]
    } else {
      currentRecipeLines.push(line)
    }
  }

  if (currentRecipeLines.length > 0) {
    const recipe = parseSingleRecipe(currentRecipeLines.join('\n'))
    if (recipe) recipes.push(recipe)
  }
  return recipes
}

/** Parse a single recipe markdown block (must start with `# Title`). */
export function parseSingleRecipe(md: string): ParsedRecipe | null {
  const lines = md.split(/\r?\n/).map((l) => l.replace(/\s+$/, '')) // trim right only
  if (!lines.length) return null

  let i = 0
  while (i < lines.length && lines[i].trim() === '') i++
  if (i >= lines.length) return null

  const titleLine = lines[i]
  if (!titleLine.startsWith('# ')) return null
  const title = titleLine.slice(2).trim()
  if (!title) return null
  i++

  let yieldValue = ''
  let totalTimeValue = ''

  while (i < lines.length && lines[i].trim() === '') i++

  if (i < lines.length && lines[i] === '---') {
    i++
    while (i < lines.length && lines[i] !== '---') {
      const line = lines[i].trim()
      if (line) {
        const kv = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+)$/.exec(line)
        if (kv) {
          const key = kv[1].toLowerCase()
          const value = kv[2].trim()
          if (key === 'yield' || key === 'servings') yieldValue = value
          else if (key === 'time' || key === 'total_time' || key === 'duration')
            totalTimeValue = value
        }
      }
      i++
    }
    if (i < lines.length && lines[i] === '---') i++
  }

  while (i < lines.length && lines[i].trim() === '') i++

  const ingredients: string[] = []
  while (i < lines.length) {
    const line = lines[i].trim()
    if (line === '') break
    if (/^[-*]\s+/.test(line)) {
      ingredients.push(line.replace(/^[-*]\s+/, '').trim())
      i++
      continue
    }
    break
  }

  while (i < lines.length && lines[i].trim() === '') i++

  const instructions: string[] = []
  while (i < lines.length) {
    let line = lines[i].trim()
    if (line === '') {
      i++
      continue
    }
    line = line.replace(/^(?:\d+[.)]|[-*])\s+/, '')
    instructions.push(line)
    i++
  }

  if (!ingredients.length || !instructions.length) return null
  return {
    title,
    ingredients: [{ label: '', items: ingredients }], // Convert string[] to GroupData[]
    instructions,
    metadata: { yield: yieldValue, totalTime: totalTimeValue },
  }
}

/** Serialize a Recipe entity into markdown understood by parseMarkdown. */
export function recipeToMarkdown(recipe: Recipe): string {
  const header = `# ${recipe.title}`

  const frontmatter: string[] = []
  if (recipe.metadata?.yield) frontmatter.push(`yield: ${recipe.metadata.yield}`)
  if (recipe.metadata?.totalTime) frontmatter.push(`time: ${recipe.metadata.totalTime}`)

  const frontmatterBlock = frontmatter.length ? `\n---\n${frontmatter.join('\n')}\n---\n` : ''

  const ingredients = recipe.ingredients
    .flatMap((group) => group.items)
    .map((i) => `- ${i}`)
    .join('\n')
  const instructions = recipe.instructions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')
  return `${header}${frontmatterBlock}\n${ingredients}\n\n${instructions}`
}
