import { useQuery } from '@tanstack/react-query'
import type { Tag } from '@/lib/types'
import { useCallback } from 'react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const tagsJsonPath = `${basePath}/data/tags.json`

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

    queryFn: async (): Promise<Tag[]> => {
      const response = await fetch(tagsJsonPath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    select: useCallback(
      (allTags: Tag[]) => {
        if (!ids || ids.length === 0) {
          return allTags // Return all tags if no IDs are provided
        }
        // Create a Set for efficient O(1) lookups
        const idSet = new Set(ids)
        return allTags.filter((tag) => idSet.has(tag.id))
      },
      [ids]
    ),
  })

  return { tags: tags ?? [], loading, error }
}
