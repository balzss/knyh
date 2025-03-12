import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import { IconButton } from '@/components/IconButton'
import { X, GripVertical } from 'lucide-react'

type SortableInputProps = {
  id: string,
  value?: string
  onChange?: (event: React.SyntheticEvent | undefined, newValue: string) => void
}

export function SortableInput({
  id,
  value,
  onChange,
}: SortableInputProps) {
    const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id})

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li className="relative flex items-center max-w-2xl ml-1 w-full" ref={setNodeRef} style={style} {...attributes}>
      <span className="left-2 absolute" {...listeners}>
        <IconButton size="small" variant="ghost" icon={<GripVertical/>} tooltip="Drag item"/>
      </span>
      <Input
        className="px-12 py-6"
      />
      <span className="right-2 absolute">
        <IconButton size="small" variant="ghost" icon={<X/>} tooltip="Remove item" onClick={() => console.log('clear?')}/>
      </span>
    </li>
  )
}
