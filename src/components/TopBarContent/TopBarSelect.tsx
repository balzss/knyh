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
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex items-center gap-2"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <IconButton
          iconSize="normal"
          variant="ghost"
          icon={<X />}
          tooltip="Clear selection"
          onClick={onClearSelection}
        />
        <span className="mr-4 font-bold ">{selectionLength} selected</span>
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
    </motion.div>
  )
}
