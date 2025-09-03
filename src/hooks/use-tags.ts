import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { getLocalStorageData } from '@/lib/local-storage-data'
import { basePath } from '@/lib/utils'
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

    queryFn: async (): Promise<Tag[]> => {
      // Use different data sources based on build mode and runtime detection
      const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

      if (shouldUseLocalStorage) {
        // Use localStorage for static exports (supports mutations)
        const data = await getLocalStorageData()
        return data.tags
      } else {
        // Use API endpoint for SQLite in dev/production
        const endpoint = `${basePath}/api/tags`
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      }
    },

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
