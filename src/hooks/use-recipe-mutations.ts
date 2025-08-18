import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { localStorageRecipes } from '@/lib/local-storage-data'
import type { Recipe } from '@/lib/types'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const apiUrl = `${basePath}/api/recipes`

// The type for creating a recipe (all fields except the server-generated id)
type CreateRecipePayload = Omit<Recipe, 'id'>

// The type for updating a recipe
type UpdateRecipePayload = {
  id: string
  data: CreateRecipePayload
}

type UpdateRecipesPayload = {
  ids: string[]
  data: Partial<CreateRecipePayload>
}

export const useRecipeMutations = () => {
  const queryClient = useQueryClient()

  // Helper to determine if we should use localStorage
  const shouldUseLocalStorage = () => isStaticExport || isClientStaticExport()

  // A helper to invalidate the recipes query after any successful mutation
  const invalidateRecipesQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['recipes'] })
  }

  // CREATE mutation
  const createRecipe = useMutation({
    mutationFn: async (payload: CreateRecipePayload | CreateRecipePayload[]): Promise<Recipe[]> => {
      if (shouldUseLocalStorage()) {
        // Use localStorage for static exports
        const recipes = Array.isArray(payload) ? payload : [payload]
        return localStorageRecipes.create(recipes)
      } else {
        // Use API for SQLite mode
        const body = Array.isArray(payload) ? payload : [payload]

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to create recipe(s)')
        }

        return response.json()
      }
    },
    onSuccess: invalidateRecipesQuery,
  })

  // UPDATE mutation
  const updateRecipe = useMutation({
    mutationFn: async ({ id, data }: UpdateRecipePayload): Promise<Recipe> => {
      if (shouldUseLocalStorage()) {
        // Use localStorage for static exports
        return localStorageRecipes.update(id, data)
      } else {
        // Use API for SQLite mode
        const response = await fetch(`${apiUrl}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          throw new Error('Failed to update recipe')
        }
        return response.json()
      }
    },
    onSuccess: invalidateRecipesQuery,
  })

  // BULK UPDATE mutation
  const updateRecipes = useMutation({
    mutationFn: async ({ ids, data }: UpdateRecipesPayload): Promise<Recipe[]> => {
      if (shouldUseLocalStorage()) {
        // Use localStorage for static exports
        return localStorageRecipes.updateMany(ids, data)
      } else {
        // Use API for SQLite mode
        const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, data }),
        })
        if (!response.ok) {
          throw new Error('Failed to update recipes')
        }
        return response.json()
      }
    },
    onSuccess: invalidateRecipesQuery,
  })

  // DELETE mutation
  const deleteRecipe = useMutation({
    mutationFn: async (recipeId: string): Promise<{ message: string }> => {
      if (shouldUseLocalStorage()) {
        // Use localStorage for static exports
        await localStorageRecipes.delete(recipeId)
        return { message: 'Recipe deleted successfully' }
      } else {
        // Use API for SQLite mode
        const response = await fetch(`${apiUrl}/${recipeId}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete recipe')
        }
        return response.json()
      }
    },
    onSuccess: invalidateRecipesQuery,
  })

  // BULK DELETE mutation (fallback to multiple single deletes until API supports batch)
  const deleteRecipes = useMutation({
    mutationFn: async (ids: string[]): Promise<string[]> => {
      if (shouldUseLocalStorage()) {
        // Use localStorage for static exports
        await localStorageRecipes.deleteMany(ids)
        return ids
      } else {
        // Use API for SQLite mode
        await Promise.all(
          ids.map(async (id) => {
            const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
            if (!response.ok) throw new Error('Failed to delete recipe')
            // ignore body (or could await response.json())
          })
        )
        return ids
      }
    },
    onSuccess: () => {
      invalidateRecipesQuery()
    },
  })

  return { createRecipe, updateRecipe, updateRecipes, deleteRecipe, deleteRecipes }
}
