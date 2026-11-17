import { useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type FieldDialogProps = {
  /** Contents of the button that opens the dialog */
  trigger: ReactNode
  title: string
  description: string
  cancelLabel: string
  submitLabel: string
  /** Runs when the user confirms. The dialog closes afterwards. */
  onSubmit: () => void
  /** Runs when the dialog opens or closes, so the fields can start over from the stored value */
  onOpenChange?: (open: boolean) => void
  /** The fields. `submit` confirms the dialog, for fields that confirm on Enter. */
  children: (submit: () => void) => ReactNode
}

/** A button that opens a small dialog for editing one recipe field, with a cancel and a set button */
export function FieldDialog({
  trigger,
  title,
  description,
  cancelLabel,
  submitLabel,
  onSubmit,
  onOpenChange,
  children,
}: FieldDialogProps) {
  const [open, setOpen] = useState<boolean>(false)

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen)
    setOpen(nextOpen)
  }

  const submit = () => {
    onSubmit()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{trigger}</Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="flex gap-3">{children(submit)}</div>
          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline">{cancelLabel}</Button>
            </DialogClose>
            <Button onClick={submit}>{submitLabel}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
