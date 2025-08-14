import { useRef, useState } from 'react'
import { PencilLine, Check } from 'lucide-react'
import { IconButton, myToast } from '@/components/custom'

type Action = {
  icon: React.ReactNode
  tooltip: string
  onClick?: (e: React.SyntheticEvent) => void
  disabled?: boolean
}

type GroupLabelEditProps = {
  label: string
  onLabelChange: (newLabel: string) => void
  isInEditMode: boolean
  actions?: Action[]
}

export function GroupLabelEdit({
  label,
  onLabelChange,
  isInEditMode,
  actions = [],
}: GroupLabelEditProps) {
  const [isInErrorState, setIsInErrorState] = useState<boolean>(false)
  const [focused, setFocused] = useState<boolean>(false)
  const [hovered, setHovered] = useState<boolean>(false)
  const labelRef = useRef<HTMLSpanElement>(null)

  const handleFocus = () => {
    setFocused(true)

    if (!labelRef.current) return

    const range = document.createRange()
    const selection = window.getSelection()
    range.selectNodeContents(labelRef.current)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (e.currentTarget.parentNode?.contains(e.relatedTarget)) {
      labelRef.current?.focus()
      return
    }
    if (labelRef.current?.textContent === '') {
      e.preventDefault()
      setIsInErrorState(true)
      labelRef.current?.focus()
      myToast({ message: 'Ingredient groups must have a name' })
      return
    }
    setFocused(false)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    onLabelChange(labelRef.current?.textContent as string)
  }

  const handleInput = () => {
    if (labelRef.current?.textContent !== '' && isInErrorState) setIsInErrorState(false)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Prevent event bubbling
    if (focused) {
      setFocused(false)
      onLabelChange(labelRef.current?.textContent as string)
      labelRef.current?.blur()
    } else {
      labelRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault() // Prevent form submission
      labelRef.current?.blur()
    }
  }

  return (
    <div
      className="flex items-center min-h-10 gap-2 text-muted-foreground relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()} // Prevent event bubbling
    >
      <span
        className={`transition-[padding] transition-100 min-w-[1rem] text-xl sm:mr-0 mr-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:rounded-md py-1 ${focused ? 'p-1' : ''} ${isInErrorState ? 'focus:ring-destructive' : 'focus:ring-primary'}`}
        contentEditable={isInEditMode}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={labelRef}
        suppressContentEditableWarning
      >
        {label}
      </span>
      <IconButton
        icon={focused ? <Check /> : <PencilLine />}
        onClick={handleEditClick}
        tooltip={focused ? 'Set label' : 'Edit label'}
        variant="ghost"
        iconSize="small"
        className={focused || hovered ? '' : 'sm:hidden'}
      />
      {actions.map(({ icon, onClick, tooltip, disabled }) => (
        <IconButton
          key={tooltip}
          icon={icon}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClick?.(e)
          }}
          tooltip={tooltip}
          variant="ghost"
          iconSize="small"
          className={`${hovered ? '' : 'sm:hidden'} ${focused ? 'hidden' : ''}`}
          disabled={!!disabled}
        />
      ))}
    </div>
  )
}
