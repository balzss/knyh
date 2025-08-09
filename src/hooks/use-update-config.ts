'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserConfig } from '@/lib/types'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const apiUrl = `${basePath}/api/config`

export function useUpdateConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<UserConfig>) => {
      const res = await fetch(apiUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update config')
      return res.json()
    },
    onSuccess: (data) => {
      // Update the cached config
      queryClient.setQueryData(['userConfig'], data)
    },
  })
}
