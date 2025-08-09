'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FileWarning, Save } from 'lucide-react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism-dark.css'
import { Button } from '@/components/ui/button'
import { PageLayout, HelpDialog } from '@/components/custom'
import type { Recipe } from '@/lib/types'

const placeHolder = `# Recipe title

- first ingredient
- second ingredient`

type RawViewProps = {
  initialRecipe?: Recipe
}

export default function RawView({ initialRecipe }: RawViewProps) {
  const t = useTranslations('RawView')
  const [code, setCode] = useState('')

  console.log({ initialRecipe })

  const renderCheckButton = () => {
    if (code === '') {
      return (
        <HelpDialog
          trigger={
            <Button className="justify-self-start mb-2" variant="outline">
              <FileWarning />
              {t('badFormatting')}
            </Button>
          }
          title={t('badFormatting')}
          content={t('emptyRecipeWarning')}
        />
      )
    }

    return (
      <Button className="justify-self-start mb-2">
        <Save />
        {t('saveRecipe')}
      </Button>
    )
  }

  return (
    <PageLayout>
      {renderCheckButton()}
      <Editor
        name="markdown-recipe-editor"
        textareaClassName="code-editor"
        autoFocus
        placeholder={placeHolder}
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
