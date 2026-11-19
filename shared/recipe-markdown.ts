import type { Recipe } from './types'

/** Serialize a Recipe entity into markdown understood by parseMarkdown. */
export function recipeToMarkdown(
  recipe: Pick<Recipe, 'title' | 'ingredients' | 'instructions' | 'yield' | 'totalTime'> &
    Partial<Pick<Recipe, 'status' | 'notes'>>
): string {
  const header = `# ${recipe.title}`

  const frontmatter: string[] = []
  if (recipe.yield) frontmatter.push(`yield: ${recipe.yield}`)
  if (recipe.totalTime) frontmatter.push(`time: ${recipe.totalTime}`)
  if (recipe.status) frontmatter.push(`status: ${recipe.status}`)

  const frontmatterBlock = frontmatter.length ? `\n---\n${frontmatter.join('\n')}\n---\n` : ''

  const ingredients = recipe.ingredients
    .flatMap((group) => group.items)
    .map((i) => `- ${i}`)
    .join('\n')
  const instructions = recipe.instructions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')
  const notes = recipe.notes?.length
    ? `\n\n## Notes\n${recipe.notes.map((n) => `- ${n}`).join('\n')}`
    : ''
  return `${header}${frontmatterBlock}\n${ingredients}\n\n${instructions}${notes}`
}
