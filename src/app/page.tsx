'use client'

import { useState, useDeferredValue, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { AnimatePresence } from 'motion/react'
import { useSidebar } from '@/components/ui/sidebar'
import { Archive, FilePlus, BookOpenText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TopBar } from '@/components/TopBar'
import { TopBarSearch, TopBarSelect } from '@/components/TopBarContent'
import {
  AppSidebar,
  RecipeCard,
  PageLayout,
  myToast,
  TagEditor,
  EmptyState,
  Loader,
} from '@/components/custom'
import { useRecipes, useTags, useRecipeMutations } from '@/hooks'
import type { Tag } from '@/lib/types'
import { getRecipeViewUrl } from '@/lib/data-config'

export default function Home() {
  const t = useTranslations('HomePage')
  const tNav = useTranslations('Navigation')
  const { toggleSidebar } = useSidebar()
  const searchParams = useSearchParams()
  const router = useRouter()

  const { recipes, loading } = useRecipes({ sort: 'random' })
  const { updateRecipes } = useRecipeMutations()
  const { tags, loading: tagsLoading } = useTags()

  const tagParam = searchParams.get('tag')?.split(',')
  const filterTags = tags.filter((t) => tagParam?.includes(t.id))
  const tagFilteredRecipes = filterTags.length
    ? recipes.filter((r) => tagParam?.every((t) => r.tags.includes(t)))
    : recipes

  // Construct the current path with search parameters for the sidebar
  const currentPath = '/' + (searchParams.toString() ? `?${searchParams.toString()}` : '')

  const [selectionList, setSelectionList] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [selectedLayout, setSelectedLayout] = useState<'grid' | 'list'>('list')
  const [layoutGridCols, setLayoutGridCols] = useState<number>(5)

  // Debounced and memoized filter by search query (accent-insensitive title match)
  const filteredRecipes = useMemo(() => {
    // Regex to strip diacritical marks for accent-insensitive search
    const diacriticsRegex = /[\u0300-\u036f]/g
    const normalize = (str: string) =>
      str.toLowerCase().normalize('NFD').replace(diacriticsRegex, '')
    return tagFilteredRecipes.filter((r) =>
      normalize(r.title).includes(normalize(deferredSearchQuery))
    )
  }, [tagFilteredRecipes, deferredSearchQuery])

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
                onSelectAll={() => setSelectionList(filteredRecipes.map((r) => r.id))}
                totalCount={filteredRecipes.length}
                selectActions={[
                  {
                    icon: <Archive />,
                    tooltip: t('archive'),
                    onClick: () => {
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
                    },
                  },
                ]}
              />
            )}
          </AnimatePresence>
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
        <PageLayout variant={selectedLayout} maxCols={layoutGridCols}>
          {(loading || tagsLoading) && <Loader />}
          {!loading && !tagsLoading && filteredRecipes && filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                highlight={searchQuery}
                selectionMode={selectionList.length > 0}
                tags={recipe.tags
                  .map((tagId) => tags?.find((tag) => tag.id === tagId))
                  .filter((t) => !!t)}
                recipeData={recipe}
                isSelected={selectionList.includes(recipe.id)}
                onSelect={(selected) => handleCardSelect(recipe.id, selected)}
                recipeUrl={`${window?.location.origin}${getRecipeViewUrl(recipe.id)}`}
                compact={selectedLayout === 'grid'}
              />
            ))
          ) : !loading && !tagsLoading ? (
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
          ) : null}
        </PageLayout>
      </main>
    </div>
  )
}
