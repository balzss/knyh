import { useState, useEffect, useRef } from 'react'
import { Recipe } from '@/lib/data'

const recipesJsonPath = '/knyh/data/recipes.json'

type SortOrder = 'default' | 'random'

type UseRecipesParams = {
  ids?: string[]
  sort?: SortOrder
}

type UseRecipesReturn = {
  recipes: Recipe[] | null
  loading: boolean
  error: Error | null
}

function fisherYatesShuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

function useRecipes({ ids, sort = 'default' }: UseRecipesParams = {}): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const allRecipesRef = useRef<Recipe[] | null>(null)

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
        allRecipesRef.current = data

        let processedData = ids ? data.filter((r) => ids.includes(r.id)) : data

        if (sort === 'random') {
          processedData = fisherYatesShuffle([...processedData])
        }

        setRecipes(processedData)
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            console.log('Fetch aborted')
          } else {
            console.error('Failed to fetch JSON:', err)
            setError(err)
          }
        } else {
          console.error('An unknown error occurred during fetch:', err)
          setError(new Error('An unknown error occurred'))
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    }

    if (!allRecipesRef.current || !ids) {
      fetchData()
    } else {
      let processedData = ids
        ? allRecipesRef.current.filter((r) => ids.includes(r.id))
        : allRecipesRef.current

      if (sort === 'random') {
        processedData = fisherYatesShuffle([...processedData])
      }
      setRecipes(processedData)
      setLoading(false)
    }

    return () => {
      controller.abort()
    }
  }, [ids, sort])

  return { recipes, loading, error }
}

export { useRecipes }
