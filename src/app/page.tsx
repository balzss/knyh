'use client'

import { useState } from 'react'
import { RecipeCard } from '@/components/RecipeCard'
import { TopBar } from '@/components/TopBar'
import { AppSidebar } from '@/components/AppSidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { Archive } from 'lucide-react'
import { placeholderData } from '@/lib/mock-data'
import { PageLayout } from '@/components/PageLayout'
import { TopBarSearch, TopBarSelect } from '@/components/TopBarContent'

export default function Home() {
  const { toggleSidebar } = useSidebar()
  const [selectionList, setSelectionList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedLayout, setSelectedLayout] = useState<'grid' | 'list'>('list')

  const handleCardSelect = (id: string, selected: boolean) => {
    setSelectionList((prevList) => {
      if (selected) {
        return prevList.includes(id) ? prevList : [...prevList, id]
      } else {
        return prevList.filter((item) => item !== id)
      }
    })
  }

  const handleLayoutChange = (selectedValue: 'grid' | 'list') => {
    setSelectedLayout(selectedValue)
  }

  const topBarModeMap = {
    search: (
      <TopBarSearch
        searchQuery={searchQuery}
        onSearchQueryChange={(newValue) => setSearchQuery(newValue)}
        selectedLayout={selectedLayout}
        onLayoutChange={handleLayoutChange}
      />
    ),
    select: (
      <TopBarSelect
        onClearSelection={() => setSelectionList([])}
        selectionLength={selectionList.length}
        selectActions={[
          {
            icon: <Archive />,
            tooltip: 'Archive',
            onClick: () =>
              console.log(selectionList.length + ' item archived...'),
          },
        ]}
      />
    ),
  }

  const topBarMode = selectionList.length > 0 ? 'select' : 'search'
  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={topBarModeMap[topBarMode]}
      />
      <AppSidebar path="/" />
      <main className="w-full mt-14">
        <PageLayout variant={selectedLayout}>
          {placeholderData.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              selectionMode={selectionList.length > 0}
              title={recipe.title}
              tags={recipe.tags}
              isSelected={selectionList.includes(recipe.id)}
              onSelect={(selected) => handleCardSelect(recipe.id, selected)}
            />
          ))}
        </PageLayout>
      </main>
    </div>
  )
}
