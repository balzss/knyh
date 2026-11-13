import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { Timer } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useFormatTotalTime } from '@/hooks'
import { parseTotalTime, normalizeTotalTime } from '@/lib/time'

type TotalTimeDialogProps = {
  totalTimeValue: string
  onTotalTimeValueChange: (newValue: string) => void
}

export function TotalTimeDialog({ totalTimeValue, onTotalTimeValueChange }: TotalTimeDialogProps) {
  const t = useTranslations('TotalTimeDialog')
  const [open, setOpen] = useState<boolean>(false)

  const formatTotalTime = useFormatTotalTime()

  // The inputs show the stored time, and start over from it each time the dialog opens
  const toInputs = (time: string) => {
    const parsed = parseTotalTime(time)
    return {
      hours: parsed?.hours ? String(parsed.hours) : '',
      minutes: parsed?.minutes ? String(parsed.minutes) : '',
    }
  }
  const [hours, setHours] = useState<string>(() => toInputs(totalTimeValue).hours)
  const [minutes, setMinutes] = useState<string>(() => toInputs(totalTimeValue).minutes)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const inputs = toInputs(totalTimeValue)
      setHours(inputs.hours)
      setMinutes(inputs.minutes)
    }
    setOpen(nextOpen)
  }

  const handleSetValue = () => {
    onTotalTimeValueChange(normalizeTotalTime(`${hours || 0}:${minutes || 0}`))
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
          <Timer />
          {formatTotalTime(totalTimeValue) ? (
            <>
              {t('totalTime')}{' '}
              <span className="font-normal">{formatTotalTime(totalTimeValue)}</span>
            </>
          ) : (
            t('addTotalTime')
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
            <div className="flex flex-col gap-2 flex-grow">
              <Label>{t('hours')}</Label>
              <Input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                onKeyDown={handleInputKeyDown}
                type="number"
              />
            </div>
            <div className="flex flex-col gap-2 flex-grow">
              <Label>{t('minutes')}</Label>
              <Input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                onKeyDown={handleInputKeyDown}
                type="number"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline">{t('cancel')}</Button>
            </DialogClose>
            <Button onClick={handleSetValue}>{t('set')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
