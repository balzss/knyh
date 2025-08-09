'use client'

import { useQuery } from '@tanstack/react-query'
import type { DatabaseSchema } from '@/lib/types'
import { clientDataPath } from '@/lib/utils'

export function useConfig() {
  return useQuery({
    queryKey: ['userConfig'],
    queryFn: async () => {
      const response = await fetch(clientDataPath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },
    select: ({ userConfig }: DatabaseSchema) => {
      return userConfig
    },
  })
}
