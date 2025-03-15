import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type IconButtonProps = {
  icon: React.ReactNode
  tooltip: React.ReactNode
  variant?: 'default' | 'ghost' | 'secondary' | 'outline'
  onClick?: (e: React.SyntheticEvent) => void
  size?: 'normal' | 'small'
  isActive?: boolean
  className?: string
}

export function IconButton({
  icon,
  tooltip,
  variant = 'ghost',
  onClick,
  size = 'normal',
  isActive = false,
  className = '',
}: IconButtonProps) {
  const isTouchDevice =
    typeof window !== 'undefined' &&
    window?.matchMedia('(pointer: coarse)').matches

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            className={`${className} ${size === 'small' ? 'h-8 w-8' : ''} ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
            onClick={onClick}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent className={isTouchDevice ? 'hidden' : ''}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
