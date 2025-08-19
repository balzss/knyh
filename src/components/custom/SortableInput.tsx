import { useState } from 'react'
import { X, GripVertical } from 'lucide-react'
import { motion } from 'motion/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { IconButton } from '@/components/custom'

interface SortableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  id: string
  onRemoveSelf?: () => void
  inputRef?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void
  noAnimate?: boolean
  multiLine?: boolean
  showCheckbox?: boolean
  onItemChecked?: () => void
}

export function SortableInput({
  id,
  onRemoveSelf,
  inputRef,
  noAnimate = false,
  multiLine,
  showCheckbox = false,
  onItemChecked,
  ...rest
}: SortableInputProps) {
  const [hovered, setHovered] = useState<boolean>(false)
  const [focused, setFocused] = useState<boolean>(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style: React.CSSProperties = {}
  if (transform) {
    style.transform = CSS.Transform.toString(transform)
    style.zIndex = 1000 // Ensure dragged item appears on top
  }
  if (transition && transform) {
    style.transition = transition
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.parentNode?.contains(e.relatedTarget)) {
      setFocused(false)
    }
  }

  return (
    <motion.li
      layoutId={isDragging ? undefined : id}
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
        className={`relative flex items-center max-w-2xl w-full`}
        {...(noAnimate
          ? {}
          : {
              initial: { opacity: 0, y: -8 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 8 },
            })}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <span className="p-2 absolute left-0 top-0 bottom-0 flex items-center gap-2">
          <span className="touch-none flex items-center cursor-move" {...listeners}>
            <GripVertical size={16} className="w-6" />
          </span>
          {showCheckbox && (
            <Checkbox
              checked={false}
              onCheckedChange={() => onItemChecked?.()}
              id={`check-${id}`}
            />
          )}
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
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
            className={showCheckbox ? 'pl-[4.25rem] pr-3 border-0' : 'px-9'}
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
