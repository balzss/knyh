import { useState } from 'react'
import { useTranslations } from 'next-intl'
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

type TotalTimeDialogProps = {
  totalTimeValue: string
  onTotalTimeValueChange: (newValue: string) => void
}

export function TotalTimeDialog({ totalTimeValue, onTotalTimeValueChange }: TotalTimeDialogProps) {
  const t = useTranslations('TotalTimeDialog')
  const [open, setOpen] = useState<boolean>(false)

  const [initialHours, initialMinutes] = (totalTimeValue || ':').split(':')
  const [hours, setHours] = useState<string>(initialHours)
  const [minutes, setMinutes] = useState<string>(initialMinutes)

  const handleOpenChange = (prevOpen: boolean) => {
    setOpen(prevOpen)
    if (!prevOpen) {
      const splitTotalTime = totalTimeValue.split(':')
      setHours(splitTotalTime[0])
      setMinutes(splitTotalTime[1])
    }
  }

  const formatTotalTime = (time: string) => {
    const splitTime = time.split(':')
    const hours = Number(splitTime[0])
    const minutes = Number(splitTime[1])
    const formattedHours = hours > 0 ? `${hours} ${t(hours > 1 ? 'hoursShort' : 'hourShort')}` : ''
    const formattedMinutes =
      minutes > 0 ? `${minutes} ${t(minutes > 1 ? 'minutesShort' : 'minuteShort')}` : ''
    return [formattedHours, formattedMinutes].join(' ')
  }

  const handleSetValue = () => {
    onTotalTimeValueChange(`${hours}:${minutes}`)
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
          {totalTimeValue ? (
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
