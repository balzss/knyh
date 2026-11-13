import { useState, type FormEvent } from 'react'
import { useTranslations } from 'use-intl'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseFactor } from '@/lib/scale-quantity'

type ScaleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The multiplier in use right now */
  factor: number
  onApply: (factor: number) => void
}

export function ScaleDialog({ open, onOpenChange, factor, onApply }: ScaleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Only mounted while open, so the field starts from the current multiplier every time */}
      {open && <ScaleForm factor={factor} onApply={onApply} onClose={() => onOpenChange(false)} />}
    </Dialog>
  )
}

function ScaleForm({
  factor,
  onApply,
  onClose,
}: {
  factor: number
  onApply: (factor: number) => void
  onClose: () => void
}) {
  const t = useTranslations('ScaleDialog')
  const [value, setValue] = useState(String(factor))
  const [error, setError] = useState(false)

  const apply = (next: number) => {
    onApply(next)
    onClose()
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const parsed = parseFactor(value)
    if (parsed === null) {
      setError(true)
      return
    }
    apply(parsed)
  }

  return (
    <DialogContent className="w-11/12 sm:max-w-md rounded-lg">
      <DialogHeader>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription>{t('description')}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-3">
        <div className="grid gap-2">
          <Label htmlFor="scale-input">{t('multiplierLabel')}</Label>
          <Input
            id="scale-input"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            onFocus={(e) => e.currentTarget.select()}
            inputMode="decimal"
            maxLength={10}
            autoComplete="off"
            autoFocus
            aria-invalid={error}
            aria-describedby={error ? 'scale-error' : undefined}
          />
          {error && (
            <p id="scale-error" role="alert" className="text-sm text-red-500">
              {t('invalid')}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          {factor !== 1 && (
            <Button type="button" variant="ghost" className="mr-auto" onClick={() => apply(1)}>
              {t('reset')}
            </Button>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('cancel')}
            </Button>
          </DialogClose>
          <Button type="submit">{t('apply')}</Button>
        </div>
      </form>
    </DialogContent>
  )
}
