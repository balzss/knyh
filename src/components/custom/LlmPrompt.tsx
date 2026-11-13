import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'use-intl'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LLM_RECIPE_PROMPT } from '@/lib/llm-prompt'
import { myToast } from './myToast'

const COPIED_MESSAGE_MS = 2000

/** The prompt for an LLM that writes recipes in the markdown format, with a button to copy it. */
export function LlmPrompt() {
  const t = useTranslations('RawView')
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LLM_RECIPE_PROMPT)
    } catch {
      myToast({ message: t('copyFailed') })
      return
    }
    setCopied(true)
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopied(false), COPIED_MESSAGE_MS)
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium">{t('llmPromptTitle')}</h3>
      <p className="text-xs text-muted-foreground">{t('llmPromptHint')}</p>
      <pre className="bg-muted/40 p-2 rounded max-h-40 overflow-auto text-xs whitespace-pre-wrap">
        {LLM_RECIPE_PROMPT}
      </pre>
      <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check /> : <Copy />}
        {copied ? t('promptCopied') : t('copyPrompt')}
      </Button>
    </div>
  )
}
