import { useState } from 'react'
import { X, GripVertical } from 'lucide-react'
import { motion } from 'motion/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { IconButton } from '@/components/custom'

interface SortableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  id: string
  onRemoveSelf?: () => void
  inputRef?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void
  noAnimate?: boolean
  multiLine?: boolean
}

export function SortableInput({
  id,
  onRemoveSelf,
  inputRef,
  noAnimate = false,
  multiLine,
  ...rest
}: SortableInputProps) {
  const [hovered, setHovered] = useState<boolean>(false)
  const [focused, setFocused] = useState<boolean>(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.parentNode?.contains(e.relatedTarget)) {
      setFocused(false)
    }
  }

  return (
    <motion.li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
      {...attributes}
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
        <span className="p-2 absolute touch-none flex items-center cursor-move" {...listeners}>
          <GripVertical size={16} className="w-6" />
        </span>
        {multiLine ? (
          <Textarea
            {...rest}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            className="px-9 resize-none h-auto min-h-9 sortable-input-multiline"
            onChange={(e) => {
              rest.onChange?.(e)
            }}
            ref={inputRef}
          />
        ) : (
          <Input
            {...rest}
            autoComplete="off"
            // Set isHovered to true when the input gains focus, and only set it to false when focus moves completely outside the
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            className="px-9"
            ref={inputRef}
          />
        )}
        {(focused || hovered) && (
          <span className="right-2 absolute">
            <IconButton
              iconSize="small"
              variant="ghost"
              icon={<X />}
              tooltip="Remove item"
              onClick={onRemoveSelf}
              onBlur={handleBlur}
              type="button"
            />
          </span>
        )}
      </motion.div>
    </motion.li>
  )
}
