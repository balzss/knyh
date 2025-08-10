'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientDataPath } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

export function useImportExport() {
  const queryClient = useQueryClient()

  const handleExport = async () => {
    try {
      const response = await fetch(clientDataPath)
      const data = await response.json()
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
    }
  }

  const importMutation = useMutation({
    mutationFn: async (data: DatabaseSchema) => {
      // This is where you would typically send the data to your server
      // For now, we'll just log it and invalidate queries to refetch data
      console.log('Imported data:', data)
      alert('Coming soon...')
      // Example of what you might do:
      // await fetch('/api/import', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['userConfig'] })
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
        }
      }
      reader.readAsText(file)
    }
  }

  return { handleExport, handleImport }
}
