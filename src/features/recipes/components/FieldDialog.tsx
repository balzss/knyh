import { useState, type ReactNode } from 'react'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/components/layout/ResponsiveDialog'
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
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline">{trigger}</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{description}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="grid gap-6 py-3">
          <div className="flex gap-3">{children(submit)}</div>
          <div className="flex gap-3 justify-end">
            <ResponsiveDialogClose asChild>
              <Button variant="outline">{cancelLabel}</Button>
            </ResponsiveDialogClose>
            <Button onClick={submit}>{submitLabel}</Button>
          </div>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
