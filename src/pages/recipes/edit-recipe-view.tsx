import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { X, Ellipsis, Save, TextCursorInput, FileText } from 'lucide-react'
import { TopBar, AppSidebar, IconButton, myToast } from '@/components/custom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import FormView from './form-view'
import RawView from './raw-view'
import type { SaveAction } from './use-save-action'
import { useRecipes, useConfirmDialog, useIdeaMutations } from '@/hooks'
import { ApiError } from '@/lib/api'
import type { FromIdeaState, RecipeDraft } from '@/lib/types'

/**
 * Reads what the user has entered in the current view. `null` means nothing to carry over,
 * `undefined` means the content can't be converted to the other mode.
 */
export type DraftGetter = () => RecipeDraft | null | undefined

const MODES = [
  { value: 'form', icon: TextCursorInput, labelKey: 'formMode' },
  { value: 'raw', icon: FileText, labelKey: 'markdownMode' },
] as const

type NewRecipeViewProps = {
  recipeId?: string
  resetTrigger?: number
}

export default function EditRecipeView({ recipeId }: NewRecipeViewProps) {
  const [formResetTrigger, setFormResetTrigger] = useState<number>(0)
  // What the user entered, handed from one mode to the other when switching
  const [draft, setDraft] = useState<RecipeDraft | null>(null)
  const draftGetter = useRef<DraftGetter | null>(null)
  const [saveAction, setSaveAction] = useState<SaveAction | null>(null)
  const { confirm } = useConfirmDialog()

  const t = useTranslations('EditRecipeView')
  const tIdeas = useTranslations('IdeasPage')
  const [mode, setMode] = useState<'form' | 'raw'>('form')

  const navigate = useNavigate()
  const location = useLocation()
  const { restoreIdea } = useIdeaMutations()
  // Set when this recipe was just made from an idea
  const fromIdea = (location.state as FromIdeaState | null)?.fromIdea
  const { recipes } = useRecipes({
    ids: recipeId ? [recipeId] : [],
  })

  const recipeToEdit = recipeId ? recipes[0] : undefined
  const inNewRecipeMode = !recipeId // if there is no recipe id, this is a new recipe

  const handleSwitchMode = async (target: 'form' | 'raw') => {
    if (target === mode) return
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
    setMode(target)
  }

  const leavePage = () => {
    if (window.history.length > 1 && document.referrer === '') {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }

  // A recipe made from an idea goes back to being an idea when closed. The server refuses once
  // the recipe has been saved with changes. Then it stays, and Close just leaves.
  const handleClosePage = () => {
    if (!fromIdea || !recipeId) return leavePage()
    if (restoreIdea.isPending) return
    restoreIdea.mutate(
      { recipeId, idea: fromIdea.idea, index: fromIdea.index },
      {
        onSuccess: () => {
          navigate('/ideas', { replace: true })
          myToast({ message: tIdeas('undone') })
        },
        onError: (error) => {
          if (!(error instanceof ApiError && error.status === 409)) {
            myToast({ message: tIdeas('undoFailed') })
          }
          leavePage()
        },
      }
    )
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
              className={inNewRecipeMode ? 'hidden sm:flex' : ''}
              tooltip={t('close')}
              onClick={handleClosePage}
            />
            <span className="mr-auto font-bold">
              {t(recipes[0]?.id ? 'editRecipe' : 'newRecipe')}
            </span>
            {saveAction && (
              <Button
                type="button"
                size="sm"
                variant={saveAction.disabled ? 'ghost' : 'default'}
                aria-label={saveAction.label}
                disabled={saveAction.disabled}
                onClick={saveAction.onSave}
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">{saveAction.label}</span>
              </Button>
            )}
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
                <DropdownMenuLabel>{t('editorMode')}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={mode}
                  onValueChange={(value) => handleSwitchMode(value as typeof mode)}
                >
                  {MODES.map(({ value, icon: Icon, labelKey }) => (
                    <DropdownMenuRadioItem key={value} value={value} className="gap-2">
                      <Icon className="h-4 w-4" />
                      {t(labelKey)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFormResetTrigger((n) => n + 1)}>
                  {t('resetChanges')}
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
            <RawView
              initialRecipe={recipeToEdit}
              draft={draft}
              draftGetter={draftGetter}
              onSaveActionChange={setSaveAction}
            />
          ) : (
            <FormView
              initialRecipe={recipeToEdit}
              resetTrigger={formResetTrigger}
              draft={draft}
              draftGetter={draftGetter}
              onSaveActionChange={setSaveAction}
            />
          )}
        </main>
      )}
    </div>
  )
}
