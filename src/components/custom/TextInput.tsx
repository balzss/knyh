import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { X } from 'lucide-react'

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform p-3 rounded-full"
                onClick={handleClear}
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear input field</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
