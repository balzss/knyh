import { useTranslations } from 'use-intl'
import { X } from 'lucide-react'
import { IconButton } from '@/components/inputs/IconButton'

/** The close X every detail page shows at the start of its top bar. */
export function CloseButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations('TopBar')
  return <IconButton icon={<X />} tooltip={t('close')} onClick={onClick} className="mr-2" />
}
