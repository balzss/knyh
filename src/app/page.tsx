'use client'

import { useState, useDeferredValue, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Archive, ListChecks, FilePlus, BookOpenText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  AppSidebar,
  RecipeCard,
  PageLayout,
  myToast,
  TagEditor,
  EmptyState,
  TopBar,
  TopBarSearchSelect,
} from '@/components/custom'
import { useRecipes, useRecipeMutations, useConfig } from '@/hooks'
import { queryRecipes } from '@/lib/utils'
import type { Tag } from '@/lib/types'

export default function Home() {
  const t = useTranslations('HomePage')
  const tNav = useTranslations('Navigation')
  const searchParams = useSearchParams()
  const router = useRouter()

  const { data: userConfig } = useConfig()

  const sortOption = userConfig?.defaultSort || 'updated-desc'
  const selectedLayout = userConfig?.defaultLayout || 'list'
  const layoutGridCols = userConfig?.defaultGridCols || 5

  const tagParam = searchParams.get('tag')?.split(',')
  const { recipes, loading: recipesLoading } = useRecipes({
    sort: sortOption,
    tags: tagParam,
  })
  const filterTags = recipes[0]?.tags || []
  const { updateRecipes } = useRecipeMutations()

  // Construct the current path with search parameters for the sidebar
  // TODO maybe move this logic inside the sidebar?
  const currentPath = '/' + (searchParams.toString() ? `?${searchParams.toString()}` : '')

  const [selectionList, setSelectionList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  // Debounced and memoized filter by search query (accent-insensitive title match)
  const filteredRecipes = useMemo(() => {
    return queryRecipes(recipes, deferredSearchQuery)
  }, [recipes, deferredSearchQuery])

  const handleCardSelect = (id: string, selected: boolean) => {
    setSelectionList((prevList) => {
      if (selected) {
        return prevList.includes(id) ? prevList : [...prevList, id]
      } else {
        return prevList.filter((item) => item !== id)
      }
    })
  }

  const handleTagFilterChange = (newTags: Tag[]) => {
    if (!newTags.length) {
      router.push('/')
      return
    }

    const tagIdList = newTags.map((t) => t.id).join(',')
    router.push(`/?tag=${tagIdList}`)
  }

  const handleArchiveSelectedRecipes = () => {
    updateRecipes.mutate(
      { ids: selectionList, data: { archived: true } },
      {
        onSuccess: () => {
          myToast({
            message: t('archivedItems', { count: selectionList.length }),
            action: {
              label: t('undo'),
              onClick: () =>
                updateRecipes.mutate({
                  ids: selectionList,
                  data: { archived: false },
                }),
            },
          })
          setSelectionList([])
        },
      }
    )
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
                onClick: () => setSelectionList(filteredRecipes.map((r) => r.id)),
                disabled: selectionList.length === filteredRecipes.length,
              },
              {
                icon: <Archive />,
                tooltip: t('archive'),
                onClick: handleArchiveSelectedRecipes,
              },
            ]}
          />
        }
      />
      <AppSidebar path={currentPath} />
      <main className="w-full mt-14">
        {tagParam && (
          <TagEditor
            label={t('filter')}
            buttonLabel={t('selectTag')}
            tags={filterTags}
            onTagChange={handleTagFilterChange}
            className={`m-auto p-3 pb-0 w-full ${selectedLayout === 'list' ? 'max-w-2xl' : 'max-w-7xl'}`}
          />
        )}
        <PageLayout variant={selectedLayout} maxCols={layoutGridCols} loading={recipesLoading}>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                highlight={searchQuery}
                selectionMode={selectionList.length > 0}
                tags={recipe.tags}
                recipeData={recipe}
                isSelected={selectionList.includes(recipe.id)}
                onSelect={(selected) => handleCardSelect(recipe.id, selected)}
              />
            ))
          ) : (
            <EmptyState
              title={t('emptyTitle')}
              description={t('emptyDescription')}
              icon={BookOpenText}
              action={
                <Button asChild>
                  <Link href="/recipes/new" className="inline-flex items-center gap-2">
                    <FilePlus /> {tNav('new-recipe-button')}
                  </Link>
                </Button>
              }
            />
          )}
        </PageLayout>
      </main>
    </div>
  )
}
