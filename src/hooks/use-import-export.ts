import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DatabaseSchema, UserConfig } from '@/lib/types'
import { myToast } from '@/components/custom'

type UseImportExportOptions = {
  onConfigImported?: (config: UserConfig) => void
}

export function useImportExport(options: UseImportExportOptions = {}) {
  const queryClient = useQueryClient()

  const handleExport = async () => {
    try {
      const data = await api<DatabaseSchema>('/api/export')

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
      myToast({
        message: 'Export failed - Could not export data. Please try again.',
      })
    }
  }

  const importMutation = useMutation({
    mutationFn: (data: DatabaseSchema) => api('/api/import', { method: 'POST', json: data }),
    onSuccess: (_resp, variables) => {
      myToast({ message: 'Import complete - Data imported successfully.' })
      // Optimistically apply imported config before refetch.
      if (variables?.userConfig && options.onConfigImported) {
        options.onConfigImported(variables.userConfig)
      }
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['userConfig'] })
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      myToast({ message: `Import failed - ${msg}` })
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
          myToast({ message: 'Invalid file - Could not parse JSON.' })
        }
      }
      reader.readAsText(file)
    }
  }

  return { handleExport, handleImport, importing: importMutation.isPending }
}
