import { forwardRef } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// interface IconButtonProps extends ButtonProps {
//   icon: React.ReactNode
//   tooltip: React.ReactNode
//   variant?: 'default' | 'ghost' | 'secondary' | 'outline'
//   onClick?: (e: React.SyntheticEvent) => void
//   iconSize?: 'normal' | 'small'
//   isActive?: boolean
// }

type IconButtonProps = ButtonProps & {
  icon: React.ReactNode
  tooltip: React.ReactNode
  variant?: 'default' | 'ghost' | 'secondary' | 'outline'
  iconSize?: 'normal' | 'small'
  isActive?: boolean
} & ({ href: string } | { href?: never })

// Radix triggers (`asChild`) attach a ref to this component to anchor popovers, so it must forward it.
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    tooltip,
    variant = 'ghost',
    iconSize = 'normal',
    isActive = false,
    className = '',
    href,
    ...rest
  },
  ref
) {
  const isTouchDevice =
    typeof window !== 'undefined' && window?.matchMedia('(pointer: coarse)').matches

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...rest}
            ref={ref}
            variant={variant}
            size="icon"
            className={cn(
              iconSize === 'small' ? 'h-6 w-6' : 'h-9 w-9',
              isActive && 'bg-accent text-accent-foreground',
              className
            )}
            asChild={!!href}
          >
            {href ? <Link to={href}>{icon}</Link> : icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent className={isTouchDevice ? 'hidden' : ''}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
