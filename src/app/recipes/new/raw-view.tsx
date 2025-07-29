import { useState } from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism-dark.css'
import { PageLayout } from '@/components/custom'

export default function RawView() {
  const [code, setCode] = useState(`# add you recipe\n\n- first ingredient\n- second ingredient`)
  return (
    <PageLayout>
      <Editor
        value={code}
        onValueChange={(code) => setCode(code)}
        highlight={(code) => highlight(code, languages.markdown, 'markdown')}
        padding={12}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
        }}
      />
    </PageLayout>
  )
}
