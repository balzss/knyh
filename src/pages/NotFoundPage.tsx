import { Link } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopBar, AppSidebar, PageLayout, EmptyState } from '@/components/custom'

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
