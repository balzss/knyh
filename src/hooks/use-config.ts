'use client'

import { useQuery } from '@tanstack/react-query'
import type { DatabaseSchema } from '@/lib/types'
import { clientDataPath } from '@/lib/utils'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { getLocalStorageData } from '@/lib/local-storage-data'

export function useConfig() {
  return useQuery({
    queryKey: ['userConfig'],
    queryFn: async (): Promise<DatabaseSchema> => {
      // Use different data sources based on build mode and runtime detection
      const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

      if (shouldUseLocalStorage) {
        // Use localStorage for static exports (supports mutations)
        return getLocalStorageData()
      } else {
        // Use API endpoint for SQLite in dev/production
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const endpoint = `${basePath}/api/data`
        const response = await fetch(endpoint)
        if (!response.ok) {
          // Fallback to static JSON if API is not available
          const fallbackResponse = await fetch(clientDataPath)
          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error! status: ${fallbackResponse.status}`)
          }
          return fallbackResponse.json()
        }
        return response.json()
      }
    },
    select: ({ userConfig }: DatabaseSchema) => {
      return userConfig
    },
  })
}
