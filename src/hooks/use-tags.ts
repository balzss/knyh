import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Tag } from '@/lib/types'

type UseTagsProps = {
  ids?: string[]
}

export const useTags = ({ ids }: UseTagsProps = {}) => {
  const {
    data: tags,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['tags'],

    queryFn: () => api<Tag[]>('/api/tags'),

    select: useCallback(
      (tags: Tag[]) => {
        if (!ids) {
          return tags // Return all tags if no IDs are provided
        }
        if (ids.length === 0) {
          return []
        }
        // Create a Set for efficient O(1) lookups
        const idSet = new Set(ids)
        return tags.filter((tag) => idSet.has(tag.id))
      },
      [ids]
    ),
  })

  return { tags: tags ?? [], loading, error }
}
