import { useState, type FormEvent } from 'react'
import { useTranslations } from 'use-intl'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTagMutations } from '@/hooks'
import { ApiError } from '@/lib/api'
import type { Tag } from '@/lib/types'
import { myToast } from './myToast'

type RenameTagDialogProps = {
  /** The tag being renamed. The dialog is open while this is set. */
  tag: Tag | null
  onClose: () => void
}

export function RenameTagDialog({ tag, onClose }: RenameTagDialogProps) {
  return (
    <Dialog open={tag !== null} onOpenChange={(open) => !open && onClose()}>
      {/* Keyed by tag, so the field starts from that tag's name every time it opens */}
      {tag && <RenameTagForm key={tag.id} tag={tag} onClose={onClose} />}
    </Dialog>
  )
}

function RenameTagForm({ tag, onClose }: { tag: Tag; onClose: () => void }) {
  const t = useTranslations('TagActions')
  const { renameTag } = useTagMutations()
  const [name, setName] = useState(tag.displayName)
  const [error, setError] = useState<string | null>(null)

  const trimmed = name.trim()
  const canSubmit = trimmed !== '' && trimmed !== tag.displayName && !renameTag.isPending

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    renameTag.mutate(
      { id: tag.id, displayName: trimmed },
      {
        onSuccess: () => {
          myToast({ message: t('tagRenamed') })
          onClose()
        },
        // A taken name is the only error the person can fix, so say so. Keep the dialog open.
        onError: (err) =>
          setError(
            err instanceof ApiError && err.status === 409 ? t('tagNameTaken') : t('renameFailed')
          ),
      }
    )
  }

  return (
    <DialogContent className="w-11/12 sm:max-w-md rounded-lg">
      <DialogHeader>
        <DialogTitle>{t('renameTag')}</DialogTitle>
        <DialogDescription>{t('renameDescription')}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-3">
        <div className="grid gap-2">
          <Label htmlFor="rename-tag-input">{t('tagNameLabel')}</Label>
          <Input
            id="rename-tag-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            onFocus={(e) => e.currentTarget.select()}
            maxLength={100}
            autoComplete="off"
            autoFocus
            aria-invalid={error !== null}
            aria-describedby={error ? 'rename-tag-error' : undefined}
          />
          {error && (
            <p id="rename-tag-error" role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('cancel')}
            </Button>
          </DialogClose>
          <Button type="submit" disabled={!canSubmit}>
            {t('rename')}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
