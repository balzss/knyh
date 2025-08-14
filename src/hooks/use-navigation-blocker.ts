'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useConfirmDialog } from './use-confirm-dialog'

interface NavigationBlockerOptions {
  shouldBlock: boolean
  message: {
    title: string
    description: string
    confirmText: string
    cancelText: string
  }
}

export function useNavigationBlocker({ shouldBlock, message }: NavigationBlockerOptions) {
  const router = useRouter()
  const { confirm } = useConfirmDialog()
  const originalPushRef = useRef(router.push)
  const originalBackRef = useRef(router.back)
  const originalReplaceRef = useRef(router.replace)
  const isBlockingRef = useRef(false)

  useEffect(() => {
    // Store original methods
    originalPushRef.current = router.push
    originalBackRef.current = router.back
    originalReplaceRef.current = router.replace

    // Override router methods when blocking is enabled
    if (shouldBlock && !isBlockingRef.current) {
      isBlockingRef.current = true

      // Override push
      router.push = async (href: string, options?: Record<string, unknown>) => {
        if (shouldBlock) {
          const shouldLeave = await confirm(message)
          if (shouldLeave) {
            isBlockingRef.current = false
            return originalPushRef.current.call(router, href, options)
          }
          return
        }
        return originalPushRef.current.call(router, href, options)
      }

      // Override back
      router.back = async () => {
        if (shouldBlock) {
          const shouldLeave = await confirm(message)
          if (shouldLeave) {
            isBlockingRef.current = false
            return originalBackRef.current.call(router)
          }
          return
        }
        return originalBackRef.current.call(router)
      }

      // Override replace
      router.replace = async (href: string, options?: Record<string, unknown>) => {
        if (shouldBlock) {
          const shouldLeave = await confirm(message)
          if (shouldLeave) {
            isBlockingRef.current = false
            return originalReplaceRef.current.call(router, href, options)
          }
          return
        }
        return originalReplaceRef.current.call(router, href, options)
      }
    }

    // Restore original methods when blocking is disabled
    if (!shouldBlock && isBlockingRef.current) {
      isBlockingRef.current = false
      router.push = originalPushRef.current
      router.back = originalBackRef.current
      router.replace = originalReplaceRef.current
    }

    // Cleanup function
    return () => {
      if (isBlockingRef.current) {
        router.push = originalPushRef.current
        router.back = originalBackRef.current
        router.replace = originalReplaceRef.current
        isBlockingRef.current = false
      }
    }
  }, [shouldBlock, router, confirm, message])

  // Handle browser navigation (back/forward buttons, address bar)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldBlock) {
        event.preventDefault()
        return message.description
      }
    }

    if (shouldBlock) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [shouldBlock, message.description])
}
