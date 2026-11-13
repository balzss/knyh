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
    onPointerDown: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerCancel: (e: React.PointerEvent) => void
  }
  wasLongPress: () => boolean
  cancel: () => void
}

// A press that starts on a control, or inside a menu rendered through a portal, is not a long press on the
// container. Opening a menu also swallows the pointer-up, so the timer would otherwise fire and select the card.
const IGNORED_TARGETS = 'button, [role="menu"], [role="menuitem"], [role="dialog"]'

export function useLongPress(
  callback: () => void,
  { delay = 500, enabled = true }: UseLongPressOptions = {}
): UseLongPressReturn {
  const timeoutRef = useRef<number | null>(null)
  const activatedRef = useRef(false)
  const startTimeRef = useRef<number>(0)

  const clear = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    startTimeRef.current = 0
  }, [])

  const start = useCallback(
    (e?: React.TouchEvent | React.PointerEvent) => {
      if (!enabled) return
      if (e?.target instanceof Element && e.target.closest(IGNORED_TARGETS)) return
      activatedRef.current = false
      startTimeRef.current = Date.now()
      clear()
      timeoutRef.current = window.setTimeout(() => {
        activatedRef.current = true
        callback()
      }, delay)
    },
    [callback, delay, enabled, clear]
  )

  const end = useCallback(
    (e: React.TouchEvent | React.PointerEvent) => {
      if (!enabled) return
      const pressDuration = startTimeRef.current ? Date.now() - startTimeRef.current : 0
      clear()

      // If we had a long press or we're close to it, prevent default behavior
      if (activatedRef.current || pressDuration >= delay * 0.9) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [enabled, clear, delay]
  )

  const cancel = useCallback(
    (e?: React.TouchEvent | React.PointerEvent) => {
      if (!enabled) return
      clear()
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [enabled, clear]
  )

  const wasLongPress = useCallback(() => {
    return activatedRef.current
  }, [])

  // Reset the long press state after a short delay to handle subsequent clicks
  useEffect(() => {
    if (activatedRef.current) {
      const resetTimeout = setTimeout(() => {
        activatedRef.current = false
      }, 100)
      return () => clearTimeout(resetTimeout)
    }
  }, [])

  useEffect(() => () => clear(), [clear])

  return {
    bind: {
      onTouchStart: start,
      onTouchEnd: end,
      onTouchCancel: cancel,
      onPointerDown: start,
      onPointerUp: end,
      onPointerCancel: cancel,
    },
    wasLongPress,
    cancel: clear,
  }
}
