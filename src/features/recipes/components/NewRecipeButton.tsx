import { Link } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditMode } from '@/app/providers/EditModeProvider'

/** Desktop only. On mobile the bottom nav has its own tab. */
export function NewRecipeButton() {
  const tNav = useTranslations('Navigation')
  const { editor, loading } = useEditMode()

  if (!editor && !loading) return null

  // While the session is unknown the button only holds its space, so the content next to it doesn't resize
  return (
    <Button
      asChild
      className={`hidden font-bold sm:inline-flex ${loading ? 'pointer-events-none invisible' : ''}`}
      variant="secondary"
    >
      <Link to="/r/new" aria-hidden={loading} tabIndex={loading ? -1 : undefined}>
        <FilePlus />
        <span>{tNav('new-recipe-button')}</span>
      </Link>
    </Button>
  )
}
