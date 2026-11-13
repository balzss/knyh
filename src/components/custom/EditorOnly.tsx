import type { ReactNode } from 'react'
import { useTranslations } from 'use-intl'
import { LogIn, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEditMode } from '@/providers/EditModeProvider'
import { AppSidebar } from './AppSidebar'
import { EmptyState } from './EmptyState'
import { Loader } from './Loader'
import { PageLayout } from './PageLayout'
import { TopBar } from './TopBar'

/**
 * Renders its children only in edit mode. Everyone else sees a sign-in prompt.
 * The Worker enforces the same rule, so this is a convenience, not the security boundary.
 */
export function EditorOnly({ children }: { children: ReactNode }) {
  const t = useTranslations('EditorOnly')
  const { editor, loading } = useEditMode()

  if (editor) return <>{children}</>

  return (
    <div className="flex w-full">
      <TopBar hideSidebarToggleMobile />
      <AppSidebar />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          {loading ? (
            <Loader />
          ) : (
            <EmptyState
              icon={Lock}
              title={t('title')}
              description={t('description')}
              action={
                <Button asChild>
                  <a href={`/auth/login?next=${encodeURIComponent(window.location.pathname)}`}>
                    <LogIn /> {t('signIn')}
                  </a>
                </Button>
              }
            />
          )}
        </PageLayout>
      </main>
    </div>
  )
}
