import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { X, Ellipsis } from 'lucide-react'
import { TopBar, AppSidebar, IconButton } from '@/components/custom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import FormView from './form-view'
import RawView from './raw-view'
import { useRecipes, useConfirmDialog } from '@/hooks'
import type { RecipeDraft } from '@/lib/types'

/**
 * Reads what the user has entered in the current view. `null` means nothing to carry over,
 * `undefined` means the content can't be converted to the other mode.
 */
export type DraftGetter = () => RecipeDraft | null | undefined

type NewRecipeViewProps = {
  recipeId?: string
  resetTrigger?: number
}

export default function EditRecipeView({ recipeId }: NewRecipeViewProps) {
  const [formResetTrigger, setFormResetTrigger] = useState<number>(0)
  // What the user entered, handed from one mode to the other when switching
  const [draft, setDraft] = useState<RecipeDraft | null>(null)
  const draftGetter = useRef<DraftGetter | null>(null)
  const { confirm } = useConfirmDialog()

  const t = useTranslations('EditRecipeView')
  const [mode, setMode] = useState<'form' | 'raw'>('form')

  const navigate = useNavigate()
  const { recipes } = useRecipes({
    ids: recipeId ? [recipeId] : [],
  })

  const recipeToEdit = recipeId ? recipes[0] : undefined
  const inNewRecipeMode = !recipeId // if there is no recipe id, this is a new recipe

  const handleSwitchMode = async () => {
    const current = draftGetter.current?.()

    // Only ask when the markdown can't be read as a single recipe, because then it can't be carried over
    if (current === undefined) {
      const discard = await confirm({
        title: t('cannotConvertTitle'),
        description: t('cannotConvertDescription'),
        confirmText: t('discard'),
        destructive: true,
      })
      if (!discard) return
    }

    setDraft(current ?? null)
    setMode((current) => (current === 'raw' ? 'form' : 'raw'))
  }

  const handleClosePage = () => {
    if (window.history.length > 1 && document.referrer === '') {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="flex w-full">
      <TopBar
        hideSidebarToggleMobile
        customTopbarContent={
          <div className="flex items-center gap-2">
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<X />}
              tooltip={t('close')}
              onClick={handleClosePage}
            />
            <span className="mr-auto sm:mr-4 font-bold">
              {t(recipes[0]?.id ? 'editRecipe' : 'newRecipe')}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  iconSize="normal"
                  variant="ghost"
                  icon={<Ellipsis />}
                  tooltip={t('moreOptions')}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setFormResetTrigger((n) => n + 1)}>
                  {t('resetChanges')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSwitchMode}>
                  {t(mode === 'raw' ? 'switchToForm' : 'switchToMarkdown')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      <AppSidebar path="/new" />

      {(inNewRecipeMode || recipeToEdit) && (
        <main className="w-full mt-16 mx-auto">
          {mode === 'raw' ? (
            <RawView initialRecipe={recipeToEdit} draft={draft} draftGetter={draftGetter} />
          ) : (
            <FormView
              initialRecipe={recipeToEdit}
              resetTrigger={formResetTrigger}
              draft={draft}
              draftGetter={draftGetter}
            />
          )}
        </main>
      )}
    </div>
  )
}
