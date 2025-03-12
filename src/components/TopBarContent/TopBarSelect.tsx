import { IconButton } from '@/components/IconButton'
import { X } from 'lucide-react'

type SelectAction = {
  icon: React.ReactNode,
  tooltip: string,
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
  selectActions
}: TopBarSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <IconButton size="normal" variant="ghost" icon={<X/>} tooltip="Clear selection" onClick={onClearSelection}/>
      <span className="mr-4 font-bold ">
        {selectionLength} selected
      </span>
      {selectActions.map(({icon, tooltip, onClick}, index) => (
        <IconButton key={index} size="normal" variant="ghost" icon={icon} tooltip={tooltip} onClick={onClick} />
      ))}
    </div>
  )
}
