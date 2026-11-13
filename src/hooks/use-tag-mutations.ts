import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Tag } from '@/lib/types'

type CreateTagPayload = { displayName: string }
type RenameTagPayload = { id: string; displayName: string }

export const useTagMutations = () => {
  const queryClient = useQueryClient()

  const invalidateTagsQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['tags'] })
  }

  const createTag = useMutation({
    mutationFn: (payload: CreateTagPayload) =>
      api<Tag>('/api/tags', { method: 'POST', json: payload }),
    onSuccess: invalidateTagsQuery,
  })

  const renameTag = useMutation({
    mutationFn: ({ id, displayName }: RenameTagPayload) =>
      api<Tag>(`/api/tags/${id}`, { method: 'PATCH', json: { displayName } }),
    onSuccess: () => {
      invalidateTagsQuery()
      // Every recipe carries its tags' names, so recipes that use this tag show the old name until refetched
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  const deleteTag = useMutation({
    mutationFn: (id: string) => api<{ message: string }>(`/api/tags/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      invalidateTagsQuery()
      // The tag is removed from every recipe that used it
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  return { createTag, renameTag, deleteTag }
}
