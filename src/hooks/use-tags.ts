import { useEffect, useState } from 'react'
import type { Tag } from '@/lib/types'

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const tagsJsonPath = '/knyh/data/tags.json'

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(tagsJsonPath)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Tag[] = await response.json()
        setTags(data)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [tagsJsonPath])

  return { tags, loading, error }
}
