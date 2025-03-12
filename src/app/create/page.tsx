'use client'

import { TopBar } from '@/components/TopBar'
import { AppSidebar } from '@/components/AppSidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { PageLayout } from '@/components/PageLayout'

export default function Create() {
  const {
    toggleSidebar,
  } = useSidebar()

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-4 font-bold ">
              Create
            </span>
          </div>
        }
      />
      <AppSidebar />
      <main className="w-full mt-14 mx-auto">
        <PageLayout>
          here you can add a new recipe
        </PageLayout>
      </main>
    </div>
  );
}
