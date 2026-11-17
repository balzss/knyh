import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from 'use-intl'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { Lightbulb } from 'lucide-react'
import { PageShell } from '@/app/layout/PageShell'
import { EditorOnly } from '@/components/layout/EditorOnly'
import { EmptyState } from '@/components/layout/EmptyState'
import { IdeaCard } from './IdeaCard'
import { Loader } from '@/components/layout/Loader'
import { PageLayout } from '@/components/layout/PageLayout'
import { myToast } from '@/components/feedback/toast'
import { Input } from '@/components/ui/input'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { useIdeaMutations, useIdeas } from './use-ideas'
import type { FromIdeaState, Idea } from '@shared/types'
import { getRecipeEditUrl } from '@/lib/urls'

export default function IdeasPage() {
  const t = useTranslations('IdeasPage')
  const tConfirm = useTranslations('ConfirmDialog')
  const navigate = useNavigate()
  const { ideas, loading } = useIdeas()
  const { createIdea, updateIdea, deleteIdea, reorderIdeas, developIdea } = useIdeaMutations()
  const { confirm, confirmDelete } = useConfirmDialog()
  const [draft, setDraft] = useState('')

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault()
    const title = draft.trim()
    if (title === '') return
    // Clear right away so the next idea can be typed. Put the text back if it fails.
    setDraft('')
    createIdea.mutate(
      { title },
      {
        onError: () => {
          setDraft((current) => current || title)
          myToast({ message: t('saveFailed') })
        },
      }
    )
  }

  const handleMove = (id: string, direction: 'up' | 'down' | 'top') => {
    const ids = ideas.map((idea) => idea.id)
    const from = ids.indexOf(id)
    const to = direction === 'top' ? 0 : direction === 'up' ? from - 1 : from + 1
    if (from === -1 || to < 0 || to >= ids.length) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    reorderIdeas.mutate(ids)
  }

  const handleDelete = async (id: string, title: string) => {
    if (await confirmDelete({ name: title })) deleteIdea.mutate(id)
  }

  // The idea becomes a recipe in development and opens in the editor. Closing the editor
  // before anything is saved undoes this, which is why the idea travels along in the state.
  const handleDevelop = async (idea: Idea, index: number) => {
    const confirmed = await confirm({
      title: t('developTitle', { title: idea.title }),
      description: t('developDescription'),
      confirmText: t('startDeveloping'),
      cancelText: tConfirm('cancelButton'),
    })
    if (!confirmed) return
    developIdea.mutate(idea.id, {
      onSuccess: (recipe) => {
        const state: FromIdeaState = { fromIdea: { idea, index } }
        navigate(getRecipeEditUrl(recipe.id), { state })
      },
      onError: () => myToast({ message: t('developFailed') }),
    })
  }

  return (
    <EditorOnly>
      <PageShell
        sidebarPath="/ideas"
        topBarContent={<span className="mr-4 font-bold">{t('title')}</span>}
      >
        <PageLayout className="gap-3">
          <form onSubmit={handleAdd}>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && !e.nativeEvent.isComposing) e.currentTarget.blur()
              }}
              placeholder={t('quickAddPlaceholder')}
              aria-label={t('quickAddLabel')}
              autoComplete="off"
              enterKeyHint="done"
            />
          </form>

          {loading ? (
            <Loader />
          ) : ideas.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title={t('emptyTitle')}
              description={t('emptyDescription')}
            />
          ) : (
            <MotionConfig reducedMotion="user">
              <div className="grid gap-3">
                {/* No entrance animation for the ideas already there when the page opens */}
                <AnimatePresence initial={false}>
                  {ideas.map((idea, index) => (
                    // layout="position" slides cards to their new place without stretching them
                    <motion.div
                      key={idea.id}
                      layout="position"
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <IdeaCard
                        idea={idea}
                        rank={index + 1}
                        isFirst={index === 0}
                        isLast={index === ideas.length - 1}
                        busy={developIdea.isPending}
                        onSave={(data) =>
                          updateIdea.mutate(
                            { id: idea.id, ...data },
                            { onError: () => myToast({ message: t('saveFailed') }) }
                          )
                        }
                        onMove={(direction) => handleMove(idea.id, direction)}
                        onDelete={() => handleDelete(idea.id, idea.title)}
                        onDevelop={() => handleDevelop(idea, index)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </MotionConfig>
          )}
        </PageLayout>
      </PageShell>
    </EditorOnly>
  )
}
