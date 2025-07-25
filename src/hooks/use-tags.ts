import { useQuery } from '@tanstack/react-query'
import type { Tag } from '@/lib/types'

export const useTags = () => {
  const {
    data: tags,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['tags'],

    queryFn: async (): Promise<Tag[]> => {
      const response = await fetch('/knyh/data/tags.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },
  })

  return { tags: tags ?? [], loading, error }
}
