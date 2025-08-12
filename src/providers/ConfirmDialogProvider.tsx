'use client'

import React, { createContext, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import type { ConfirmDialogOptions, ConfirmDialogContextType } from '@/hooks/use-confirm-dialog'

export const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null)

interface ConfirmDialogProviderProps {
  children: ReactNode
}

export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [dialogState, setDialogState] = useState<{
    open: boolean
    options: ConfirmDialogOptions | null
    resolve: ((value: boolean) => void) | null
  }>({
    open: false,
    options: null,
    resolve: null,
  })

  const confirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        options,
        resolve,
      })
    })
  }

  const handleConfirm = () => {
    if (dialogState.resolve) {
      dialogState.resolve(true)
    }
    setDialogState({
      open: false,
      options: null,
      resolve: null,
    })
  }

  const handleCancel = () => {
    if (dialogState.resolve) {
      dialogState.resolve(false)
    }
    setDialogState({
      open: false,
      options: null,
      resolve: null,
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel()
    }
  }

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {dialogState.options && (
        <ConfirmDialog
          open={dialogState.open}
          onOpenChange={handleOpenChange}
          title={dialogState.options.title}
          description={dialogState.options.description}
          confirmText={dialogState.options.confirmText}
          cancelText={dialogState.options.cancelText}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmDialogContext.Provider>
  )
}
