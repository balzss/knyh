import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { UserConfig } from '@/lib/types'

export function useConfig() {
  return useQuery({
    queryKey: ['userConfig'],
    queryFn: () => api<UserConfig>('/api/config'),
  })
}
