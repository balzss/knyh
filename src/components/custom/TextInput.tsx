import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { IconButton } from '@/components/custom'

interface ActionButtonConfig {
  icon: React.ReactNode
  tooltip: string
  onClick: (e?: React.MouseEvent) => void
  show?: boolean
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onValueChange: (event: React.SyntheticEvent | undefined, newValue: string) => void
  clearable?: boolean
  icon?: React.ComponentType<{ className?: string }>
  placeholder?: string
  actionButtons?: ActionButtonConfig[]
}

export function TextInput({
  value,
  onValueChange,
  clearable = false,
  placeholder,
  icon: Icon,
  actionButtons = [],
  ...rest
}: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onValueChange(undefined, '')
    inputRef.current?.focus()
  }

  const handleActionButtonClick =
    (originalOnClick: (e?: React.MouseEvent) => void) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Store the current focus state
      const wasInputFocused = document.activeElement === inputRef.current

      // Execute the original onClick
      originalOnClick(e)

      // Restore focus if the input was previously focused
      if (wasInputFocused) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 0)
      }
    }

  // Filter action buttons based on the show condition
  const visibleActionButtons = actionButtons.filter((button) => button.show !== false)

  // Calculate padding based on buttons - using specific Tailwind classes
  const hasRightButtons = (value && clearable) || visibleActionButtons.length > 0
  const buttonCount = (clearable && value ? 1 : 0) + visibleActionButtons.length

  let rightPaddingClass = ''
  if (hasRightButtons) {
    if (buttonCount === 1) rightPaddingClass = 'pr-10'
    else if (buttonCount === 2) rightPaddingClass = 'pr-16'
    else if (buttonCount === 3) rightPaddingClass = 'pr-24'
    else rightPaddingClass = 'pr-32'
  }

  return (
    <div className="relative flex items-center max-w-2xl w-full">
      {Icon && <Icon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />}
      <Input
        ref={inputRef}
        placeholder={placeholder}
        className={`${Icon ? 'pl-8' : ''} ${rightPaddingClass}`}
        value={value}
        onChange={(e) => onValueChange(e, e.target.value)}
        autoComplete="off"
        {...rest}
      />

      {/* Action buttons positioned from right to left */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {/* Clear button (rightmost when present) */}
        {value && clearable && (
          <IconButton
            icon={<X />}
            tooltip="Clear input field"
            iconSize="small"
            onClick={handleClear}
            type="button"
          />
        )}

        {/* Custom action buttons (left of clear button) */}
        {visibleActionButtons.map((button, index) => (
          <IconButton
            key={index}
            icon={button.icon}
            tooltip={button.tooltip}
            iconSize="small"
            onClick={handleActionButtonClick(button.onClick)}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
