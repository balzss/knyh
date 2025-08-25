'use client'

import { useQuery } from '@tanstack/react-query'
import type { DatabaseSchema } from '@/lib/types'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { getLocalStorageData } from '@/lib/local-storage-data'
import { basePath } from '@/lib/utils'

export function useConfig() {
  return useQuery({
    queryKey: ['userConfig'],
    queryFn: async (): Promise<DatabaseSchema> => {
      // Use different data sources based on build mode and runtime detection
      const shouldUseStaticJson = isStaticExport || isClientStaticExport()

      if (shouldUseStaticJson) {
        // Use localStorage data with username from JSON for static exports
        return getLocalStorageData()
      } else {
        // Use API endpoint for SQLite in dev/production
        const endpoint = `${basePath}/api/data`
        const response = await fetch(endpoint)
        if (!response.ok) {
          // Fallback to localStorage data if API is not available
          return getLocalStorageData()
        }
        return response.json()
      }
    },
    select: ({ userConfig }: DatabaseSchema) => {
      return userConfig
    },
  })
}
