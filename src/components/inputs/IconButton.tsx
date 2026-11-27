import { forwardRef } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type IconButtonProps = ButtonProps & {
  icon: React.ReactNode
  tooltip: React.ReactNode
  variant?: 'default' | 'ghost' | 'secondary' | 'outline'
  iconSize?: 'normal' | 'small'
  isActive?: boolean
  /** Shows a small dot on the icon, e.g. to flag an active filter. */
  showDot?: boolean
} & ({ href: string } | { href?: never })

// Radix triggers (`asChild`) attach a ref to this component to anchor popovers, so it must forward it.
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    tooltip,
    variant = 'ghost',
    iconSize = 'normal',
    isActive = false,
    showDot = false,
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
            type={href ? undefined : 'button'}
            {...rest}
            ref={ref}
            variant={variant}
            size="icon"
            className={cn(
              'relative',
              iconSize === 'small' ? 'h-6 w-6' : 'h-9 w-9',
              isActive && 'bg-accent text-accent-foreground',
              className
            )}
            asChild={!!href}
          >
            {href ? (
              <Link to={href}>{icon}</Link>
            ) : (
              <>
                {icon}
                {showDot && (
                  <span
                    aria-hidden
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"
                  />
                )}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className={isTouchDevice ? 'hidden' : ''}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
