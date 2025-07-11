import { useEffect, useMemo, useState } from 'react'
import { Recipe } from '@/lib/data'

type UseRecipesOptions = {
  // An array of recipe IDs to fetch. If undefined, all recipes are considered.
  ids?: string[]
  // The sorting strategy. Currently supports 'random'.
  sort?: 'random'
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm for an unbiased result.
 * It returns a new shuffled array to maintain immutability.
 * @param array The array to shuffle.
 * @returns A new array with the elements shuffled randomly.
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array] // Create a shallow copy
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]] // Swap elements
  }
  return newArray
}

/**
 * A custom hook to fetch, filter, and sort recipes.
 * @param options - Optional configuration for filtering and sorting.
 */
export const useRecipes = (options?: UseRecipesOptions) => {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const recipesJsonPath = '/knyh/data/recipes.json' // Path to the recipe data

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(recipesJsonPath)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Recipe[] = await response.json()
        setAllRecipes(data)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [recipesJsonPath]) // Effect runs only once on component mount

  // useMemo ensures that filtering and sorting are only re-calculated
  // when the source data or options change, optimizing performance.
  const processedRecipes = useMemo(() => {
    let recipes = [...allRecipes]

    // 1. Filter by specific IDs if provided
    if (options?.ids && options.ids.length > 0) {
      const idSet = new Set(options.ids)
      recipes = recipes.filter((recipe) => idSet.has(recipe.id))
    }

    // 2. Apply sorting strategies
    switch (options?.sort) {
      case 'random':
        return shuffleArray(recipes)
      // Future sorting methods like 'alphabetical' could be added here
      // case 'alphabetical':
      //   return recipes.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return recipes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRecipes, options?.sort, JSON.stringify(options?.ids)])

  return { recipes: processedRecipes, loading, error }
}
