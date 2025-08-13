'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArchiveRestore, Trash2 } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBarSearch, TopBarSelect } from '@/components/TopBarContent'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout, RecipeCard, myToast } from '@/components/custom'
import { useRecipes } from '@/hooks/use-recipes'
import { useRecipeMutations } from '@/hooks/use-recipe-mutations'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { useTags } from '@/hooks/use-tags'
import type { Recipe, Tag } from '@/lib/types'

export default function Archive() {
  const t = useTranslations('ArchivePage')
  const { toggleSidebar } = useSidebar()
  const { recipes, loading } = useRecipes({ archived: true })
  const { tags } = useTags()
  const { updateRecipes, deleteRecipes } = useRecipeMutations()
  const { confirmDelete } = useConfirmDialog()
  const [selectionList, setSelectionList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedLayout, setSelectedLayout] = useState<'grid' | 'list'>('list')
  const [layoutGridCols, setLayoutGridCols] = useState<number>(5)

  const handleUnarchive = () => {
    updateRecipes.mutate(
      { ids: selectionList, data: { archived: false } },
      {
        onSuccess: () => {
          setSelectionList([])
        },
      }
    )
  }

  const handleBulkDelete = async () => {
    if (selectionList.length === 0) return
    // Reuse confirm dialog; show count in name
    const confirmed = await confirmDelete({ name: `${selectionList.length} item(s)` })
    if (!confirmed) return
    deleteRecipes.mutate(selectionList, {
      onSuccess: (ids) => {
        myToast({
          message: `${ids.length} recipe${ids.length === 1 ? '' : 's'} deleted`,
        })
        setSelectionList([])
      },
    })
  }

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

  const topBarModeMap = {
    search: (
      <TopBarSearch
        searchQuery={searchQuery}
        onSearchQueryChange={(newValue) => setSearchQuery(newValue)}
        selectedLayout={selectedLayout}
        onLayoutChange={handleLayoutChange}
        layoutGridCols={layoutGridCols}
      />
    ),
    select: (
      <TopBarSelect
        onClearSelection={() => setSelectionList([])}
        selectionLength={selectionList.length}
        onSelectAll={() => setSelectionList(recipes.map((r) => r.id))}
        totalCount={recipes.length}
        selectActions={[
          {
            icon: <ArchiveRestore />,
            tooltip: t('restore'),
            onClick: handleUnarchive,
          },
          {
            icon: <Trash2 />,
            tooltip: t('delete'),
            onClick: handleBulkDelete,
          },
        ]}
      />
    ),
  }

  const topBarMode = selectionList.length > 0 ? 'select' : 'search'
  return (
    <div className="flex w-full">
      <TopBar onSidebarToggle={toggleSidebar} customTopbarContent={topBarModeMap[topBarMode]} />
      <AppSidebar path="/archive" />
      <main className="w-full mt-14">
        <PageLayout variant={selectedLayout}>
          {loading && <div>Loading...</div>}
          {recipes?.map((recipe: Recipe) => {
            const recipeTags = recipe.tags
              ? tags.filter((tag: Tag) => recipe.tags.includes(tag.id))
              : []
            return (
              <RecipeCard
                key={recipe.id}
                selectionMode={selectionList.length > 0}
                recipeData={recipe}
                tags={recipeTags}
                isSelected={selectionList.includes(recipe.id)}
                onSelect={(selected) => handleCardSelect(recipe.id, selected)}
                archivedMode
              />
            )
          })}
        </PageLayout>
      </main>
    </div>
  )
}
