import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { shuffleArray } from '@/lib/utils'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { getLocalStorageData } from '@/lib/local-storage-data'
import type { DatabaseSchema } from '@/lib/types'

export type SortOption = 'random' | 'title-asc' | 'title-desc' | 'updated-asc' | 'updated-desc'

type UseRecipesOptions = {
  // An array of recipe IDs to fetch. If undefined, all recipes are considered.
  ids?: string[]
  // The sorting strategy. Supports various options.
  sort?: SortOption
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
      // Use different data sources based on build mode and runtime detection
      const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

      if (shouldUseLocalStorage) {
        // Use localStorage for static exports (supports mutations)
        return getLocalStorageData()
      } else {
        // Use API endpoint for SQLite in dev/production
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const endpoint = `${basePath}/api/data`
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      }
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
          const dateA = new Date(a.lastModified || 0).getTime()
          const dateB = new Date(b.lastModified || 0).getTime()
          return dateA - dateB
        })
      case 'updated-desc':
        return [...recipes].sort((a, b) => {
          const dateA = new Date(a.lastModified || 0).getTime()
          const dateB = new Date(b.lastModified || 0).getTime()
          return dateB - dateA
        })
      default:
        return recipes
    }
  }, [recipes, options?.sort])

  return { recipes: processedRecipes, loading, error }
}
