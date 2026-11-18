import { Link, useLocation } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { FilePlus, Menu } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { IconButton } from '@/components/inputs/IconButton'
import { Button } from '@/components/ui/button'
import { useEditMode } from '@/app/providers/EditModeProvider'

type TopBarProps = {
  customTopbarContent?: React.ReactNode
  hideSidebarToggleMobile?: boolean
}

export function TopBar({
  customTopbarContent = <></>,
  hideSidebarToggleMobile = false,
}: TopBarProps) {
  const t = useTranslations('TopBar')
  const tNav = useTranslations('Navigation')
  const { editor, loading } = useEditMode()
  const { pathname } = useLocation()
  // The editor has its own bar with Save and Close
  const newRecipeFitsPage = pathname !== '/r/new' && !pathname.endsWith('/edit')
  const showNewRecipe = editor && newRecipeFitsPage
  // Holds the button's space until the session is known, so the content next to it doesn't resize
  const reserveNewRecipe = loading && newRecipeFitsPage
  const { toggleSidebar } = useSidebar()
  return (
    <nav className="fixed top-0 right-0 z-50 flex h-14 w-full items-center gap-2 overflow-hidden border-0 border-b bg-background p-3">
      <IconButton
        className={hideSidebarToggleMobile ? 'hidden sm:flex' : ''}
        icon={<Menu />}
        tooltip={t('toggleSidebar')}
        iconSize="normal"
        onClick={toggleSidebar}
      />

      <Link
        className="hidden w-48 mr-1 items-center justify-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:flex focus:rounded-md"
        to="/"
      >
        KONYHA
      </Link>

      <div className="flex-1 items-center">{customTopbarContent}</div>

      {reserveNewRecipe && (
        <Button
          aria-hidden
          tabIndex={-1}
          className="pointer-events-none invisible hidden font-bold sm:inline-flex"
          variant="secondary"
        >
          <FilePlus />
          <span>{tNav('new-recipe-button')}</span>
        </Button>
      )}

      {showNewRecipe && (
        <Button asChild className="hidden font-bold sm:inline-flex" variant="secondary">
          <Link to="/r/new">
            <FilePlus />
            <span>{tNav('new-recipe-button')}</span>
          </Link>
        </Button>
      )}
    </nav>
  )
}
