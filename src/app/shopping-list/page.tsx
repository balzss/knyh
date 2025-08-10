'use client'

import { useTranslations } from 'next-intl'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout } from '@/components/custom'

export default function ShoppingList() {
  const t = useTranslations('ShoppingListPage')
  const { toggleSidebar } = useSidebar()

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-4 font-bold">{t('title')}</span>
          </div>
        }
      />
      <AppSidebar path="/shopping-list" />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <div>{t('noItems')}</div>
        </PageLayout>
      </main>
    </div>
  )
}
