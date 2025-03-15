'use client'

import { useState } from 'react'
import { ArchiveRestore, Trash2 } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBarSearch, TopBarSelect } from '@/components/TopBarContent'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout, RecipeCard } from '@/components/custom'

import { placeholderData } from '@/lib/mock-data'

export default function Archive() {
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
            icon: <ArchiveRestore />,
            tooltip: 'Restore',
            onClick: () =>
              console.log(selectionList.length + ' item restored...'),
          },
          {
            icon: <Trash2 />,
            tooltip: 'Delete',
            onClick: () =>
              console.log(selectionList.length + ' item deleted...'),
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
      <AppSidebar path="/archive" />
      <main className="w-full mt-14">
        <PageLayout title="Archive" variant={selectedLayout}>
          {placeholderData.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              selectionMode={selectionList.length > 0}
              title={recipe.title}
              tags={recipe.tags}
              isSelected={selectionList.includes(recipe.id)}
              onSelect={(selected) => handleCardSelect(recipe.id, selected)}
              archivedMode
            />
          ))}
        </PageLayout>
      </main>
    </div>
  )
}
