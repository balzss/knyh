import type { Recipe } from '@shared/types'

export type ContentMatchKind = 'ingredient' | 'instruction' | 'note'

export type ContentMatch = {
  kind: ContentMatchKind
  text: string
}

export type SearchResults = {
  readyTitleMatches: Recipe[]
  developmentTitleMatches: Recipe[]
  /** Recipes whose title doesn't match but whose ingredients, instructions or notes do */
  contentMatches: Array<{ recipe: Recipe; match: ContentMatch }>
}

// Regex to strip diacritical marks for accent-insensitive search
const diacriticsRegex = /[̀-ͯ]/g
const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(diacriticsRegex, '')

function findContentMatch(recipe: Recipe, term: string): ContentMatch | undefined {
  const matches = (text: string) => normalize(text).includes(term)

  for (const group of recipe.ingredients) {
    const text = group.items.find(matches)
    if (text) return { kind: 'ingredient', text }
  }
  const instruction = recipe.instructions.find(matches)
  if (instruction) return { kind: 'instruction', text: instruction }
  const note = recipe.notes.find(matches)
  if (note) return { kind: 'note', text: note }
}

/**
 * Splits recipes into search result groups. A recipe lands in one group only:
 * a title match wins over a content match. Input order is kept within each group,
 * except that titles starting with the query come first.
 */
export function searchRecipes(recipes: Recipe[], query: string): SearchResults {
  const term = normalize(query.trim())
  const results: SearchResults = {
    readyTitleMatches: [],
    developmentTitleMatches: [],
    contentMatches: [],
  }
  if (!term) return results

  const prefixRank = (recipe: Recipe) => (normalize(recipe.title).startsWith(term) ? 0 : 1)
  const byPrefix = (a: Recipe, b: Recipe) => prefixRank(a) - prefixRank(b)

  for (const recipe of recipes) {
    if (normalize(recipe.title).includes(term)) {
      const group =
        recipe.status === 'ready' ? results.readyTitleMatches : results.developmentTitleMatches
      group.push(recipe)
      continue
    }
    const match = findContentMatch(recipe, term)
    if (match) results.contentMatches.push({ recipe, match })
  }

  // Array.prototype.sort is stable, so the user's chosen sort survives within a rank
  results.readyTitleMatches.sort(byPrefix)
  results.developmentTitleMatches.sort(byPrefix)
  return results
}
