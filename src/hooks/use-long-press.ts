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
    onContextMenu: (e: React.MouseEvent) => void
    style: React.CSSProperties
  }
  wasLongPress: () => boolean
  cancel: () => void
}

// A press that starts on a control, or inside a menu rendered through a portal, is not a long press on the
// container. Opening a menu also swallows the pointer-up, so the timer would otherwise fire and select the card.
// Only matches inside the container count: the container itself may live in a dialog, like the mobile sidebar.
const IGNORED_TARGETS = 'button, [role="menu"], [role="menuitem"], [role="dialog"]'

export function useLongPress(
  callback: () => void,
  { delay = 500, enabled = true }: UseLongPressOptions = {}
): UseLongPressReturn {
  const timeoutRef = useRef<number | null>(null)
  const activatedRef = useRef(false)
  const startTimeRef = useRef<number>(0)
  const isTouchRef = useRef(false)

  const clear = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    startTimeRef.current = 0
  }, [])

  const start = useCallback(
    (e?: React.TouchEvent | React.PointerEvent) => {
      if (!enabled) return
      if (e && 'pointerType' in e) isTouchRef.current = e.pointerType === 'touch'
      else if (e) isTouchRef.current = true
      if (e && !isTouchRef.current) return
      if (e?.target instanceof Element) {
        const container = e.currentTarget
        // Portaled content bubbles through React but sits outside the container in the DOM
        if (!container.contains(e.target)) return
        const ignored = e.target.closest(IGNORED_TARGETS)
        if (ignored && container.contains(ignored)) return
      }
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

  // Touch long presses on links open the browser's own link menu (Android) or preview (iOS), which hides
  // ours. Mouse right-clicks keep the native menu.
  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (enabled && isTouchRef.current) e.preventDefault()
    },
    [enabled]
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
      onContextMenu,
      style: enabled ? { WebkitTouchCallout: 'none' } : {},
    },
    wasLongPress,
    cancel: clear,
  }
}
