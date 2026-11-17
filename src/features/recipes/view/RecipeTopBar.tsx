import { useNavigate } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import {
  X,
  Pen,
  EllipsisVertical,
  Share2,
  Trash2,
  Archive,
  Calculator,
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
import { ShareDialog } from '@/features/recipes/components/ShareDialog'
import { useRecipeMutations } from '@/features/recipes/hooks/use-recipe-mutations'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { useEditMode } from '@/app/providers/EditModeProvider'
import { getRecipeEditUrl } from '@/lib/urls'
import type { Recipe } from '@shared/types'

type RecipeTopBarProps = {
  recipe: Recipe
  /** Whether the recipe title has scrolled under the top bar, which shows it here instead */
  titleOffscreen: boolean
  onClose: () => void
  onOpenScale: () => void
}

export function RecipeTopBar({ recipe, titleOffscreen, onClose, onOpenScale }: RecipeTopBarProps) {
  const t = useTranslations('RecipeView')
  const navigate = useNavigate()
  const { editor } = useEditMode()
  const { confirmDelete } = useConfirmDialog()
  const { deleteRecipe, updateRecipe } = useRecipeMutations()

  const handleDeleteRecipe = async () => {
    const confirmed = await confirmDelete({ name: recipe.title })
    if (!confirmed) return

    deleteRecipe.mutate(recipe.id, {
      onSuccess: () => {
        navigate('/')
        myToast({
          message: t('recipeDeleted'),
        })
      },
    })
  }

  const handleArchiveRecipe = () => {
    const { id, ...data } = recipe
    updateRecipe.mutate(
      { id, data: { ...data, archived: true } },
      {
        onSuccess: () => {
          navigate('/')
          myToast({
            message: t('recipeArchived'),
          })
        },
      }
    )
  }

  const handleToggleStatus = () => {
    const { id, ...data } = recipe
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
  }

  return (
    <div className="flex items-center gap-2">
      <IconButton icon={<X />} tooltip={t('closeRecipe')} onClick={onClose} className="mr-2" />
      <span
        className={`mr-auto font-bold truncate transition-opacity duration-150 ${titleOffscreen ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden={!titleOffscreen}
      >
        {recipe.title}
      </span>
      <div className="flex gap-2 items-center">
        {editor && (
          <IconButton icon={<Pen />} tooltip={t('editRecipe')} href={getRecipeEditUrl(recipe.id)} />
        )}
        <ShareDialog
          title={recipe.title}
          trigger={<IconButton icon={<Share2 />} tooltip={t('shareRecipe')} />}
          recipeUrl={window.location.href}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon={<EllipsisVertical />} tooltip={t('moreOptions')} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpenScale}>
              <Calculator className="mr-2 h-4 w-4" />
              {t('adjustAmounts')}
            </DropdownMenuItem>
            {editor && (
              <>
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {recipe.status === 'development' ? (
                    <CircleCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <Hammer className="mr-2 h-4 w-4" />
                  )}
                  {recipe.status === 'development' ? t('markReady') : t('markDevelopment')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchiveRecipe}>
                  <Archive className="mr-2 h-4 w-4" />
                  {t('archiveRecipe')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteRecipe}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('deleteRecipe')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
