'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useSidebar } from '@/components/ui/sidebar'
import { Archive } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { TopBarSearch, TopBarSelect } from '@/components/TopBarContent'
import { AppSidebar, RecipeCard, PageLayout, myToast } from '@/components/custom'
import { useRecipes, useTags } from '@/hooks'

export default function Home() {
  const { toggleSidebar } = useSidebar()
  const { recipes } = useRecipes({ sort: 'random' })
  const { tags } = useTags()
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
        <PageLayout variant={selectedLayout} maxCols={layoutGridCols}>
          {recipes?.map((recipe) => (
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
