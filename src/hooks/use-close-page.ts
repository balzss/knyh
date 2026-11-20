import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** Closes a detail page: back when the app has history to go back to, else home. */
export function useClosePage() {
  const navigate = useNavigate()
  const { key } = useLocation()

  return useCallback(() => {
    // 'default' is the key of the first entry, so there is nothing in the app to go back to
    if (key !== 'default') navigate(-1)
    else navigate('/', { replace: true })
  }, [navigate, key])
}
