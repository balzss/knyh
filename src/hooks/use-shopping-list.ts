import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { localStorageShoppingList } from '@/lib/local-storage-data'
import { basePath } from '@/lib/utils'
import type { ShoppingListItem } from '@/lib/types'

/**
 * Hook to fetch shopping list items
 */
export const useShoppingList = () => {
  const {
    data: shoppingList,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['shoppingList'],
    queryFn: async (): Promise<ShoppingListItem[]> => {
      const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

      if (shouldUseLocalStorage) {
        return localStorageShoppingList.getAll()
      } else {
        const endpoint = `${basePath}/api/shopping-list`
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      }
    },
  })

  return { shoppingList: shoppingList || [], loading, error }
}

/**
 * Hook for shopping list mutations
 */
export const useShoppingListMutations = () => {
  const queryClient = useQueryClient()
  const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

  const updateShoppingList = useMutation({
    mutationFn: async (items: ShoppingListItem[]) => {
      if (shouldUseLocalStorage) {
        return localStorageShoppingList.update(items)
      } else {
        const response = await fetch(`${basePath}/api/shopping-list`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })
        if (!response.ok) {
          throw new Error('Failed to update shopping list')
        }
        return response.json()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
    },
  })

  return {
    updateShoppingList,
  }
}
