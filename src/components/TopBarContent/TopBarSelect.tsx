import { IconButton } from '@/components/custom'
import { motion } from 'motion/react'
import { X } from 'lucide-react'

type SelectAction = {
  icon: React.ReactNode
  tooltip: string
  onClick: () => void
}

type TopBarSelectProps = {
  selectionLength: number
  onClearSelection: () => void
  selectActions: SelectAction[]
}

export function TopBarSelect({
  selectionLength,
  onClearSelection,
  selectActions,
}: TopBarSelectProps) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      layout
    >
      <IconButton
        iconSize="normal"
        variant="ghost"
        icon={<X />}
        tooltip="Clear selection"
        onClick={onClearSelection}
      />
      <span className="mr-auto sm:mr-4 font-bold">{selectionLength} selected</span>
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
