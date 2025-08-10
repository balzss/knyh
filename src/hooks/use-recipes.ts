import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { shuffleArray, clientDataPath } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

type UseRecipesOptions = {
  // An array of recipe IDs to fetch. If undefined, all recipes are considered.
  ids?: string[]
  // The sorting strategy. Currently supports 'random'.
  sort?: 'random'
  // If true, returns only archived recipes. If false or undefined, returns only unarchived recipes.
  archived?: boolean
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
    // The query key uniquely identifies this data. Since the source is static,
    // a simple key is sufficient.
    queryKey: ['recipes'],

    // The query function handles the actual data fetching.
    queryFn: async (): Promise<DatabaseSchema> => {
      const response = await fetch(clientDataPath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // The 'select' option transforms or selects a part of the data.
    // TanStack Query will memoize the result of this function, re-running it
    // only when the source data changes.
    select: ({ recipes }: DatabaseSchema) => {
      if (options?.ids?.length === 0) {
        return
      }

      if (options?.ids && options.ids.length > 0) {
        const idSet = new Set(options.ids)
        return recipes.filter((recipe) => idSet.has(recipe.id))
      }

      return recipes.filter((recipe) => !!options?.archived === !!recipe.archived)
    },
  })

  // The random sort is a "view concern" and is handled separately to avoid
  // re-shuffling on every render.
  const processedRecipes = useMemo(() => {
    if (!recipes) return []

    switch (options?.sort) {
      case 'random':
        // This shuffle will only re-run if the `recipes` array reference
        // or the sort option changes.
        return shuffleArray(recipes)
      default:
        return recipes
    }
  }, [recipes, options?.sort])

  return { recipes: processedRecipes, loading, error }
}
