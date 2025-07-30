'use client'

import { useState } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism-dark.css'
import { PageLayout } from '@/components/custom'

const placeHolder = `# Recipe title

- first ingredient
- second ingredient`

export default function RawView() {
  const [code, setCode] = useState(placeHolder)
  return (
    <PageLayout>
      <Editor
        name="markdown-recipe-editor"
        textareaClassName="code-editor"
        autoFocus
        value={code}
        onValueChange={(code) => setCode(code)}
        highlight={(code) => highlight(code, languages.markdown, 'markdown')}
        className="rounded-lg text-sm"
        spellCheck
        style={{
          fontFamily: '"Noto Sans Mono", monospace',
          borderRadius: 'inherit',
        }}
      />
    </PageLayout>
  )
}
