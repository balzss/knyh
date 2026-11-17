import { useContext, useCallback } from 'react'
import { useTranslations } from 'use-intl'
import {
  ConfirmDialogContext,
  type ConfirmDialogContextType,
} from '@/providers/confirm-dialog-context'

interface UseConfirmDialogExtended extends ConfirmDialogContextType {
  confirmDelete: (params: { name?: string }) => Promise<boolean>
}

export function useConfirmDialog(): UseConfirmDialogExtended {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  const t = useTranslations('ConfirmDialog')

  const confirmDelete = useCallback(
    async ({ name = '' }: { name?: string }) => {
      return context.confirm({
        title: t('deleteTitle', { name }),
        description: t('deleteDescription', { name }),
        confirmText: t('deleteConfirmButton'),
        cancelText: t('cancelButton'),
        destructive: true,
      })
    },
    [context, t]
  )

  return { ...context, confirmDelete }
}
