import { useMutation, useQueryClient } from '@tanstack/react-query'
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

export const useRecipeMutations = () => {
  const queryClient = useQueryClient()

  // A helper to invalidate the recipes query after any successful mutation
  const invalidateRecipesQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['recipes'] })
  }

  // CREATE mutation
  const createRecipe = useMutation({
    mutationFn: async (payload: CreateRecipePayload | CreateRecipePayload[]): Promise<Recipe[]> => {
      // Ensure the body is always an array to match the API contract
      const body = Array.isArray(payload) ? payload : [payload]

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        // Pass along the specific error message from the API
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create recipe(s)')
      }

      // The API returns an array of the created recipes
      return response.json()
    },
    onSuccess: invalidateRecipesQuery,
  })

  // UPDATE mutation
  const updateRecipe = useMutation({
    mutationFn: async ({ id, data }: UpdateRecipePayload): Promise<Recipe> => {
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to update recipe')
      }
      return response.json()
    },
    onSuccess: invalidateRecipesQuery,
  })

  // DELETE mutation
  const deleteRecipe = useMutation({
    mutationFn: async (recipeId: string): Promise<{ message: string }> => {
      const response = await fetch(`${apiUrl}/${recipeId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }
      return response.json()
    },
    onSuccess: invalidateRecipesQuery,
  })

  return { createRecipe, updateRecipe, deleteRecipe }
}
