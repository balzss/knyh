import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientDataPath } from '@/lib/utils'
import { isStaticExport } from '@/lib/data-config'
import type { DatabaseSchema } from '@/lib/types'

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

    queryFn: async (): Promise<DatabaseSchema> => {
      // Use different endpoints based on build mode
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
      const endpoint = isStaticExport
        ? clientDataPath // Static JSON file for static exports
        : `${basePath}/api/data` // API endpoint for SQLite in dev/production

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    select: useCallback(
      ({ tags }: DatabaseSchema) => {
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
