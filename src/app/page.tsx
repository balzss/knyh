'use client'

import { useState } from 'react'
import { RecipeCard } from '@/components/RecipeCard'
import { TopBar } from '@/components/TopBar'
import { AppSidebar } from '@/components/AppSidebar'
import { useSidebar } from "@/components/ui/sidebar"

const placeholderTags = {
  'magyar': {
    displayName: 'magyar',
    id: '0'
  },
  'alaprecept': {
    displayName: 'alaprecept',
    id: '1'
  },
  'főzelék': {
    displayName: 'főzelék',
    id: '2'
  },
  'desszert': {
    displayName: 'desszert',
    id: '3'
  },
  'tészta': {
    displayName: 'tészta',
    id: '4'
  },
  'olasz': {
    displayName: 'olasz',
    id: '5'
  },
  'leves': {
    displayName: 'leves',
    id: '6'
  },
}

const placeholderData = [
  {
    id: '1',
    title: 'Palacsinta alaprecept',
    tags: [placeholderTags['alaprecept'], placeholderTags['magyar'], placeholderTags['desszert']]
  },
  {
    id: '2',
    title: 'Somlói galuska',
    tags: [placeholderTags['desszert'], placeholderTags['magyar']]
  },
  {
    id: '3',
    title: 'Krumplifőzelék',
    tags: [placeholderTags['főzelék'], placeholderTags['magyar']]
  },
  {
    id: '4',
    title: 'Kocsonya',
    tags: [placeholderTags['magyar']]
  },
  {
    id: '5',
    title: 'Betyárleves',
    tags: [placeholderTags['magyar'], placeholderTags['leves']]
  },
  {
    id: '6',
    title: 'Fasírt',
    tags: [placeholderTags['magyar']]
  },
  {
    id: '7',
    title: 'Carbonara',
    tags: [placeholderTags['olasz'], placeholderTags['tészta']]
  },
  {
    id: '8',
    title: 'Lecsó',
    tags: [placeholderTags['magyar']]
  },
  {
    id: '9',
    title: 'Rizottó',
    tags: [placeholderTags['olasz']]
  },
]

const layouts = {
  list: 'max-w-2xl',
  grid: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl-grid-cols-6 max-w-7xl',
}

export default function Home() {
  const {
    toggleSidebar,
  } = useSidebar()
  const [selectionList, setSelectionList] = useState<string[]>([])

  const handleCardSelect = (id: string, selected: boolean) => {
    setSelectionList((prevList) => {
      if (selected) {
        return prevList.includes(id) ? prevList : [...prevList, id]
      } else {
        return prevList.filter((item) => item !== id)
      }
    })
  }

  const selectedLayout = 'grid'
  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        onSearchQueryChange={(q) => console.log(q)}
      />
      <AppSidebar/>
      <main className="w-full mt-14">
        <div className={`gap-4 p-4 w-full mx-auto grid grid-cols-1 ${layouts[selectedLayout]}`}>
          {placeholderData.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              tags={recipe.tags}
              isSelected={selectionList.includes(recipe.id)}
              onSelect={(selected) => handleCardSelect(recipe.id, selected)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
