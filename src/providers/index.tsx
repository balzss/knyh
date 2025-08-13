'use client'

import { Suspense, type ReactNode, useEffect, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider, type Messages, type Locale } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ConfirmDialogProvider } from './ConfirmDialogProvider'

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

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected && detected !== timeZone) setTimeZone(detected)
    } catch {
      /* noop */
    }
  }, [timeZone])

  return (
    <Suspense>
      <NextIntlClientProvider locale={i18n.locale} messages={i18n.messages} timeZone={timeZone}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ConfirmDialogProvider>
              <SidebarProvider>{children}</SidebarProvider>
              <Toaster toastOptions={{ style: { padding: '0.5rem 1rem' } }} />
            </ConfirmDialogProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>
    </Suspense>
  )
}
