import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { Users } from 'lucide-react'
import { TextInput } from '@/components/inputs/TextInput'
import { FieldDialog } from './FieldDialog'

type YieldDialogProps = {
  yieldValue: string
  onYieldValueChange: (newValue: string) => void
}

export function YieldDialog({ yieldValue, onYieldValueChange }: YieldDialogProps) {
  const t = useTranslations('YieldDialog')
  const [value, setValue] = useState<string>(yieldValue)

  return (
    <FieldDialog
      trigger={
        <>
          <Users />
          {yieldValue ? (
            <>
              {t('currentYield')} <span className="font-normal">{yieldValue}</span>
            </>
          ) : (
            t('setYield')
          )}
        </>
      }
      title={t('title')}
      description={t('description')}
      cancelLabel={t('cancel')}
      submitLabel={t('set')}
      onSubmit={() => onYieldValueChange(value)}
      onOpenChange={(open) => {
        if (!open) setValue(yieldValue)
      }}
    >
      {(submit) => (
        <TextInput
          value={value}
          onValueChange={(_e, newValue) => setValue(newValue)}
          clearable
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
      )}
    </FieldDialog>
  )
}
