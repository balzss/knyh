import { useCallback } from 'react'
import { useTranslations } from 'use-intl'
import { formatTotalTime } from '@/lib/time'

/** Returns a function that writes a stored total time in the current language. */
export function useFormatTotalTime() {
  const t = useTranslations('Time')
  return useCallback(
    (value: string | null | undefined) =>
      formatTotalTime(value, { hours: t('hours'), minutes: t('minutes') }),
    [t]
  )
}
