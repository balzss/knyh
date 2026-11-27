import { useEffect, useRef, useState } from 'react'
import { X, GripVertical } from 'lucide-react'
import { motion } from 'motion/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { IconButton } from './IconButton'

const CHECK_DELAY_MS = 80

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
  const [checking, setChecking] = useState<boolean>(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  // Show the box filled before the row leaves
  const handleCheck = () => {
    setChecking(true)
    timer.current = setTimeout(() => onItemChecked?.(), CHECK_DELAY_MS)
  }
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({
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
    if (!rowRef.current?.contains(e.relatedTarget)) {
      onInputBlur?.()
    }
  }

  return (
    <motion.li
      className="group/row"
      initial={noAnimate ? false : { opacity: 0, height: 0, overflow: 'hidden' }}
      animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      style={style}
      ref={setNodeRef}
    >
      <div ref={rowRef} className="relative flex items-center max-w-2xl w-full mb-2">
        <span className="p-2 absolute left-0 top-0 bottom-0 flex items-center gap-2">
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="touch-none flex items-center cursor-move relative after:absolute after:content-[''] after:-inset-x-2 after:-inset-y-3"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} className="w-6" />
          </button>
          {showCheckbox && (
            <Checkbox
              className="relative after:absolute after:content-[''] after:-inset-x-1 after:-inset-y-3"
              checked={checking}
              onCheckedChange={handleCheck}
              id={`check-${id}`}
            />
          )}
        </span>
        {multiLine ? (
          <Textarea
            {...rest}
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
            onBlur={handleBlur}
            className={showCheckbox ? 'pl-[4.25rem] pr-3 border-0' : 'px-9'}
            ref={inputRef}
          />
        )}
        {/* invisible also drops the button from the tab order until the row is hovered or focused */}
        <span className="right-2 absolute invisible group-hover/row:visible group-focus-within/row:visible">
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
      </div>
    </motion.li>
  )
}
