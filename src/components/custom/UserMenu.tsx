import { useTranslations } from 'use-intl'
import { LogIn, LogOut, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useEditMode } from '@/providers/EditModeProvider'

type UserMenuProps = {
  hideSidebarToggleMobile?: boolean
}

/**
 * Shows whether edit mode is on. Sign in and out go through Cloudflare Access with
 * full page loads, so the browser follows its redirects.
 */
export function UserMenu({ hideSidebarToggleMobile }: UserMenuProps) {
  const t = useTranslations('TopBar')
  const { editor, loading } = useEditMode()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={editor ? 'default' : 'ghost'}
          size="icon"
          aria-label={editor ? t('editModeOn') : t('editModeOff')}
          className={`ml-auto mr-1 cursor-pointer rounded-full ${
            hideSidebarToggleMobile ? 'hidden sm:flex' : ''
          }`}
        >
          <Pencil />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-2 flex w-80 flex-col gap-3 font-bold">
        <span>{loading ? t('loading') : editor ? t('editModeOn') : t('editModeOff')}</span>
        {editor ? (
          <Button asChild>
            <a href="/cdn-cgi/access/logout">
              <LogOut /> {t('signOut')}
            </a>
          </Button>
        ) : (
          <Button asChild>
            <a href="/auth/login?next=/settings">
              <LogIn /> {t('signIn')}
            </a>
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
