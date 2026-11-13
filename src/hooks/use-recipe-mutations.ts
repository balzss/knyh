import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Recipe } from '@/lib/types'

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

  // A helper to invalidate the recipes query after any successful mutation
  const invalidateRecipesQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['recipes'] })
  }

  const createRecipe = useMutation({
    mutationFn: (payload: CreateRecipePayload | CreateRecipePayload[]) =>
      api<Recipe[]>('/api/recipes', {
        method: 'POST',
        json: Array.isArray(payload) ? payload : [payload],
      }),
    onSuccess: invalidateRecipesQuery,
  })

  const updateRecipe = useMutation({
    mutationFn: ({ id, data }: UpdateRecipePayload) =>
      api<Recipe>(`/api/recipes/${id}`, { method: 'PUT', json: data }),
    onSuccess: invalidateRecipesQuery,
  })

  const updateRecipes = useMutation({
    mutationFn: ({ ids, data }: UpdateRecipesPayload) =>
      api<Recipe[]>('/api/recipes', { method: 'PATCH', json: { ids, data } }),
    onSuccess: invalidateRecipesQuery,
  })

  const deleteRecipe = useMutation({
    mutationFn: (recipeId: string) =>
      api<{ message: string }>(`/api/recipes/${recipeId}`, { method: 'DELETE' }),
    onSuccess: invalidateRecipesQuery,
  })

  const deleteRecipes = useMutation({
    mutationFn: async (ids: string[]): Promise<string[]> => {
      await Promise.all(ids.map((id) => api(`/api/recipes/${id}`, { method: 'DELETE' })))
      return ids
    },
    onSuccess: invalidateRecipesQuery,
  })

  return { createRecipe, updateRecipe, updateRecipes, deleteRecipe, deleteRecipes }
}
