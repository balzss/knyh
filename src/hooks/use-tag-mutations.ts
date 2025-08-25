import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { localStorageTags } from '@/lib/local-storage-data'
import { basePath } from '@/lib/utils'
import type { Tag } from '@/lib/types'
const apiUrl = `${basePath}/api/tags`

type CreateTagPayload = { displayName: string }
type RenameTagPayload = { id: string; displayName: string }

export const useTagMutations = () => {
  const queryClient = useQueryClient()

  // Helper to determine if we should use localStorage
  const shouldUseLocalStorage = () => isStaticExport || isClientStaticExport()

  const invalidateTagsQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['tags'] })
  }

  const createTag = useMutation({
    mutationFn: async (payload: CreateTagPayload): Promise<Tag> => {
      if (shouldUseLocalStorage()) {
        // Use localStorage for static exports
        return localStorageTags.create(payload.displayName)
      } else {
        // Use API for SQLite mode
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to create tag')
        }
        return response.json()
      }
    },
    onSuccess: invalidateTagsQuery,
  })

  const renameTag = useMutation({
    mutationFn: async ({ id, displayName }: RenameTagPayload): Promise<Tag> => {
      if (shouldUseLocalStorage()) {
        // Use localStorage for static exports
        return localStorageTags.update(id, displayName)
      } else {
        // Use API for SQLite mode
        const response = await fetch(`${apiUrl}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName }),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to rename tag')
        }
        return response.json()
      }
    },
    onSuccess: () => {
      invalidateTagsQuery()
      // Recipes referencing this tag's id don't need invalidation because only label changed.
    },
  })

  const deleteTag = useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      if (shouldUseLocalStorage()) {
        // Use localStorage for static exports
        await localStorageTags.delete(id)
        return { message: 'Tag deleted successfully' }
      } else {
        // Use API for SQLite mode
        const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to delete tag')
        }
        return response.json()
      }
    },
    onSuccess: () => {
      invalidateTagsQuery()
      // Recipes updated on server -> invalidate recipes query as well
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  return { createTag, renameTag, deleteTag }
}
