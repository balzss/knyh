import { useQuery } from '@tanstack/react-query'
import type { Tag } from '@/lib/types'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const tagsJsonPath = `${basePath}/data/tags.json`

export const useTags = () => {
  const {
    data: tags,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['tags'],

    queryFn: async (): Promise<Tag[]> => {
      const response = await fetch(tagsJsonPath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },
  })

  return { tags: tags ?? [], loading, error }
}
