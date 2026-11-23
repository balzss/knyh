import { Suspense, type ReactNode } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { del, get, set } from 'idb-keyval'
import { clearRecipeDraft } from '@/features/recipes/lib/recipe-draft-cache'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ApiError } from '@/lib/api'
import { ConfirmDialogProvider } from './ConfirmDialogProvider'
import { NavigationGuardProvider } from './NavigationGuardProvider'
import { ThemeProvider } from './ThemeProvider'
import { I18nProvider } from './I18nProvider'
import { EditModeProvider } from './EditModeProvider'

const CACHE_KEY = 'knyh-query-cache'
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cached data offline instead of pausing the query
      networkMode: 'offlineFirst',
      gcTime: CACHE_MAX_AGE,
      // Navigating between pages reuses the cache instead of refetching on every mount
      staleTime: 1000 * 30,
      // Retrying a 4xx response cannot succeed
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
})

const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get<string>(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  key: CACHE_KEY,
})

// Drops the persisted cache so the next user on this device doesn't see it (call on sign-out).
export const clearPersistedCache = () => {
  clearRecipeDraft()
  return del(CACHE_KEY)
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ThemeProvider>
        <PersistQueryClientProvider
          client={queryClient}
          // A new deploy discards the old cache, in case the data shape changed
          persistOptions={{ persister, maxAge: CACHE_MAX_AGE, buster: __BUILD_SHA__ }}
        >
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
        </PersistQueryClientProvider>
      </ThemeProvider>
    </Suspense>
  )
}
