import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type HelpDialogProps = {
  trigger: ReactNode
  title: string
  content: ReactNode
}

export function HelpDialog({ trigger, title, content }: HelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid max-h-[70vh] gap-6 overflow-y-auto py-3">{content}</div>
      </DialogContent>
    </Dialog>
  )
}
