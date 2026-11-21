import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { Timer } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useFormatTotalTime } from '@/features/recipes/hooks/use-format-total-time'
import { parseTotalTime, normalizeTotalTime } from '@shared/time'
import { FieldDialog } from './FieldDialog'

type TotalTimeDialogProps = {
  totalTimeValue: string
  onTotalTimeValueChange: (newValue: string) => void
}

export function TotalTimeDialog({ totalTimeValue, onTotalTimeValueChange }: TotalTimeDialogProps) {
  const t = useTranslations('TotalTimeDialog')

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

  const handleOpenChange = (open: boolean) => {
    if (open) {
      const inputs = toInputs(totalTimeValue)
      setHours(inputs.hours)
      setMinutes(inputs.minutes)
    }
  }

  return (
    <FieldDialog
      trigger={
        <>
          <Timer />
          {formatTotalTime(totalTimeValue) ? (
            <>
              {t('totalTime')}{' '}
              <span className="font-normal">{formatTotalTime(totalTimeValue)}</span>
            </>
          ) : (
            t('addTotalTime')
          )}
        </>
      }
      title={t('title')}
      description={t('description')}
      cancelLabel={t('cancel')}
      submitLabel={t('set')}
      onSubmit={() => onTotalTimeValueChange(normalizeTotalTime(`${hours || 0}:${minutes || 0}`))}
      onOpenChange={handleOpenChange}
    >
      {(submit) => {
        const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') submit()
        }
        return (
          <>
            <div className="flex flex-col gap-2 flex-grow">
              <Label>{t('hours')}</Label>
              <Input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                onKeyDown={handleInputKeyDown}
                type="number"
                inputMode="numeric"
                min={0}
              />
            </div>
            <div className="flex flex-col gap-2 flex-grow">
              <Label>{t('minutes')}</Label>
              <Input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
                onKeyDown={handleInputKeyDown}
                type="number"
                inputMode="numeric"
                min={0}
              />
            </div>
          </>
        )
      }}
    </FieldDialog>
  )
}
