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

// Placeholder is provided via i18n (RawView.placeholder)

type ParsedRecipe = {
  title: string
  ingredients: string[]
  instructions: string[]
  metadata: { yield: string; totalTime: string }
}

function parseMarkdown(md: string): ParsedRecipe[] {
  const lines = md.split(/\r?\n/).map((l) => l.replace(/\s+$/, '')) // trim right only

  if (!lines.length) return []

  const recipes: ParsedRecipe[] = []
  let currentRecipeLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // If we hit a new # heading and we already have content, process the previous recipe
    if (line.startsWith('# ') && currentRecipeLines.length > 0) {
      const recipe = parseSingleRecipe(currentRecipeLines.join('\n'))
      if (recipe) recipes.push(recipe)
      currentRecipeLines = [line] // start new recipe
    } else {
      currentRecipeLines.push(line)
    }
  }

  // Process the last recipe
  if (currentRecipeLines.length > 0) {
    const recipe = parseSingleRecipe(currentRecipeLines.join('\n'))
    if (recipe) recipes.push(recipe)
  }

  return recipes
}

function parseSingleRecipe(md: string): ParsedRecipe | null {
  const lines = md.split(/\r?\n/).map((l) => l.replace(/\s+$/, '')) // trim right only
  if (!lines.length) return null

  let i = 0
  // Skip initial blank lines
  while (i < lines.length && lines[i].trim() === '') i++
  if (i >= lines.length) return null

  // Title must come first
  const titleLine = lines[i]
  if (!titleLine.startsWith('# ')) return null
  const title = titleLine.slice(2).trim()
  if (!title) return null
  i++

  // Parse frontmatter if present (after title)
  let yieldValue = ''
  let totalTimeValue = ''

  // Skip blank lines after title
  while (i < lines.length && lines[i].trim() === '') i++

  if (i < lines.length && lines[i] === '---') {
    i++ // skip opening ---
    while (i < lines.length && lines[i] !== '---') {
      const line = lines[i].trim()
      if (line) {
        const kv = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+)$/.exec(line)
        if (kv) {
          const key = kv[1].toLowerCase()
          const value = kv[2].trim()
          if (key === 'yield' || key === 'servings') {
            yieldValue = value
          } else if (key === 'time' || key === 'total_time' || key === 'duration') {
            totalTimeValue = value
          }
        }
      }
      i++
    }
    if (i < lines.length && lines[i] === '---') {
      i++ // skip closing ---
    }
  }

  // Skip blank lines before ingredients
  while (i < lines.length && lines[i].trim() === '') i++

  const ingredients: string[] = []
  while (i < lines.length) {
    const line = lines[i].trim()
    if (line === '') break
    if (/^[-*]\s+/.test(line)) {
      ingredients.push(line.replace(/^[-*]\s+/, '').trim())
      i++
      continue
    }
    // Non bullet -> end of ingredients section
    break
  }

  // Skip blank lines between sections
  while (i < lines.length && lines[i].trim() === '') i++

  const instructions: string[] = []
  while (i < lines.length) {
    let line = lines[i].trim()
    if (line === '') {
      i++
      continue
    }
    // Remove ordered / unordered list markers
    line = line.replace(/^(?:\d+[.)]|[-*])\s+/, '')
    instructions.push(line)
    i++
  }

  if (!ingredients.length || !instructions.length) return null
  return {
    title,
    ingredients,
    instructions,
    metadata: { yield: yieldValue, totalTime: totalTimeValue },
  }
}

function recipeToMarkdown(recipe: Recipe): string {
  const header = `# ${recipe.title}`

  const frontmatter: string[] = []
  if (recipe.metadata?.yield) frontmatter.push(`yield: ${recipe.metadata.yield}`)
  if (recipe.metadata?.totalTime) frontmatter.push(`time: ${recipe.metadata.totalTime}`)

  const frontmatterBlock = frontmatter.length ? `\n---\n${frontmatter.join('\n')}\n---\n` : ''

  const ingredients = recipe.ingredients.map((i) => `- ${i}`).join('\n')
  const instructions = recipe.instructions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')
  return `${header}${frontmatterBlock}\n${ingredients}\n\n${instructions}`
}

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

  const placeholder = t('placeholder')

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
        placeholder={placeholder}
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
