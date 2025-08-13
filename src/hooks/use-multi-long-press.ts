import { useCallback, useRef, useEffect } from 'react'

interface UseMultiLongPressOptions<T> {
  delay?: number
  enabled?: boolean
  onActivate: (id: T) => void
}

interface MultiHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onTouchCancel: (e: React.TouchEvent) => void
}

export function useMultiLongPress<T extends string | number>({
  delay = 500,
  enabled = true,
  onActivate,
}: UseMultiLongPressOptions<T>) {
  const timeoutRef = useRef<number | null>(null)
  const activatedIdRef = useRef<T | null>(null)

  const clear = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const start = useCallback(
    (id: T) => () => {
      if (!enabled) return
      activatedIdRef.current = null
      clear()
      timeoutRef.current = window.setTimeout(() => {
        activatedIdRef.current = id
        onActivate(id)
      }, delay)
    },
    [clear, delay, enabled, onActivate]
  )

  const end = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return
      clear()
      if (activatedIdRef.current !== null) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [clear, enabled]
  )

  useEffect(() => () => clear(), [clear])

  const getHandlers = useCallback(
    (id: T): MultiHandlers => ({
      onTouchStart: start(id),
      onTouchEnd: end,
      onTouchCancel: clear,
    }),
    [start, end, clear]
  )

  const wasLongPress = useCallback((id: T) => activatedIdRef.current === id, [])

  return { getHandlers, wasLongPress }
}
