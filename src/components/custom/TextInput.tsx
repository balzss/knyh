import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { IconButton } from '@/components/custom'

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onValueChange: (event: React.SyntheticEvent | undefined, newValue: string) => void
  clearable?: boolean
  icon?: React.ComponentType<{ className?: string }>
  placeholder?: string
}

export function TextInput({
  value,
  onValueChange,
  clearable = false,
  placeholder,
  icon: Icon,
  ...rest
}: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onValueChange(undefined, '')
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex items-center max-w-2xl w-full">
      {Icon && <Icon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />}
      <Input
        ref={inputRef}
        placeholder={placeholder}
        className={`${Icon ? 'px-8' : ''}`}
        value={value}
        onChange={(e) => onValueChange(e, e.target.value)}
        autoComplete="off"
        {...rest}
      />
      {value && clearable && (
        <IconButton
          className="absolute right-2 top-1/2 -translate-y-1/2"
          icon={<X />}
          tooltip="Clear input field"
          iconSize="small"
          onClick={handleClear}
        />
      )}
    </div>
  )
}
