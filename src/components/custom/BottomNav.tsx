import { Link, useLocation } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { BookOpenText, FilePlus, ShoppingCart } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useEditMode } from '@/providers/EditModeProvider'

export function BottomNav() {
  const t = useTranslations('Navigation')
  const isMobile = useIsMobile()
  const { editor } = useEditMode()
  const { pathname } = useLocation()

  // Groceries and new recipe are private to the editor
  if (!isMobile || !editor) return null

  const items = [
    { href: '/', label: t('recipes'), icon: <BookOpenText />, isActive: pathname === '/' },
    {
      href: '/shopping-list',
      label: t('groceries'),
      icon: <ShoppingCart />,
      isActive: pathname === '/shopping-list',
    },
    {
      href: '/recipes/new',
      label: t('new-recipe-button'),
      icon: <FilePlus />,
      isActive: pathname === '/recipes/new',
    },
  ]

  return (
    <>
      <div aria-hidden className="h-16 pb-[env(safe-area-inset-bottom)]" />
      <nav className="fixed bottom-0 left-0 z-50 grid h-16 w-full grid-cols-3 border-0 border-t bg-background pb-[env(safe-area-inset-bottom)] box-content">
        {items.map(({ href, label, icon, isActive }) => (
          <Link
            key={href}
            to={href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary [&_svg]:h-5 [&_svg]:w-5 ${
              isActive ? 'font-bold text-primary' : 'text-muted-foreground'
            }`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
