'use client'

import { Suspense, type ReactNode, useEffect, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider, type Messages, type Locale } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ConfirmDialogProvider } from './ConfirmDialogProvider'
import { NavigationGuardProvider } from './NavigationGuardProvider'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import AuthGuard from '@/components/AuthGuard'

const queryClient = new QueryClient()

type ProvidersProps = {
  i18n: {
    locale: Locale
    messages: Messages
    timeZone?: string
  }
  children: ReactNode
}

export default function Providers({ children, i18n }: ProvidersProps) {
  // Auto-detect timezone on the client; fallback to provided or UTC during SSR
  const [timeZone, setTimeZone] = useState(i18n.timeZone || 'UTC')
  const [clientLocale, setClientLocale] = useState<Locale>(i18n.locale)
  const [clientMessages, setClientMessages] = useState<Messages>(i18n.messages)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)

    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected && detected !== timeZone) setTimeZone(detected)
    } catch {
      /* noop */
    }

    // For static exports, check localStorage for language preference
    const shouldUseLocalStorageLanguage = isStaticExport || isClientStaticExport()
    if (shouldUseLocalStorageLanguage) {
      try {
        const storedData = localStorage.getItem('knyh-data')
        if (storedData) {
          const data = JSON.parse(storedData)
          const preferredLanguage = data.userConfig?.language
          if (preferredLanguage && preferredLanguage !== clientLocale) {
            // Load messages for the preferred language
            import(`../../messages/${preferredLanguage}.json`)
              .then((messages) => {
                setClientLocale(preferredLanguage as Locale)
                setClientMessages(messages.default)
              })
              .catch((error) => {
                console.warn('Failed to load messages for language:', preferredLanguage, error)
              })
          }
        }
      } catch (error) {
        console.warn('Failed to read language preference from localStorage:', error)
      }
    }
  }, [clientLocale, timeZone])

  // Listen for language changes in localStorage
  useEffect(() => {
    const shouldUseLocalStorageLanguage = isStaticExport || isClientStaticExport()
    if (!shouldUseLocalStorageLanguage || !isHydrated) return

    const handleStorageChange = () => {
      try {
        const storedData = localStorage.getItem('knyh-data')
        if (storedData) {
          const data = JSON.parse(storedData)
          const preferredLanguage = data.userConfig?.language
          if (preferredLanguage && preferredLanguage !== clientLocale) {
            import(`../../messages/${preferredLanguage}.json`)
              .then((messages) => {
                setClientLocale(preferredLanguage as Locale)
                setClientMessages(messages.default)
              })
              .catch((error) => {
                console.warn('Failed to load messages for language:', preferredLanguage, error)
              })
          }
        }
      } catch (error) {
        console.warn('Failed to read language preference from localStorage:', error)
      }
    }

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange)

    // Also listen for a custom event we can trigger manually
    window.addEventListener('languageChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('languageChange', handleStorageChange)
    }
  }, [clientLocale, isHydrated])

  return (
    <Suspense>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <AuthGuard>
          <NextIntlClientProvider
            locale={isHydrated ? clientLocale : i18n.locale}
            messages={isHydrated ? clientMessages : i18n.messages}
            timeZone={timeZone}
          >
            <QueryClientProvider client={queryClient}>
              <ConfirmDialogProvider>
                <NavigationGuardProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                  <Toaster toastOptions={{ style: { padding: '0.5rem 1rem' } }} />
                </NavigationGuardProvider>
              </ConfirmDialogProvider>
            </QueryClientProvider>
          </NextIntlClientProvider>
        </AuthGuard>
      </ThemeProvider>
    </Suspense>
  )
}
