import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { Archive, ArchiveRestore, Trash2, BookOpenText, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { PageShell } from '@/app/layout/PageShell'
import { PageLayout } from '@/components/layout/PageLayout'
import { RecipeCard } from '@/features/recipes/components/RecipeCard'
import { myToast } from '@/components/feedback/toast'
import { EmptyState } from '@/components/layout/EmptyState'
import { TopBarSearchSelect } from '@/features/recipes/components/TopBarSearchSelect'
import { useRecipes } from '@/features/recipes/hooks/use-recipes'
import { useRecipeSelection } from '@/features/recipes/hooks/use-recipe-selection'
import { useRecipeMutations } from '@/features/recipes/hooks/use-recipe-mutations'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { useViewPreferences } from '@/hooks/use-view-preferences'
import type { Recipe } from '@shared/types'
import { useEditMode } from '@/app/providers/EditModeProvider'
import { usePageTitle } from '@/hooks/use-page-title'

export default function ArchivePage() {
  const t = useTranslations('ArchivePage')
  usePageTitle(t('title'))
  const { editor } = useEditMode()
  const { layout: selectedLayout, status: statusFilter } = useViewPreferences()
  const { recipes, loading: recipesLoading } = useRecipes({
    archived: true,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const { updateRecipes, deleteRecipes } = useRecipeMutations()
  const { confirmDelete } = useConfirmDialog()

  const { selection, select, selectAll, clear, topBarMode } = useRecipeSelection()
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleUnarchive = () => {
    updateRecipes.mutate(
      { ids: selection, data: { archived: false } },
      {
        onSuccess: () => {
          clear()
        },
      }
    )
  }

  const handleBulkDelete = async () => {
    if (selection.length === 0) return
    // Reuse confirm dialog; show count in name
    const confirmed = await confirmDelete({ name: `${selection.length} item(s)` })
    if (!confirmed) return
    deleteRecipes.mutate(selection, {
      onSuccess: (ids) => {
        myToast({
          message: `${ids.length} recipe${ids.length === 1 ? '' : 's'} deleted`,
        })
        clear()
      },
    })
  }

  return (
    <PageShell
      hideSidebarToggleMobile={topBarMode === 'select'}
      sidebarPath="/archive"
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
              onClick: () => selectAll(recipes.map((r) => r.id)),
              disabled: selection.length === recipes.length,
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
    >
      <PageLayout variant={selectedLayout} loading={recipesLoading}>
        {recipes.length === 0 && (
          <EmptyState
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            icon={Archive}
            action={
              <Button asChild>
                <Link to="/" className="inline-flex items-center gap-2">
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
                selectionMode={selection.length > 0}
                recipeData={recipe}
                tags={recipe.tags}
                isSelected={selection.includes(recipe.id)}
                onSelect={editor ? (selected) => select(recipe.id, selected) : undefined}
                archivedMode
              />
            )
          })}
      </PageLayout>
    </PageShell>
  )
}
