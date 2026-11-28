import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useIsRestoring, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type EditModeContextType = {
  /** True when the visitor signed in through Cloudflare Access and may edit. */
  editor: boolean
  loading: boolean
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined)

export function EditModeProvider({ children }: { children: ReactNode }) {
  // The persisted cache restores asynchronously, and until it has, the query reports neither data nor loading
  const isRestoring = useIsRestoring()
  const { data, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: () => api<{ editor: boolean }>('/api/session'),
    staleTime: 60_000,
    retry: false,
  })

  const value = useMemo(
    () => ({ editor: data?.editor ?? false, loading: isLoading || isRestoring }),
    [data, isLoading, isRestoring]
  )

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
}

export function useEditMode() {
  const context = useContext(EditModeContext)
  if (!context) throw new Error('useEditMode must be used within an EditModeProvider')
  return context
}
