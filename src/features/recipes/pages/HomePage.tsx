import { useState, useDeferredValue, useMemo } from 'react'
import { useTranslations } from 'use-intl'
import { Archive, ListChecks, FilePlus, BookOpenText, Hammer, CircleCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageShell } from '@/app/layout/PageShell'
import { RecipeCard } from '@/features/recipes/components/RecipeCard'
import { PageLayout } from '@/components/layout/PageLayout'
import { myToast } from '@/components/feedback/toast'
import { TagEditor } from '@/features/tags/TagEditor'
import { EmptyState } from '@/components/layout/EmptyState'
import { NewRecipeButton } from '@/features/recipes/components/NewRecipeButton'
import { TopBarSearchSelect } from '@/features/recipes/components/TopBarSearchSelect'
import { useRecipes } from '@/features/recipes/hooks/use-recipes'
import { useRecipeSelection } from '@/features/recipes/hooks/use-recipe-selection'
import { useRecipeMutations } from '@/features/recipes/hooks/use-recipe-mutations'
import { useTags } from '@/features/tags/use-tags'
import { usePageTitle } from '@/hooks/use-page-title'
import { useViewPreferences } from '@/hooks/use-view-preferences'
import { searchRecipes, type ContentMatch } from '@/features/recipes/lib/search'
import { useEditMode } from '@/app/providers/EditModeProvider'
import type { Recipe, RecipeStatus, Tag } from '@shared/types'

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
  const { tags: filterTags, loading: tagsLoading } = useTags({ ids: tagParam })
  // Ids of deleted tags would match no recipe and show no chip to remove, so only filter by known tags.
  // useTags returns every tag when no ids are given, so skip it when the URL has no tag filter.
  const activeTagIds = !tagParam
    ? undefined
    : tagsLoading
      ? tagParam
      : filterTags.map((tag) => tag.id)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const searchTerm = deferredSearchQuery.trim()
  const searching = searchTerm !== ''
  // A search looks through every recipe the visitor may see, so the tag and status filters step aside
  const { recipes, loading: recipesLoading } = useRecipes({
    sort: sortOption,
    archived: false,
    tags: searching ? undefined : activeTagIds,
    status: !editor ? 'ready' : searching || statusFilter === 'all' ? undefined : statusFilter,
  })
  const filtersActive = Boolean(tagParam) || (editor && statusFilter !== 'all')
  usePageTitle(
    tagParam && filterTags?.length
      ? `${tNav('recipes')}: ${filterTags.map((tag) => tag.displayName).join(', ')}`
      : tNav('recipes')
  )
  const { updateRecipes } = useRecipeMutations()

  const { selection, select, selectAll, clear, topBarMode } = useRecipeSelection()
  const searchResults = useMemo(() => searchRecipes(recipes, searchTerm), [recipes, searchTerm])
  const { readyTitleMatches, developmentTitleMatches, contentMatches } = searchResults

  const filteredRecipes = useMemo(
    () =>
      searching
        ? [
            ...readyTitleMatches,
            ...developmentTitleMatches,
            ...contentMatches.map(({ recipe }) => recipe),
          ]
        : recipes,
    [searching, recipes, readyTitleMatches, developmentTitleMatches, contentMatches]
  )

  const renderCard = (recipe: Recipe, contentMatch?: ContentMatch) => (
    <RecipeCard
      key={recipe.id}
      highlight={searchTerm}
      contentMatch={contentMatch}
      selectionMode={selection.length > 0}
      tags={recipe.tags}
      recipeData={recipe}
      isSelected={selection.includes(recipe.id)}
      onSelect={editor ? (selected) => select(recipe.id, selected) : undefined}
    />
  )

  const handleTagFilterChange = (newTags: Tag[]) => {
    if (!newTags.length) {
      navigate('/', { replace: true })
      return
    }

    const tagIdList = newTags.map((t) => t.id).join(',')
    navigate(`/?tag=${tagIdList}`, { replace: true })
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
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
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
          </div>
          {topBarMode === 'search' && <NewRecipeButton />}
        </div>
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
      {searching && filtersActive && (
        <p
          className={`m-auto px-3 pt-3 w-full text-sm text-muted-foreground ${selectedLayout === 'list' ? 'max-w-2xl' : 'max-w-7xl'}`}
        >
          {t('searchingAll')}
        </p>
      )}
      <PageLayout variant={selectedLayout} maxCols={layoutGridCols} loading={recipesLoading}>
        {filteredRecipes.length > 0 ? (
          <>
            {searching
              ? [
                  ...readyTitleMatches.map((recipe) => renderCard(recipe)),
                  ...developmentTitleMatches.map((recipe) => renderCard(recipe)),
                  ...contentMatches.map(({ recipe, match }) => renderCard(recipe, match)),
                ]
              : recipes.map((recipe) => renderCard(recipe))}
          </>
        ) : (
          <EmptyState
            title={
              searching
                ? t('noSearchResults')
                : t(statusFilter === 'all' ? 'emptyTitle' : 'emptyFilteredTitle')
            }
            description={
              searching
                ? t('noSearchResultsDescription')
                : t(statusFilter === 'all' ? 'emptyDescription' : 'emptyFilteredDescription')
            }
            icon={BookOpenText}
            action={
              editor &&
              !searching && (
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
