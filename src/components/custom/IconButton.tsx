import { Button, type ButtonProps } from '@/components/ui/button'
import Link, { type LinkProps } from 'next/link'
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
} & ({ href: LinkProps['href'] } | { href?: never })

export function IconButton({
  icon,
  tooltip,
  variant = 'ghost',
  iconSize = 'normal',
  isActive = false,
  className = '',
  href,
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
            className={`${className} ${iconSize === 'small' ? 'h-6 w-6' : 'h-9 w-9'} ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
            asChild={!!href}
          >
            {href ? <Link href={href}>{icon}</Link> : icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent className={isTouchDevice ? 'hidden' : ''}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
