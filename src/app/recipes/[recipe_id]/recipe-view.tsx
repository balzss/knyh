'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout } from '@/components/custom'

type RecipeViewProps = {
  recipeId: string
}

export default function RecipeView({ recipeId }: RecipeViewProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <div className="flex w-full">
      <TopBar onSidebarToggle={toggleSidebar} />
      <AppSidebar />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>hello {recipeId}</PageLayout>
      </main>
    </div>
  )
}
