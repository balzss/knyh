import { useTranslations } from 'use-intl'
import { Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecipeStatus } from '@shared/types'

type RecipeStatusBadgeProps = {
  status: RecipeStatus
  /** `label` is quiet italic text for lists, `meta` matches the yield and time rows on the recipe page. */
  variant?: 'meta' | 'label'
  className?: string
}

/** Marks a recipe that is still being worked on. Ready recipes show nothing. */
export function RecipeStatusBadge({ status, variant = 'meta', className }: RecipeStatusBadgeProps) {
  const t = useTranslations('RecipeStatus')
  if (status !== 'development') return null

  if (variant === 'label') {
    return (
      <span className={cn('inline-flex items-center gap-1 italic whitespace-nowrap', className)}>
        <Hammer size="1rem" aria-hidden />
        {t('development')}
      </span>
    )
  }

  return (
    <div className={cn('flex gap-1 items-center text-amber-700 dark:text-amber-400', className)}>
      <Hammer size="1rem" aria-hidden />
      <span>{t('development')}</span>
    </div>
  )
}
