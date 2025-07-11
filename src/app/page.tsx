'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

import { AnimatePresence } from 'motion/react'
import { useSidebar } from '@/components/ui/sidebar'
import { Archive } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { TopBarSearch, TopBarSelect } from '@/components/TopBarContent'
import { AppSidebar, RecipeCard, PageLayout, myToast, TagEditor } from '@/components/custom'
import { useRecipes, useTags } from '@/hooks'
import type { Tag } from '@/lib/data'

export default function Home() {
  const { toggleSidebar } = useSidebar()
  const searchParams = useSearchParams()
  const router = useRouter()

  const { recipes } = useRecipes({ sort: 'random' })
  const { tags } = useTags()

  const tagParam = searchParams.get('tag')?.split(',')
  const filterTags = tags.filter((t) => tagParam?.includes(t.id))
  const filteredRecipes = filterTags.length
    ? recipes.filter((r) => tagParam?.every((t) => r.tags.includes(t)))
    : recipes

  const [selectionList, setSelectionList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedLayout, setSelectedLayout] = useState<'grid' | 'list'>('list')
  const [layoutGridCols, setLayoutGridCols] = useState<number>(5)

  const handleCardSelect = (id: string, selected: boolean) => {
    setSelectionList((prevList) => {
      if (selected) {
        return prevList.includes(id) ? prevList : [...prevList, id]
      } else {
        return prevList.filter((item) => item !== id)
      }
    })
  }

  const handleLayoutChange = (selectedValue: 'grid' | 'list', gridCols: number = 5) => {
    setSelectedLayout(selectedValue)
    setLayoutGridCols(gridCols)
  }

  const handleTagFilterChange = (newTags: Tag[]) => {
    if (!newTags.length) {
      router.push('/')
      return
    }

    const tagIdList = newTags.map((t) => t.id).join(',')
    router.push(`/?tag=${tagIdList}`)
  }

  const topBarMode = selectionList.length > 0 ? 'select' : 'search'
  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        hideSidebarToggleMobile={topBarMode === 'select'}
        customTopbarContent={
          <AnimatePresence initial={false}>
            {topBarMode === 'search' && (
              <TopBarSearch
                key="search"
                searchQuery={searchQuery}
                onSearchQueryChange={(newValue) => setSearchQuery(newValue)}
                selectedLayout={selectedLayout}
                onLayoutChange={handleLayoutChange}
                layoutGridCols={layoutGridCols}
              />
            )}
            {topBarMode === 'select' && (
              <TopBarSelect
                key="select"
                onClearSelection={() => setSelectionList([])}
                selectionLength={selectionList.length}
                selectActions={[
                  {
                    icon: <Archive />,
                    tooltip: 'Archive',
                    onClick: () =>
                      myToast({
                        message: `${selectionList.length} item${selectionList.length > 1 ? 's' : ''} archived`,
                        action: { label: 'Undo', onClick: () => {} },
                      }),
                  },
                ]}
              />
            )}
          </AnimatePresence>
        }
      />
      <AppSidebar path="/" />
      <main className="w-full mt-14">
        {tagParam && (
          <TagEditor
            label="Filter"
            buttonLabel="Select tag"
            tags={filterTags}
            onTagChange={handleTagFilterChange}
            className={`m-auto p-3 pb-0 w-full ${selectedLayout === 'list' ? 'max-w-2xl' : 'max-w-7xl'}`}
          />
        )}
        <PageLayout variant={selectedLayout} maxCols={layoutGridCols}>
          {filteredRecipes?.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              selectionMode={selectionList.length > 0}
              tags={recipe.tags
                .map((tagId) => tags?.find((tag) => tag.id === tagId))
                .filter((t) => !!t)}
              recipeData={recipe}
              isSelected={selectionList.includes(recipe.id)}
              onSelect={(selected) => handleCardSelect(recipe.id, selected)}
              recipeUrl={`${window?.location.href}/recipes/${recipe.id}`}
              compact={selectedLayout === 'grid'}
            />
          ))}
        </PageLayout>
      </main>
    </div>
  )
}
