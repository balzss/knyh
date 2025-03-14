import { motion } from 'motion/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import { IconButton } from '@/components/IconButton'
import { X, GripVertical, Plus } from 'lucide-react'

interface SortableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  newItemMode?: boolean
  onRemoveSelf?: () => void
  inputRef?: (el: HTMLInputElement) => void
  noAnimate?: boolean
}

export function SortableInput({
  id,
  newItemMode = false,
  onRemoveSelf,
  inputRef,
  noAnimate = false,
  ...rest
}: SortableInputProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.li
      {...(noAnimate
        ? {}
        : {
            initial: { height: 0, opacity: 0 },
            animate: { height: 'auto', opacity: 1 },
            exit: { height: 0, opacity: 0 },
            transition: { duration: 0.2, ease: 'easeOut' },
          })}
      ref={setNodeRef}
      style={style}
      {...(!newItemMode && attributes)}
    >
      <motion.div
        className="relative flex items-center max-w-2xl w-full"
        {...(noAnimate
          ? {}
          : {
              initial: { opacity: 0, y: -8 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 8 },
            })}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <span
          className="left-2 absolute touch-none"
          {...(!newItemMode && listeners)}
        >
          {newItemMode ? (
            <Plus size={16} className="w-6" />
          ) : (
            <GripVertical size={16} className="w-6 cursor-move" />
          )}
        </span>
        <Input
          {...rest}
          className="px-10 py-2"
          placeholder={newItemMode ? 'New ingredient' : ''}
          ref={inputRef}
        />
        {!newItemMode && (
          <span className="right-2 absolute">
            <IconButton
              size="small"
              variant="ghost"
              icon={<X />}
              tooltip="Remove item"
              onClick={onRemoveSelf}
            />
          </span>
        )}
      </motion.div>
    </motion.li>
  )
}
