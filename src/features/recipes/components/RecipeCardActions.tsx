import { useCallback } from 'react'
import { useTranslations } from 'use-intl'
import {
  Archive,
  ArchiveRestore,
  Share2,
  EllipsisVertical,
  Pencil,
  Copy,
  Hammer,
  CircleCheck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconButton } from '@/components/inputs/IconButton'
import { myToast } from '@/components/feedback/toast'
import { ShareDialog } from './ShareDialog'
import { useRecipeMutations } from '@/features/recipes/hooks/use-recipe-mutations'
import { getRecipeViewUrl, getRecipeEditUrl } from '@/lib/urls'
import { useEditMode } from '@/app/providers/EditModeProvider'
import type { Recipe } from '@shared/types'

type RecipeCardActionsProps = {
  recipeData: Recipe
  archivedMode: boolean
  /** Lets the card keep its actions visible while the menu is open */
  onMenuOpenChange: (open: boolean) => void
}

/** The buttons in the bottom corner of a recipe card. Which ones show depends on the mode. */
export function RecipeCardActions({
  recipeData,
  archivedMode,
  onMenuOpenChange,
}: RecipeCardActionsProps) {
  const t = useTranslations('RecipeCard')
  const { editor } = useEditMode()
  const { updateRecipe, createRecipe } = useRecipeMutations()

  const handleDuplicateRecipe = useCallback(async () => {
    const { id: _id, ...recipeDataWithoutId } = recipeData
    const duplicatedRecipe = {
      ...recipeDataWithoutId,
      title: `${recipeData.title} (Copy)`,
      // A copy is new work, so it starts out in development
      status: 'development' as const,
    }
    createRecipe.mutate(duplicatedRecipe, {
      onSuccess: () => {
        myToast({
          message: t('recipeDuplicated'),
        })
      },
    })
  }, [createRecipe, recipeData, t])

  const handleArchiveRecipe = useCallback(
    (archived: boolean = true) => {
      const { id, ...data } = recipeData
      updateRecipe.mutate(
        { id, data: { ...data, archived } },
        {
          onSuccess: () => {
            myToast({
              message: archived ? t('recipeArchived') : t('recipeRestored'),
              action: {
                label: t('undo'),
                onClick: () => updateRecipe.mutate({ id, data: { ...data, archived: !archived } }),
              },
            })
          },
        }
      )
    },
    [updateRecipe, recipeData, t]
  )

  const { id, title, status } = recipeData
  const inDevelopment = status === 'development'

  const handleToggleStatus = useCallback(() => {
    const { id, ...data } = recipeData
    const previous = data.status
    const next = previous === 'development' ? 'ready' : 'development'
    updateRecipe.mutate(
      { id, data: { ...data, status: next } },
      {
        onSuccess: () => {
          myToast({
            message: t('statusChanged', { status: next }),
            action: {
              label: t('undo'),
              onClick: () => updateRecipe.mutate({ id, data: { ...data, status: previous } }),
            },
          })
        },
      }
    )
  }, [updateRecipe, recipeData, t])
  const recipeUrl = `${window.location.origin}${getRecipeViewUrl(id)}`

  if (archivedMode) {
    return (
      editor && (
        <IconButton
          icon={<ArchiveRestore />}
          tooltip={t('restore')}
          iconSize="small"
          onClick={() => handleArchiveRecipe(false)}
        />
      )
    )
  }

  return (
    <>
      {editor && (
        <IconButton
          icon={<Pencil />}
          tooltip={t('edit')}
          iconSize="small"
          href={getRecipeEditUrl(id)}
        />
      )}
      <ShareDialog
        title={title}
        trigger={<IconButton icon={<Share2 />} tooltip={t('share')} iconSize="small" />}
        recipeUrl={recipeUrl}
      />
      {editor && (
        <DropdownMenu onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <IconButton icon={<EllipsisVertical />} tooltip={t('moreOptions')} iconSize="small" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDuplicateRecipe}>
              <Copy className="mr-2 h-4 w-4" />
              {t('duplicate')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              {inDevelopment ? (
                <CircleCheck className="mr-2 h-4 w-4" />
              ) : (
                <Hammer className="mr-2 h-4 w-4" />
              )}
              {inDevelopment ? t('markReady') : t('markDevelopment')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleArchiveRecipe()}>
              <Archive className="mr-2 h-4 w-4" />
              {t('archive')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}
