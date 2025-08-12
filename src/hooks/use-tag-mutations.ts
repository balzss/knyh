import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Tag } from '@/lib/types'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const apiUrl = `${basePath}/api/tags`

type CreateTagPayload = { displayName: string }
type RenameTagPayload = { id: string; displayName: string }

export const useTagMutations = () => {
  const queryClient = useQueryClient()

  const invalidateTagsQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['tags'] })
  }

  const createTag = useMutation({
    mutationFn: async (payload: CreateTagPayload): Promise<Tag> => {
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
    },
    onSuccess: invalidateTagsQuery,
  })

  const renameTag = useMutation({
    mutationFn: async ({ id, displayName }: RenameTagPayload): Promise<Tag> => {
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
    },
    onSuccess: () => {
      invalidateTagsQuery()
      // Recipes referencing this tag's id don't need invalidation because only label changed.
    },
  })

  const deleteTag = useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete tag')
      }
      return response.json()
    },
    onSuccess: () => {
      invalidateTagsQuery()
      // Recipes updated on server -> invalidate recipes query as well
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  return { createTag, renameTag, deleteTag }
}
