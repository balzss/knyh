import { Link } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/layout/TopBar'
import { AppSidebar } from '@/app/layout/AppSidebar'
import { PageLayout } from '@/components/layout/PageLayout'
import { EmptyState } from '@/components/layout/EmptyState'

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage')

  return (
    <div className="flex w-full">
      <TopBar />
      <AppSidebar />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <EmptyState
            icon={FileQuestion}
            title={t('title')}
            description={t('description')}
            action={
              <Button asChild>
                <Link to="/">{t('home')}</Link>
              </Button>
            }
          />
        </PageLayout>
      </main>
    </div>
  )
}
