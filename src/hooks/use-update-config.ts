import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { UserConfig } from '@/lib/types'

export function useUpdateConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Partial<UserConfig>) =>
      api<UserConfig>('/api/config', { method: 'PATCH', json: updates }),
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(['userConfig'], updatedConfig)
    },
  })
}
