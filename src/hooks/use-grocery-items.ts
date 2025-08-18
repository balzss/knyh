import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { localStorageGroceryItems } from '@/lib/local-storage-data'
import type { GroceryItem } from '@/lib/types'

/**
 * Hook to fetch grocery items
 */
export const useGroceryItems = () => {
  const {
    data: groceryItems,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['groceryItems'],
    queryFn: async (): Promise<GroceryItem[]> => {
      const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

      if (shouldUseLocalStorage) {
        return localStorageGroceryItems.getAll()
      } else {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const endpoint = `${basePath}/api/grocery-items`
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      }
    },
  })

  return { groceryItems: groceryItems || [], loading, error }
}

/**
 * Hook for grocery item mutations
 */
export const useGroceryItemMutations = () => {
  const queryClient = useQueryClient()
  const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

  const createGroceryItem = useMutation({
    mutationFn: async (item: Omit<GroceryItem, 'id'>) => {
      if (shouldUseLocalStorage) {
        const created = await localStorageGroceryItems.create([item])
        return created[0]
      } else {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const response = await fetch(`${basePath}/api/grocery-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        if (!response.ok) {
          throw new Error('Failed to create grocery item')
        }
        return response.json()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] })
    },
  })

  const updateGroceryItem = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Omit<GroceryItem, 'id'>>
    }) => {
      if (shouldUseLocalStorage) {
        return localStorageGroceryItems.update(id, updates)
      } else {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const response = await fetch(`${basePath}/api/grocery-items/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        if (!response.ok) {
          throw new Error('Failed to update grocery item')
        }
        return response.json()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] })
    },
  })

  const updateGroceryItemsOrder = useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      if (shouldUseLocalStorage) {
        return localStorageGroceryItems.updateOrder(items)
      } else {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const response = await fetch(`${basePath}/api/grocery-items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reorder', items }),
        })
        if (!response.ok) {
          throw new Error('Failed to reorder grocery items')
        }
        return response.json()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] })
    },
  })

  const deleteGroceryItem = useMutation({
    mutationFn: async (id: string) => {
      if (shouldUseLocalStorage) {
        return localStorageGroceryItems.delete(id)
      } else {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const response = await fetch(`${basePath}/api/grocery-items/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete grocery item')
        }
        return response.json()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] })
    },
  })

  const deleteGroceryItems = useMutation({
    mutationFn: async (ids: string[]) => {
      if (shouldUseLocalStorage) {
        return localStorageGroceryItems.deleteMany(ids)
      } else {
        // Delete items one by one via API
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
        await Promise.all(
          ids.map((id) => fetch(`${basePath}/api/grocery-items/${id}`, { method: 'DELETE' }))
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groceryItems'] })
    },
  })

  return {
    createGroceryItem,
    updateGroceryItem,
    updateGroceryItemsOrder,
    deleteGroceryItem,
    deleteGroceryItems,
  }
}
