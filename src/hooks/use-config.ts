'use client'

import { useQuery } from '@tanstack/react-query'
import type { UserConfig } from '@/lib/types'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { getLocalStorageData } from '@/lib/local-storage-data'
import { basePath } from '@/lib/utils'

export function useConfig() {
  return useQuery({
    queryKey: ['userConfig'],
    queryFn: async (): Promise<UserConfig> => {
      // Use different data sources based on build mode and runtime detection
      const shouldUseStaticJson = isStaticExport || isClientStaticExport()

      if (shouldUseStaticJson) {
        // Use localStorage data with username from JSON for static exports
        const data = await getLocalStorageData()
        return data.userConfig
      } else {
        // Use API endpoint for SQLite in dev/production
        const endpoint = `${basePath}/api/config`
        const response = await fetch(endpoint)
        if (!response.ok) {
          // Fallback to localStorage data if API is not available
          const data = await getLocalStorageData()
          return data.userConfig
        }
        return response.json()
      }
    },
  })
}
