import { useFormatter } from 'use-intl'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type RelativeTimeProps = {
  date: Date | string
}

export function RelativeTime({ date }: RelativeTimeProps) {
  const format = useFormatter()
  const value = new Date(date)
  const exact = format.dateTime(value, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="italic" title={exact}>
          {format.relativeTime(value)}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-auto px-3 py-2 text-xs not-italic">
        {exact}
      </PopoverContent>
    </Popover>
  )
}
