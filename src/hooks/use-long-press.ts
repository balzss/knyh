import { useCallback, useRef, useEffect } from 'react'

interface UseLongPressOptions {
  delay?: number
  enabled?: boolean
}

interface UseLongPressReturn {
  bind: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
    onTouchCancel: (e: React.TouchEvent) => void
  }
  wasLongPress: () => boolean
  cancel: () => void
}

export function useLongPress(
  callback: () => void,
  { delay = 500, enabled = true }: UseLongPressOptions = {}
): UseLongPressReturn {
  const timeoutRef = useRef<number | null>(null)
  const activatedRef = useRef(false)

  const clear = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  const start = useCallback(() => {
    if (!enabled) return
    activatedRef.current = false
    clear()
    timeoutRef.current = window.setTimeout(() => {
      activatedRef.current = true
      callback()
    }, delay)
  }, [callback, delay, enabled, clear])

  const end = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return
      clear()
      if (activatedRef.current) {
        // Suppress the following click/navigation after a long press
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [enabled, clear]
  )

  useEffect(() => () => clear(), [clear])

  return {
    bind: {
      onTouchStart: start,
      onTouchEnd: end,
      onTouchCancel: clear,
    },
    wasLongPress: () => activatedRef.current,
    cancel: clear,
  }
}
