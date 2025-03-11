'use client'

import { useState } from 'react'
import { RecipeCard } from '@/components/RecipeCard'
import { TopBar } from '@/components/TopBar'
import { AppSidebar } from '@/components/AppSidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { TextInput } from '@/components/TextInput'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SlidersHorizontal, Search, X } from 'lucide-react'

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

  const TopBarSearchContent = (
    <>
      <div className="flex-1 relative flex items-center max-w-2xl ml-1">
        <TextInput
          placeholder="Search"
          clearable
          Icon={Search}
          value={searchQuery}
          onChange={(_e, value) => setSearchQuery(value)}
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <SlidersHorizontal/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 ">
          <div className="flex gap-8 items-center mb-4 justify-between">
            <Label htmlFor="layoutSelect" className="font-bold">Layout</Label>
            <Select onValueChange={handleLayoutChange} defaultValue={selectedLayout}>
              <SelectTrigger className="w-[180px]" id="layoutSelect">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
        </PopoverContent>
      </Popover>
    </>
  )

  const TopBarSelectContent =  (
    <div className="flex items-center font-bold gap-3">
      <Button variant="ghost" size="icon" onClick={() => setSelectionList([])}>
        <X />
      </Button>
      <span>
        {selectionList.length} selected
      </span>
    </div>
  )

  const topBarModeMap = {
    'search' : TopBarSearchContent,
    'select' : TopBarSelectContent,
  }

  const topBarMode = selectionList.length > 0 ? 'select' : 'search'
  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={topBarModeMap[topBarMode]}
      />
      <AppSidebar/>
      <main className="w-full mt-14">
        <div className={`gap-4 p-4 w-full mx-auto grid grid-cols-1 ${layouts[selectedLayout]}`}>
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
        </div>
      </main>
    </div>
  );
}
