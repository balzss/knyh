import { useState, useDeferredValue, useMemo } from 'react'
import { useTranslations } from 'use-intl'
import { Archive, ListChecks, FilePlus, BookOpenText, Hammer, CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageShell } from '@/app/layout/PageShell'
import { RecipeCard } from '@/features/recipes/components/RecipeCard'
import { RecipeCardSkeleton } from '@/features/recipes/components/RecipeCardSkeleton'
import { PageLayout } from '@/components/layout/PageLayout'
import { myToast } from '@/components/feedback/toast'
import { TagEditor } from '@/features/tags/TagEditor'
import { EmptyState } from '@/components/layout/EmptyState'
import { TopBarSearchSelect } from '@/features/recipes/components/TopBarSearchSelect'
import { useRecipes } from '@/features/recipes/hooks/use-recipes'
import { useRecipeSelection } from '@/features/recipes/hooks/use-recipe-selection'
import { useRecipeMutations } from '@/features/recipes/hooks/use-recipe-mutations'
import { useTags } from '@/features/tags/use-tags'
import { useViewPreferences } from '@/hooks/use-view-preferences'
import { queryRecipes } from '@/lib/utils'
import { useEditMode } from '@/app/providers/EditModeProvider'
import type { RecipeStatus, Tag } from '@shared/types'

const recipeSkeleton = Array.from({ length: 6 }, (_, i) => <RecipeCardSkeleton key={i} />)

export default function HomePage() {
  const t = useTranslations('HomePage')
  const tNav = useTranslations('Navigation')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { editor } = useEditMode()

  const {
    sort: sortOption,
    layout: selectedLayout,
    gridCols: layoutGridCols,
    status: statusFilter,
  } = useViewPreferences()

  const tagParam = searchParams.get('tag')?.split(',')
  const { recipes, loading: recipesLoading } = useRecipes({
    sort: sortOption,
    archived: false,
    tags: tagParam,
    status: !editor ? 'ready' : statusFilter === 'all' ? undefined : statusFilter,
  })
  const { tags: filterTags } = useTags({ ids: tagParam })
  const { updateRecipes } = useRecipeMutations()

  const { selection, select, selectAll, clear, topBarMode } = useRecipeSelection()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  // Debounced and memoized filter by search query (accent-insensitive title match)
  const filteredRecipes = useMemo(() => {
    return queryRecipes(recipes, deferredSearchQuery)
  }, [recipes, deferredSearchQuery])

  const handleTagFilterChange = (newTags: Tag[]) => {
    if (!newTags.length) {
      navigate('/')
      return
    }

    const tagIdList = newTags.map((t) => t.id).join(',')
    navigate(`/?tag=${tagIdList}`)
  }

  const handleArchiveSelectedRecipes = () => {
    updateRecipes.mutate(
      { ids: selection, data: { archived: true } },
      {
        onSuccess: () => {
          myToast({
            message: t('archivedItems', { count: selection.length }),
            action: {
              label: t('undo'),
              onClick: () =>
                updateRecipes.mutate({
                  ids: selection,
                  data: { archived: false },
                }),
            },
          })
          clear()
        },
      }
    )
  }

  const handleSetStatusSelectedRecipes = (status: RecipeStatus) => {
    updateRecipes.mutate(
      { ids: selection, data: { status } },
      {
        onSuccess: () => {
          myToast({ message: t('statusChanged', { count: selection.length, status }) })
          clear()
        },
      }
    )
  }

  return (
    <PageShell
      hideSidebarToggleMobile={topBarMode === 'select'}
      sidebarPath="/"
      mainClassName="w-full mt-14"
      topBarContent={
        <TopBarSearchSelect
          mode={topBarMode}
          searchQuery={searchQuery}
          onSearchQueryChange={(newValue) => setSearchQuery(newValue)}
          onClearSelection={() => clear()}
          selectionLength={selection.length}
          selectActions={[
            {
              icon: <ListChecks />,
              tooltip: 'Select all',
              onClick: () => selectAll(filteredRecipes.map((r) => r.id)),
              disabled: selection.length === filteredRecipes.length,
            },
          ]}
          moreActions={[
            {
              icon: <Hammer />,
              label: t('markDevelopment'),
              onClick: () => handleSetStatusSelectedRecipes('development'),
            },
            {
              icon: <CircleCheck />,
              label: t('markReady'),
              onClick: () => handleSetStatusSelectedRecipes('ready'),
            },
            {
              icon: <Archive />,
              label: t('archive'),
              onClick: handleArchiveSelectedRecipes,
            },
          ]}
        />
      }
    >
      {tagParam && (
        <TagEditor
          label={t('filter')}
          buttonLabel={t('selectTag')}
          tags={filterTags}
          onTagChange={handleTagFilterChange}
          className={`m-auto p-3 pb-0 w-full ${selectedLayout === 'list' ? 'max-w-2xl' : 'max-w-7xl'}`}
        />
      )}
      <PageLayout
        variant={selectedLayout}
        maxCols={layoutGridCols}
        loading={recipesLoading}
        skeleton={recipeSkeleton}
      >
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              highlight={searchQuery}
              selectionMode={selection.length > 0}
              tags={recipe.tags}
              recipeData={recipe}
              isSelected={selection.includes(recipe.id)}
              onSelect={editor ? (selected) => select(recipe.id, selected) : undefined}
            />
          ))
        ) : (
          <EmptyState
            title={t(statusFilter === 'all' ? 'emptyTitle' : 'emptyFilteredTitle')}
            description={t(
              statusFilter === 'all' ? 'emptyDescription' : 'emptyFilteredDescription'
            )}
            icon={BookOpenText}
            action={
              editor && (
                <Button asChild>
                  <Link to="/r/new" className="inline-flex items-center gap-2">
                    <FilePlus /> {tNav('new-recipe-button')}
                  </Link>
                </Button>
              )
            }
          />
        )}
      </PageLayout>
    </PageShell>
  )
}
