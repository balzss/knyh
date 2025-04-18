import { Button, ButtonProps } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode
  tooltip: React.ReactNode
  variant?: 'default' | 'ghost' | 'secondary' | 'outline'
  onClick?: (e: React.SyntheticEvent) => void
  iconSize?: 'normal' | 'small'
  isActive?: boolean
}

export function IconButton({
  icon,
  tooltip,
  variant = 'ghost',
  onClick,
  iconSize = 'normal',
  isActive = false,
  className = '',
  ...rest
}: IconButtonProps) {
  const isTouchDevice =
    typeof window !== 'undefined' && window?.matchMedia('(pointer: coarse)').matches

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...rest}
            variant={variant}
            size="icon"
            className={`${className} ${iconSize === 'small' ? 'h-8 w-8' : ''} ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
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
