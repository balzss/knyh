import { useState, useEffect } from 'react'
import { Tag } from '@/lib/data'

const tagsJsonPath = '/knyh/data/tags.json'

type UseTagsReturn = {
  tags: Tag[] | null
  loading: boolean
  error: Error | null
}

function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(tagsJsonPath, { signal })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.warn(`Received non-JSON content type: ${contentType} from ${tagsJsonPath}`)
          throw new TypeError('Received non-JSON response')
        }

        const data = await response.json()
        setTags(data)
      } catch (err) {
        if (err instanceof Error) {
          // Type guard for error
          if (err.name === 'AbortError') {
            console.log('Fetch aborted')
          } else {
            console.error('Failed to fetch JSON:', err)
            setError(err)
          }
        } else {
          // Handle cases where the caught object is not an Error instance
          console.error('An unknown error occurred during fetch:', err)
          setError(new Error('An unknown error occurred'))
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      controller.abort()
      setLoading(false)
    }
  }, [])

  return { tags, loading, error }
}

export { useTags }
