import { useState, useEffect } from 'react'
import { Recipe } from '@/lib/data'

const recipesJsonPath = '/knyh/data/recipes.json'

type UseRecipesParams = {
  ids?: string[]
}

type UseRecipesReturn = {
  recipes: Recipe[] | null
  loading: boolean
  error: Error | null
}

function useRecipes({ ids }: UseRecipesParams = {}): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(recipesJsonPath, { signal })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.warn(`Received non-JSON content type: ${contentType} from ${recipesJsonPath}`)
          throw new TypeError('Received non-JSON response')
        }

        const data: Recipe[] = await response.json()
        const filteredData = ids ? data.filter((r) => ids.includes(r.id)) : data
        setRecipes(filteredData)
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

  return { recipes, loading, error }
}

export { useRecipes }
