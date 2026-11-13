import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
  iconClassName?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
  iconClassName = 'size-10 text-primary opacity-80',
}: EmptyStateProps) {
  let renderedIcon: ReactNode = null
  if (icon) {
    const IconComp = icon
    renderedIcon = <IconComp className={iconClassName} />
  }
  return (
    <div
      className={cn(
        'col-span-full flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-border/50 p-12 bg-muted/10 backdrop-blur-sm',
        className
      )}
    >
      {renderedIcon && (
        <div className="mb-6 size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {renderedIcon}
        </div>
      )}
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground mt-2 max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
