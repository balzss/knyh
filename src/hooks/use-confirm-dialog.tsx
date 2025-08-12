'use client'

import { useContext } from 'react'
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

export function useConfirmDialog(): ConfirmDialogContextType {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return context
}
