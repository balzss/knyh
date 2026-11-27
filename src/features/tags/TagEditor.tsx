import { useMemo, useRef } from 'react'
import { useTranslations } from 'use-intl'
import { X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/inputs/IconButton'
import { cn } from '@/lib/utils'
import { sortTags, type Tag } from '@shared/types'
import { TagPicker } from './TagPicker'

type TagEditorProps = {
  tags: Tag[]
  onTagChange: (tags: Tag[]) => void
  label: string
  buttonLabel: string
  className?: string
  /** Allow creating new tags (only on new recipe form). */
  allowCreate?: boolean
}

export function TagEditor({
  tags,
  onTagChange,
  label,
  buttonLabel,
  className,
  allowCreate = false,
}: TagEditorProps) {
  const t = useTranslations('TagActions')

  // A tag can be created while another change lands, so add to the latest list, not a captured one.
  const tagsRef = useRef(tags)
  tagsRef.current = tags

  const selectedIds = useMemo(() => new Set(tags.map((tag) => tag.id)), [tags])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            className="flex pl-5 pr-2 rounded-3xl gap-1 text-sm h-9"
            variant="outline"
          >
            {tag.displayName}
            <IconButton
              icon={<X />}
              tooltip={t('removeFromRecipe')}
              iconSize="small"
              onClick={() => onTagChange(tags.filter((other) => other.id !== tag.id))}
            />
          </Badge>
        ))}
        <TagPicker
          selectedIds={selectedIds}
          onPick={(tag) => onTagChange(sortTags([...tagsRef.current, tag]))}
          buttonLabel={buttonLabel}
          allowCreate={allowCreate}
        />
      </div>
    </div>
  )
}
