import { Link } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/app/layout/PageShell'
import { PageLayout } from '@/components/layout/PageLayout'
import { EmptyState } from '@/components/layout/EmptyState'

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage')

  return (
    <PageShell>
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
    </PageShell>
  )
}
