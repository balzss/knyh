'use client'

import { Suspense, type ReactNode } from 'react'
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
  }
  children: ReactNode
}

export default function Providers({ children, i18n }: ProvidersProps) {
  return (
    <Suspense>
      <NextIntlClientProvider {...i18n}>
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
