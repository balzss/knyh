'use client'

import React, { createContext, useContext, useRef, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'

interface NavigationGuardContextType {
  setNavigationGuard: (guard: NavigationGuard | null) => void
}

interface NavigationGuard {
  shouldBlock: () => boolean
  message: {
    title: string
    description: string
    confirmText: string
    cancelText: string
    destructive?: boolean
  }
}

const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(undefined)

interface NavigationGuardProviderProps {
  children: ReactNode
}

export function NavigationGuardProvider({ children }: NavigationGuardProviderProps) {
  const pathname = usePathname()
  const { confirm } = useConfirmDialog()
  const guardRef = useRef<NavigationGuard | null>(null)
  const isNavigatingRef = useRef(false)

  // Set up beforeunload listener for external navigation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const guard = guardRef.current
      if (guard && guard.shouldBlock()) {
        event.preventDefault()
        return guard.message.description
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Intercept browser back/forward navigation
  useEffect(() => {
    const handlePopState = async (event: PopStateEvent) => {
      const guard = guardRef.current
      if (guard && guard.shouldBlock() && !isNavigatingRef.current) {
        event.preventDefault()
        const shouldLeave = await confirm(guard.message)
        if (shouldLeave) {
          isNavigatingRef.current = true
          // Allow the navigation by going back again
          window.history.back()
        } else {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', pathname)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [pathname, confirm])

  // Intercept all click events on links and buttons
  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const guard = guardRef.current

      if (!guard || !guard.shouldBlock() || isNavigatingRef.current) {
        return
      }

      // Check if the clicked element is a link or is inside a link
      const linkElement = target.closest('a[href]') as HTMLAnchorElement
      if (linkElement) {
        const href = linkElement.getAttribute('href')

        // Only intercept internal navigation (not external links)
        if (href && (href.startsWith('/') || href.startsWith('#'))) {
          event.preventDefault()
          event.stopPropagation()

          const shouldLeave = await confirm(guard.message)
          if (shouldLeave) {
            isNavigatingRef.current = true
            // Clear the guard temporarily and trigger the navigation
            const currentGuard = guardRef.current
            guardRef.current = null
            linkElement.click()
            // Restore the guard after a delay
            setTimeout(() => {
              guardRef.current = currentGuard
              isNavigatingRef.current = false
            }, 100)
          }
        }
      }

      // Check for other navigation triggers (buttons with router.push, etc.)
      const buttonElement = target.closest('button')
      if (buttonElement && buttonElement.getAttribute('data-navigation')) {
        event.preventDefault()
        event.stopPropagation()

        const shouldLeave = await confirm(guard.message)
        if (shouldLeave) {
          isNavigatingRef.current = true
          // Re-trigger the original click after clearing the guard
          const currentGuard = guardRef.current
          guardRef.current = null
          buttonElement.click()
          setTimeout(() => {
            guardRef.current = currentGuard
            isNavigatingRef.current = false
          }, 100)
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [confirm])

  const setNavigationGuard = (guard: NavigationGuard | null) => {
    guardRef.current = guard
  }

  return (
    <NavigationGuardContext.Provider value={{ setNavigationGuard }}>
      {children}
    </NavigationGuardContext.Provider>
  )
}

export function useNavigationGuard() {
  const context = useContext(NavigationGuardContext)
  if (!context) {
    throw new Error('useNavigationGuard must be used within a NavigationGuardProvider')
  }
  return context
}
