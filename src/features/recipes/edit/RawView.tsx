import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState, type MutableRefObject } from 'react'
import { useTranslations } from 'use-intl'
import { FileWarning, HelpCircle } from 'lucide-react'
import EditorModule from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-markdown'
import './custom-prism-theme.css'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/layout/PageLayout'
import { HelpDialog } from './HelpDialog'
import { LlmPrompt } from './LlmPrompt'
import { myToast } from '@/components/feedback/toast'
import { useRecipeMutations } from '@/features/recipes/hooks/use-recipe-mutations'
import { getErrorMessage } from '@/lib/utils'
import { getRecipeEditUrl } from '@/lib/urls'
import type { Recipe, RecipeDraft } from '@shared/types'
import { parseMarkdown, mergeIngredientGroups } from '@/features/recipes/lib/recipe-utils'
import { recipeToMarkdown } from '@shared/recipe-markdown'
import type { DraftGetter } from './use-save-action'
import { useSaveAction, type SaveAction } from './use-save-action'

// The package is CommonJS (`exports.default = Editor`). Depending on the bundler's interop, the default
// import is the component itself or the whole exports object, so accept both.
const Editor =
  (EditorModule as unknown as { default?: typeof EditorModule }).default ?? EditorModule

type RawViewProps = {
  initialRecipe?: Recipe
  /** Content carried over from form mode */
  draft?: RecipeDraft | null
  draftGetter?: MutableRefObject<DraftGetter | null>
  onSaveActionChange?: (action: SaveAction | null) => void
}

export function RawView({ initialRecipe, draft, draftGetter, onSaveActionChange }: RawViewProps) {
  const t = useTranslations('RawView')
  const tForm = useTranslations('FormView') // reuse success messages
  const navigate = useNavigate()
  const { createRecipe, updateRecipe } = useRecipeMutations()

  // What the markdown is based on: the carried-over draft, else the recipe being edited
  const base = draft ?? initialRecipe ?? null
  const [code, setCode] = useState(() => (base ? recipeToMarkdown(base) : ''))
  const parsed = useMemo(() => parseMarkdown(code), [code])
  const isMultipleRecipes = parsed.length > 1
  const firstRecipe = parsed[0] || null

  // Let the parent read the markdown when switching to form mode. Tags and ingredient groups
  // can't be written in markdown, so they come from what the markdown was based on.
  useEffect(() => {
    if (!draftGetter) return
    draftGetter.current = () => {
      if (!code.trim()) return null
      if (parsed.length !== 1) return undefined
      const [recipe] = parsed
      return {
        title: recipe.title,
        ingredients: mergeIngredientGroups(base?.ingredients, recipe.ingredients),
        instructions: recipe.instructions,
        notes: recipe.notes,
        tags: base?.tags ?? [],
        totalTime: recipe.totalTime || null,
        yield: recipe.yield || null,
        status: recipe.status ?? base?.status ?? 'development',
      }
    }
    return () => {
      draftGetter.current = null
    }
  }, [draftGetter, code, parsed, base])

  const isValid = parsed.length > 0 && parsed.every((r) => r.title)
  const isSaving = createRecipe.isPending || updateRecipe.isPending

  const showSaveError = (error: unknown) =>
    myToast({ message: `${tForm('saveFailed')} ${getErrorMessage(error)}` })

  const handleSave = () => {
    if (!isValid || isSaving) return

    if (isMultipleRecipes) {
      // Create multiple recipes
      const now = new Date()
      const payloads = parsed.map((recipe) => ({
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        notes: recipe.notes,
        tags: [], // bulk recipes don't have tags initially
        totalTime: recipe.totalTime || '',
        yield: recipe.yield || '',
        archived: false,
        status: recipe.status ?? 'development',
        createdAt: now,
        updatedAt: now,
      }))

      createRecipe.mutate(payloads, {
        onError: showSaveError,
        onSuccess: (created) => {
          navigate('/')
          myToast({
            message: `${created.length} ${created.length === 1 ? tForm('recipeCreated') : 'recipes created!'}`,
          })
        },
      })
    } else if (firstRecipe) {
      // Single recipe logic
      const now = new Date()
      const payload = {
        title: firstRecipe.title,
        ingredients: firstRecipe.ingredients,
        instructions: firstRecipe.instructions,
        notes: firstRecipe.notes,
        tags: base?.tags ?? [],
        totalTime: firstRecipe.totalTime || initialRecipe?.totalTime || '',
        yield: firstRecipe.yield || initialRecipe?.yield || '',
        archived: initialRecipe?.archived ?? false,
        status: firstRecipe.status ?? base?.status ?? 'development',
        createdAt: initialRecipe?.createdAt ?? now,
        updatedAt: now,
      }

      if (initialRecipe) {
        updateRecipe.mutate(
          { id: initialRecipe.id, data: payload },
          {
            onError: showSaveError,
            onSuccess: () => {
              myToast({ message: tForm('recipeUpdated') })
            },
          }
        )
      } else {
        createRecipe.mutate(payload, {
          onError: showSaveError,
          onSuccess: (created) => {
            navigate(getRecipeEditUrl(created[0].id), { replace: true })
            myToast({ message: tForm('recipeCreated') })
          },
        })
      }
    }
  }

  useSaveAction(onSaveActionChange, {
    label: isMultipleRecipes ? `Save ${parsed.length} recipes` : t('saveRecipe'),
    disabled: !isValid || isSaving,
    onSave: handleSave,
  })

  const renderCheckButton = () => {
    if (!isValid) {
      const errorMsg =
        parsed.length === 0
          ? t('emptyRecipeWarning')
          : `Invalid recipe format (${parsed.length} recipes found)`

      return (
        <HelpDialog
          trigger={
            <Button className="justify-self-start mb-2" variant="outline">
              <FileWarning />
              {t('badFormatting')}
            </Button>
          }
          title={t('badFormatting')}
          content={errorMsg}
        />
      )
    }

    return null
  }

  return (
    <PageLayout>
      <div className="flex gap-2 mb-2">
        {renderCheckButton()}
        <HelpDialog
          trigger={
            <Button variant="outline" className="h-9">
              <HelpCircle className="mr-1" />
              {t('helpButton')}
            </Button>
          }
          title={t('helpTitle')}
          content={
            <div className="space-y-4 text-sm leading-relaxed">
              <p>{t('helpIntroSimple')}</p>
              <pre className="bg-muted/40 p-2 rounded overflow-auto text-xs whitespace-pre-wrap">
                {t('exampleRecipeSimple')}
              </pre>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t('ruleStartTitle')}</li>
                <li>{t('ruleOptionalMeta')}</li>
                <li>{t('ruleIngredientsSimple')}</li>
                <li>{t('ruleInstructionsSimple')}</li>
                <li>{t('ruleNotes')}</li>
                <li>{t('ruleBulk')}</li>
              </ul>
              <p className="text-xs text-muted-foreground">{t('hintTips')}</p>
              <LlmPrompt />
            </div>
          }
        />
      </div>
      <Editor
        name="markdown-recipe-editor"
        textareaClassName="code-editor"
        autoFocus
        placeholder={t('exampleRecipeSimple')}
        value={code}
        onValueChange={(code) => setCode(code)}
        highlight={(code) => highlight(code, languages.markdown, 'markdown')}
        className="min-h-80 text-sm md-editor"
        spellCheck
        style={{
          fontFamily: '"Noto Sans Mono", monospace',
        }}
      />
    </PageLayout>
  )
}
