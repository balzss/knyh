import { createContext } from 'react'

export interface ConfirmDialogOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean // If true, confirm button is styled as destructive
}

export interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}

export const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null)
