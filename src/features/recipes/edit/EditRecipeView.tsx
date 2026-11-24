import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { Ellipsis, Save, TextCursorInput, FileText } from 'lucide-react'
import { PageShell } from '@/app/layout/PageShell'
import { CloseButton } from '@/components/layout/CloseButton'
import { IconButton } from '@/components/inputs/IconButton'
import { myToast } from '@/components/feedback/toast'
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
import { FormView } from './FormView'
import { RawView } from './RawView'
import type { DraftGetter, SaveAction } from './use-save-action'
import { useRecipes } from '@/features/recipes/hooks/use-recipes'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { useClosePage } from '@/hooks/use-close-page'
import { getRecipeViewUrl } from '@/lib/urls'
import { useIdeaMutations } from '@/features/ideas/use-ideas'
import { ApiError } from '@/lib/api'
import type { FromIdeaState, RecipeDraft } from '@shared/types'
import { usePageTitle } from '@/hooks/use-page-title'
import {
  clearRecipeDraft,
  loadRecipeDraft,
  saveRecipeDraft,
} from '@/features/recipes/lib/recipe-draft-cache'

const DRAFT_SAVE_INTERVAL_MS = 1000

/**
 * Reads what the user has entered in the current view. `null` means nothing to carry over,
 * `undefined` means the content can't be converted to the other mode.
 */

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
  // A new recipe starts from the draft left on this device, if there is one
  const [draft, setDraft] = useState<RecipeDraft | null>(() =>
    recipeId ? null : loadRecipeDraft()
  )
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
  usePageTitle(recipeToEdit ? `${t('editRecipe')}: ${recipeToEdit.title}` : t('newRecipe'))
  const inNewRecipeMode = !recipeId // if there is no recipe id, this is a new recipe

  // Keep what the user has entered so an accidental exit or reload doesn't lose a new recipe
  useEffect(() => {
    if (!inNewRecipeMode) return
    if (draft) myToast({ message: t('draftRestored') })
    let lastSaved = ''
    const timer = setInterval(() => {
      const current = draftGetter.current?.()
      // undefined: no view mounted, or markdown that isn't a single recipe yet
      if (current === undefined) return
      if (current === null) return clearRecipeDraft()
      const serialized = JSON.stringify(current)
      if (serialized === lastSaved) return
      lastSaved = serialized
      saveRecipeDraft(current)
    }, DRAFT_SAVE_INTERVAL_MS)
    return () => clearInterval(timer)
    // The restore notice only matters for the draft the page opened with
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inNewRecipeMode])

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

  const closePage = useClosePage()
  // An existing recipe closes to its view page, wherever the editor was opened from
  const leavePage = () =>
    recipeId ? navigate(getRecipeViewUrl(recipeId), { replace: true }) : closePage()

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
    <PageShell
      hideSidebarToggleMobile
      topBarContent={
        <div className="flex items-center gap-2">
          <CloseButton onClick={handleClosePage} />
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
                {t(inNewRecipeMode ? 'clearRecipe' : 'resetChanges')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {(inNewRecipeMode || recipeToEdit) && (
        <>
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
        </>
      )}
    </PageShell>
  )
}
