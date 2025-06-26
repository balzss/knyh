'use client'

import { useState } from 'react'
import { useSidebar } from '@/components/ui/sidebar'
import { Dices } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout, RecipeCard, IconButton, TagEditor } from '@/components/custom'
import { useRecipes, useTags } from '@/hooks'
import type { Tag } from '@/lib/data'

export default function Archive() {
  const { toggleSidebar } = useSidebar()
  const { recipes } = useRecipes({ sort: 'random' })
  const [tagFilter, setTagFilter] = useState<Tag[]>([])
  const { tags } = useTags()
  const recipe = recipes?.filter((r) => tagFilter?.every((tag) => r.tags.includes(tag.id)))?.[0]

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-auto sm:mr-4 font-bold">Random recipe</span>
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<Dices />}
              tooltip="Roll new recipe"
              onClick={() => window.location.reload()}
            />
          </div>
        }
      />
      <AppSidebar path="/random" />
      <main className="w-full mt-14">
        <PageLayout variant="list">
          <TagEditor
            label="Filter"
            buttonLabel="Select tag"
            tags={tagFilter}
            onTagChange={(newTags) => setTagFilter(newTags)}
          />
          {recipe && (
            <RecipeCard
              key={recipe.id}
              tags={recipe.tags
                .map((tagId) => tags?.find((tag) => tag.id === tagId))
                .filter((t) => !!t)}
              recipeData={recipe}
            />
          )}
        </PageLayout>
      </main>
    </div>
  )
}
