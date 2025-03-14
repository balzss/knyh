'use client'

import { TopBar } from '@/components/TopBar'
import { AppSidebar } from '@/components/AppSidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { PageLayout } from '@/components/PageLayout'

export default function Settings() {
  const { toggleSidebar } = useSidebar()

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-4 font-bold">Shopping list</span>
          </div>
        }
      />
      <AppSidebar path="/settings" />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <div>shopping list will be here...</div>
        </PageLayout>
      </main>
    </div>
  )
}
