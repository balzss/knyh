import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Users } from 'lucide-react'
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
import { TextInput } from '@/components/custom'

type YieldDialogProps = {
  yieldValue: string
  onYieldValueChange: (newValue: string) => void
}

export function YieldDialog({ yieldValue, onYieldValueChange }: YieldDialogProps) {
  const t = useTranslations('YieldDialog')
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>(yieldValue)
  const handleOpenChange = (prevOpen: boolean) => {
    setOpen(prevOpen)
    if (!prevOpen) setValue(yieldValue)
  }

  const handleSetValue = () => {
    onYieldValueChange(value)
    setOpen(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSetValue()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users />
          {yieldValue ? (
            <>
              {t('currentYield')} <span className="font-normal">{yieldValue}</span>
            </>
          ) : (
            t('setYield')
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-3">
          <div className="flex gap-3">
            <TextInput
              value={value}
              onValueChange={(_e, newValue) => setValue(newValue)}
              clearable
              onKeyDown={handleInputKeyDown}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setValue('')}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button onClick={handleSetValue}>{t('set')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
