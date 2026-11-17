import { Suspense, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ApiError } from '@/lib/api'
import { ConfirmDialogProvider } from './ConfirmDialogProvider'
import { NavigationGuardProvider } from './NavigationGuardProvider'
import { ThemeProvider } from './ThemeProvider'
import { I18nProvider } from './I18nProvider'
import { EditModeProvider } from './EditModeProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retrying a 4xx response cannot succeed
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
})

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <EditModeProvider>
              <ConfirmDialogProvider>
                <NavigationGuardProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                  <Toaster
                    toastOptions={{ style: { padding: '0.5rem 1rem' } }}
                    // Keep toasts above the bottom nav (4rem, 1px border, safe area) on phones.
                    mobileOffset={{ bottom: 'calc(5rem + 1px + env(safe-area-inset-bottom))' }}
                  />
                </NavigationGuardProvider>
              </ConfirmDialogProvider>
            </EditModeProvider>
          </I18nProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Suspense>
  )
}
