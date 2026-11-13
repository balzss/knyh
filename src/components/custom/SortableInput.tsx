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
  onInputBlur?: () => void
  noAnimate?: boolean
  multiLine?: boolean
  showCheckbox?: boolean
  onItemChecked?: () => void
}

export function SortableInput({
  id,
  onRemoveSelf,
  inputRef,
  onInputBlur,
  noAnimate = false,
  multiLine,
  showCheckbox = false,
  onItemChecked,
  ...rest
}: SortableInputProps) {
  const [hovered, setHovered] = useState<boolean>(false)
  const [focused, setFocused] = useState<boolean>(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
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
      onInputBlur?.()
    }
  }

  return (
    <motion.li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={noAnimate ? false : { opacity: 0, height: 0, overflow: 'hidden' }}
      animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      style={style}
      ref={setNodeRef}
      {...attributes}
    >
      <div className={`relative flex items-center max-w-2xl w-full`}>
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
      </div>
    </motion.li>
  )
}
