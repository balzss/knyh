import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { X, ListChecks } from 'lucide-react'
import { IconButton } from '@/components/custom'

type SelectAction = {
  icon: React.ReactNode
  tooltip: string
  onClick: () => void
}

type TopBarSelectProps = {
  selectionLength: number
  onClearSelection: () => void
  onSelectAll?: () => void
  totalCount?: number
  selectActions: SelectAction[]
}

export function TopBarSelect({
  selectionLength,
  onClearSelection,
  onSelectAll,
  totalCount,
  selectActions,
}: TopBarSelectProps) {
  const t = useTranslations('TopBar')
  return (
    <motion.div
      className="flex items-center gap-2 w-full max-w-2xl"
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      layout
    >
      <IconButton
        iconSize="normal"
        variant="ghost"
        icon={<X />}
        tooltip={t('clearSelection')}
        onClick={onClearSelection}
      />
      <span className="mr-auto sm:mr-4 font-bold">
        {selectionLength} {t('selectedItems')}
      </span>
      {onSelectAll && (
        <IconButton
          iconSize="normal"
          variant="ghost"
          icon={<ListChecks />}
          tooltip={t('selectAll')}
          onClick={onSelectAll}
          disabled={typeof totalCount === 'number' && selectionLength >= (totalCount || 0)}
        />
      )}
      {selectActions.map(({ icon, tooltip, onClick }, index) => (
        <IconButton
          key={index}
          iconSize="normal"
          variant="ghost"
          icon={icon}
          tooltip={tooltip}
          onClick={onClick}
        />
      ))}
    </motion.div>
  )
}
