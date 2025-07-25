import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Recipe } from '@/lib/types'

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
    mutationFn: async (payload: CreateRecipePayload): Promise<Recipe> => {
      const response = await fetch('/knyh/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Failed to create recipe')
      }
      return response.json()
    },
    onSuccess: invalidateRecipesQuery,
  })

  // UPDATE mutation
  const updateRecipe = useMutation({
    mutationFn: async ({ id, data }: UpdateRecipePayload): Promise<Recipe> => {
      const response = await fetch(`/knyh/api/recipes/${id}`, {
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
      const response = await fetch(`/knyh/api/recipes/${recipeId}`, {
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
