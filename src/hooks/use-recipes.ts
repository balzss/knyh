import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { shuffleArray } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Recipe, SortOption } from '@/lib/types'

type UseRecipesOptions = {
  // An array of recipe IDs to fetch. If undefined, all recipes are considered.
  ids?: string[]
  // The sorting strategy. Supports various options.
  sort?: SortOption
  // If true, returns only archived recipes. If false or undefined, returns only unarchived recipes.
  archived?: boolean
  // An array of tag IDs to filter by. Only recipes containing ALL specified tags will be returned.
  tags?: string[]
}

/**
 * A custom hook to fetch, filter, and sort recipes using TanStack Query.
 * @param options - Optional configuration for filtering and sorting.
 */
export const useRecipes = (options?: UseRecipesOptions) => {
  const {
    data: recipes,
    isLoading: loading,
    error,
  } = useQuery({
    // The query key uniquely identifies this data and includes filters for proper caching
    queryKey: ['recipes', { tags: options?.tags, archived: options?.archived }],

    // The query function handles the actual data fetching.
    queryFn: (): Promise<Recipe[]> => {
      const searchParams = new URLSearchParams()
      if (options?.archived !== undefined) {
        searchParams.set('archived', String(options.archived))
      }
      const query = searchParams.toString()
      return api<Recipe[]>(`/api/recipes${query ? `?${query}` : ''}`)
    },

    // The 'select' option transforms or selects a part of the data.
    // TanStack Query will memoize the result of this function, re-running it
    // only when the source data changes.
    select: (recipes: Recipe[]) => {
      if (options?.ids?.length === 0) {
        return
      }

      let filteredRecipes = recipes

      // Filter by specific IDs if provided
      if (options?.ids && options.ids.length > 0) {
        const idSet = new Set(options.ids)
        filteredRecipes = filteredRecipes.filter((recipe) => idSet.has(recipe.id))
      }

      // Filter by tags if provided - recipe must contain ALL specified tags
      if (options?.tags && options.tags.length > 0) {
        filteredRecipes = filteredRecipes.filter((recipe) =>
          options.tags!.every((tagId) => recipe.tags.some((tag) => tag.id === tagId))
        )
      }

      return filteredRecipes
    },
  })

  // The sorting is a "view concern" and is handled separately to avoid
  // re-shuffling/re-sorting on every render.
  const processedRecipes = useMemo(() => {
    if (!recipes) return []

    switch (options?.sort) {
      case 'random':
        // This shuffle will only re-run if the `recipes` array reference
        // or the sort option changes.
        return shuffleArray(recipes)
      case 'title-asc':
        return [...recipes].sort((a, b) => a.title.localeCompare(b.title))
      case 'title-desc':
        return [...recipes].sort((a, b) => b.title.localeCompare(a.title))
      case 'updated-asc':
        return [...recipes].sort((a, b) => {
          const dateA = new Date(a.updatedAt || 0).getTime()
          const dateB = new Date(b.updatedAt || 0).getTime()
          return dateA - dateB
        })
      case 'updated-desc':
        return [...recipes].sort((a, b) => {
          const dateA = new Date(a.updatedAt || 0).getTime()
          const dateB = new Date(b.updatedAt || 0).getTime()
          return dateB - dateA
        })
      default:
        return recipes
    }
  }, [recipes, options?.sort])

  return { recipes: processedRecipes, loading, error }
}
