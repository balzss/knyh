'use client'

import { useContext, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { ConfirmDialogContext } from '@/providers/ConfirmDialogProvider'

export interface ConfirmDialogOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

export interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}

export interface UseConfirmDialogExtended extends ConfirmDialogContextType {
  confirmDelete: (params: { name?: string; entity?: string }) => Promise<boolean>
}

export function useConfirmDialog(): UseConfirmDialogExtended {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  const t = useTranslations('ConfirmDialog')

  const confirmDelete = useCallback(
    async ({ name = '', entity = 'item' }: { name?: string; entity?: string }) => {
      return context.confirm({
        title: t('deleteTitle', { entity }),
        description: t('deleteDescription', { name }),
        confirmText: t('deleteConfirmButton'),
        cancelText: t('cancelButton'),
      })
    },
    [context, t]
  )

  return { ...context, confirmDelete }
}
