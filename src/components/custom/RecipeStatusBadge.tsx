import { useTranslations } from 'use-intl'
import { Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecipeStatus } from '@shared/types'

type RecipeStatusBadgeProps = {
  status: RecipeStatus
  /** `label` is quiet italic text for lists, `pill` is a highlighted badge for the recipe page. */
  variant?: 'pill' | 'label'
  className?: string
}

/** Marks a recipe that is still being worked on. Ready recipes show nothing. */
export function RecipeStatusBadge({ status, variant = 'pill', className }: RecipeStatusBadgeProps) {
  const t = useTranslations('RecipeStatus')
  if (status !== 'development') return null

  if (variant === 'label') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs italic whitespace-nowrap', className)}>
        <Hammer className="h-3 w-3" aria-hidden />
        {t('development')}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-dashed border-amber-600/60 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-400/60 dark:text-amber-300',
        className
      )}
    >
      <Hammer className="h-3 w-3" aria-hidden />
      {t('development')}
    </span>
  )
}
