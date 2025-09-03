'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Archive, ArchiveRestore, Trash2, BookOpenText, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  AppSidebar,
  PageLayout,
  RecipeCard,
  myToast,
  EmptyState,
  TopBar,
  TopBarSearchSelect,
} from '@/components/custom'
import { useRecipes, useRecipeMutations, useConfirmDialog, useConfig } from '@/hooks'
import type { Recipe } from '@/lib/types'

export default function ArchivePage() {
  const t = useTranslations('ArchivePage')
  const { recipes, loading: recipesLoading } = useRecipes({ archived: true })
  const { updateRecipes, deleteRecipes } = useRecipeMutations()
  const { confirmDelete } = useConfirmDialog()

  const { data: userConfig } = useConfig()
  const selectedLayout = userConfig?.defaultLayout || 'list'

  const [selectionList, setSelectionList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

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

  const topBarMode = selectionList.length > 0 ? 'select' : 'search'

  return (
    <div className="flex w-full">
      <TopBar
        hideSidebarToggleMobile={topBarMode === 'select'}
        customTopbarContent={
          <TopBarSearchSelect
            mode={topBarMode}
            searchQuery={searchQuery}
            onSearchQueryChange={(newValue) => setSearchQuery(newValue)}
            onClearSelection={() => setSelectionList([])}
            selectionLength={selectionList.length}
            selectActions={[
              {
                icon: <ListChecks />,
                tooltip: 'Select all',
                onClick: () => setSelectionList(recipes.map((r) => r.id)),
                disabled: selectionList.length === recipes.length,
              },
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
        }
      />
      <AppSidebar path="/archive" />
      <main className="w-full mt-14">
        <PageLayout variant={selectedLayout} loading={recipesLoading}>
          {recipes.length === 0 && (
            <EmptyState
              title={t('emptyTitle')}
              description={t('emptyDescription')}
              icon={Archive}
              action={
                <Button asChild>
                  <Link href="/" className="inline-flex items-center gap-2">
                    <BookOpenText /> {t('emptyCta')}
                  </Link>
                </Button>
              }
            />
          )}
          {recipes.length > 0 &&
            recipes.map((recipe: Recipe) => {
              return (
                <RecipeCard
                  key={recipe.id}
                  selectionMode={selectionList.length > 0}
                  recipeData={recipe}
                  tags={recipe.tags}
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
