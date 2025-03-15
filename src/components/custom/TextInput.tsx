import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { X } from 'lucide-react'

type TextInputProps = {
  value: string
  onChange: (event: React.SyntheticEvent | undefined, newValue: string) => void
  clearable?: boolean
  Icon?: React.ComponentType<{ className?: string }>
  placeholder?: string
}

export function TextInput({
  value,
  onChange,
  clearable = false,
  placeholder,
  Icon,
}: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onChange(undefined, '')
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex items-center max-w-2xl ml-1 w-full">
      {Icon && (
        <Icon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
      )}
      <Input
        ref={inputRef}
        placeholder={placeholder}
        className="px-8"
        value={value}
        onChange={(e) => onChange(e, e.target.value)}
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
