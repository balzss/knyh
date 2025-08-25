'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientDataPath, basePath } from '@/lib/utils'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'
import { getLocalStorageData } from '@/lib/local-storage-data'
import type { DatabaseSchema, UserConfig } from '@/lib/types'
import { toast } from './use-toast'
const importApiUrl = `${basePath}/api/import`

type UseImportExportOptions = {
  onConfigImported?: (config: UserConfig) => void
}

export function useImportExport(options: UseImportExportOptions = {}) {
  const queryClient = useQueryClient()

  const handleExport = async () => {
    try {
      let data: DatabaseSchema

      // Check if we're in static export mode and should use localStorage data
      const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

      if (shouldUseLocalStorage) {
        // Export from localStorage (includes locally created recipes)
        data = await getLocalStorageData()
      } else {
        // Export from API/database (SQLite mode)
        const response = await fetch(clientDataPath)
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`)
        }
        data = await response.json()
      }

      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const dateString = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
      a.download = `konyha-library-${dateString}.json`

      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
      toast({
        title: 'Export failed',
        description: 'Could not export data. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const importMutation = useMutation({
    mutationFn: async (data: DatabaseSchema) => {
      const shouldUseLocalStorage = isStaticExport || isClientStaticExport()

      if (shouldUseLocalStorage) {
        // Import to localStorage (static export mode)
        localStorage.setItem('knyh-data', JSON.stringify(data))
        return { success: true }
      } else {
        // Import via API (SQLite mode)
        const res = await fetch(importApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'Import failed')
        }
        return res.json()
      }
    },
    onSuccess: (_resp, variables) => {
      toast({ title: 'Import complete', description: 'Data imported successfully.' })
      // Optimistically apply imported config (theme, etc.) before refetch.
      if (variables?.userConfig && options.onConfigImported) {
        options.onConfigImported(variables.userConfig)
      }
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['userConfig'] })
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      toast({ title: 'Import failed', description: msg })
    },
  })

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const text = e.target?.result
          if (typeof text === 'string') {
            const data = JSON.parse(text)
            importMutation.mutate(data)
          }
        } catch (error) {
          console.error('Failed to parse JSON:', error)
          toast({ title: 'Invalid file', description: 'Could not parse JSON.' })
        }
      }
      reader.readAsText(file)
    }
  }

  return { handleExport, handleImport, importing: importMutation.isPending }
}
