import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useEditMode } from '@/app/providers/EditModeProvider'
import type { ShoppingListItem } from '@shared/types'

/**
 * Hook to fetch shopping list items. The list is only readable in edit mode.
 */
export const useShoppingList = () => {
  const { editor } = useEditMode()
  const {
    data: shoppingList,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['shoppingList'],
    queryFn: () => api<ShoppingListItem[]>('/api/shopping-list'),
    enabled: editor,
    // Pick up changes made on another device while this one stays open
    refetchInterval: 5_000,
  })

  return { shoppingList: shoppingList || [], loading, error }
}

/**
 * Hook for shopping list mutations
 */
export const useShoppingListMutations = () => {
  const queryClient = useQueryClient()

  const updateShoppingList = useMutation({
    mutationFn: (items: ShoppingListItem[]) =>
      api<{ message: string }>('/api/shopping-list', { method: 'PUT', json: items }),
    onSuccess: (_data, variables) => {
      // Set cache directly instead of refetching to avoid overwriting
      // local state with stale server data during active editing
      queryClient.setQueryData(['shoppingList'], variables)
    },
  })

  return {
    updateShoppingList,
  }
}
