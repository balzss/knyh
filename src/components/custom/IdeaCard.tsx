import { useRef, useState } from 'react'
import { useTranslations } from 'use-intl'
import { ArrowDown, ArrowUp, ArrowUpToLine, Hammer, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { IconButton, SortableList } from '@/components/custom'
import type { Idea } from '@/lib/types'

type IdeaCardProps = {
  idea: Idea
  /** Place in the list, starting at 1 */
  rank: number
  isFirst: boolean
  isLast: boolean
  busy?: boolean
  onSave: (data: { title: string; notes: string[] }) => void
  onMove: (direction: 'up' | 'down' | 'top') => void
  onDelete: () => void
  onDevelop: () => void
}

const cleanNotes = (notes: string[]) => notes.filter((note) => note.trim() !== '')

/**
 * One idea: a title and a list of notes. The card keeps its own copy of the text while it is
 * being edited, and saves when a field loses focus or a note is added, removed or moved.
 */
export function IdeaCard({
  idea,
  rank,
  isFirst,
  isLast,
  busy = false,
  onSave,
  onMove,
  onDelete,
  onDevelop,
}: IdeaCardProps) {
  const t = useTranslations('IdeasPage')
  const [title, setTitle] = useState(idea.title)
  const [notes, setNotes] = useState(idea.notes)
  const saved = useRef(JSON.stringify({ title: idea.title, notes: cleanNotes(idea.notes) }))

  const save = (nextTitle: string, nextNotes: string[]) => {
    // An idea needs a title. Put the last saved one back instead of saving a blank.
    const trimmed = nextTitle.trim()
    if (trimmed === '') {
      setTitle(idea.title)
      return
    }
    const data = { title: trimmed, notes: cleanNotes(nextNotes) }
    const serialized = JSON.stringify(data)
    if (serialized === saved.current) return
    saved.current = serialized
    onSave(data)
  }

  // Typing changes one note and nothing else. Wait for blur to save those.
  const handleNotesChange = (next: string[]) => {
    const isTyping =
      next.length === notes.length && next.filter((note, i) => note !== notes[i]).length === 1
    setNotes(next)
    if (!isTyping) save(title, next)
  }

  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0 text-center text-sm font-semibold text-muted-foreground">
          {rank}
        </span>
        <Input
          value={title}
          aria-label={t('titleLabel')}
          autoComplete="off"
          className="h-9 flex-1 border-0 px-1 text-lg font-semibold shadow-none focus-visible:ring-1"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => save(title, notes)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !e.nativeEvent.isComposing) e.currentTarget.blur()
          }}
        />
      </div>

      <SortableList
        addItemLabel={t('addNote')}
        items={notes}
        onItemsChange={handleNotesChange}
        onItemBlur={(items) => save(title, items)}
        multiLine
        removeEmptyOnBlur
      />

      <div className="flex items-center justify-end">
        <IconButton
          icon={<ArrowUpToLine />}
          tooltip={t('moveToTop')}
          aria-label={t('moveToTop')}
          disabled={isFirst}
          onClick={() => onMove('top')}
        />
        <IconButton
          icon={<ArrowUp />}
          tooltip={t('moveUp')}
          aria-label={t('moveUp')}
          disabled={isFirst}
          onClick={() => onMove('up')}
        />
        <IconButton
          icon={<ArrowDown />}
          tooltip={t('moveDown')}
          aria-label={t('moveDown')}
          disabled={isLast}
          onClick={() => onMove('down')}
        />
        <IconButton
          icon={<Hammer />}
          tooltip={t('startDeveloping')}
          aria-label={t('startDeveloping')}
          disabled={busy}
          onClick={onDevelop}
        />
        <IconButton
          icon={<Trash2 />}
          tooltip={t('delete')}
          aria-label={t('delete')}
          onClick={onDelete}
        />
      </div>
    </Card>
  )
}
