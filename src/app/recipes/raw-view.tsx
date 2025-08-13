'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { FileWarning, Save, HelpCircle } from 'lucide-react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism-dark.css'
import { Button } from '@/components/ui/button'
import { PageLayout, HelpDialog, myToast } from '@/components/custom'
import { useRecipeMutations } from '@/hooks'
import type { Recipe } from '@/lib/types'
import { parseMarkdown, recipeToMarkdown } from '@/lib/recipe-utils'

// (parsing helpers moved to '@/lib/recipe-utils')

type RawViewProps = {
  initialRecipe?: Recipe
}

export default function RawView({ initialRecipe }: RawViewProps) {
  const t = useTranslations('RawView')
  const tForm = useTranslations('FormView') // reuse success messages
  const router = useRouter()
  const { createRecipe, updateRecipe } = useRecipeMutations()

  const [code, setCode] = useState('')
  const parsed = useMemo(() => parseMarkdown(code), [code])
  const isMultipleRecipes = parsed.length > 1
  const firstRecipe = parsed[0] || null

  // Prefill when editing
  useEffect(() => {
    if (initialRecipe) {
      setCode(recipeToMarkdown(initialRecipe))
    }
  }, [initialRecipe])

  const isValid =
    parsed.length > 0 &&
    parsed.every((r) => r.title && r.ingredients.length && r.instructions.length)
  const isSaving = createRecipe.isPending || updateRecipe.isPending

  const handleSave = () => {
    if (!isValid || isSaving) return

    if (isMultipleRecipes) {
      // Create multiple recipes
      const payloads = parsed.map((recipe) => ({
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        tags: [], // bulk recipes don't have tags initially
        metadata: {
          totalTime: recipe.metadata.totalTime || '',
          yield: recipe.metadata.yield || '',
        },
        archived: false,
      }))

      createRecipe.mutate(payloads, {
        onSuccess: (created) => {
          router.push(`/recipes/${created[0].id}`)
          myToast({
            message: `${created.length} ${created.length === 1 ? tForm('recipeCreated') : 'recipes created!'}`,
          })
        },
      })
    } else if (firstRecipe) {
      // Single recipe logic
      const payload = {
        title: firstRecipe.title,
        ingredients: firstRecipe.ingredients,
        instructions: firstRecipe.instructions,
        tags: initialRecipe ? initialRecipe.tags : [],
        metadata: {
          totalTime: firstRecipe.metadata.totalTime || initialRecipe?.metadata.totalTime || '',
          yield: firstRecipe.metadata.yield || initialRecipe?.metadata.yield || '',
        },
        archived: initialRecipe?.archived ?? false,
      }

      if (initialRecipe) {
        updateRecipe.mutate(
          { id: initialRecipe.id, data: payload },
          {
            onSuccess: (updated) => {
              router.push(`/recipes/${updated.id}`)
              myToast({ message: tForm('recipeUpdated') })
            },
          }
        )
      } else {
        createRecipe.mutate(payload, {
          onSuccess: (created) => {
            router.push(`/recipes/${created[0].id}`)
            myToast({ message: tForm('recipeCreated') })
          },
        })
      }
    }
  }

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

    const buttonText = isMultipleRecipes ? `Save ${parsed.length} recipes` : t('saveRecipe')

    return (
      <Button
        className="justify-self-start mb-2"
        onClick={handleSave}
        disabled={!isValid || isSaving}
      >
        <Save />
        {buttonText}
      </Button>
    )
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
                <li>{t('ruleBulk')}</li>
              </ul>
              <p className="text-xs text-muted-foreground">{t('hintTips')}</p>
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
        className="rounded-lg text-sm min-h-24"
        spellCheck
        style={{
          fontFamily: '"Noto Sans Mono", monospace',
        }}
      />
    </PageLayout>
  )
}
