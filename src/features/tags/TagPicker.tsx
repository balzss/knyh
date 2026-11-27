import { useMemo, useState } from 'react'
import { useTranslations } from 'use-intl'
import { TagIcon, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { myToast } from '@/components/feedback/toast'
import { getErrorMessage } from '@/lib/utils'
import { foldTagName, MAX_TAG_NAME_LENGTH, normalizeTagName } from '@shared/tag-name'
import type { Tag } from '@shared/types'
import { useTags } from './use-tags'
import { useTagMutations } from './use-tag-mutations'

type TagPickerProps = {
  /** Ids already on the recipe or filter; these are not offered again. */
  selectedIds: ReadonlySet<string>
  onPick: (tag: Tag) => void
  buttonLabel: string
  allowCreate: boolean
}

const matchesSearch = (value: string, search: string) =>
  foldTagName(value).includes(foldTagName(search)) ? 1 : 0

export function TagPicker({ selectedIds, onPick, buttonLabel, allowCreate }: TagPickerProps) {
  const t = useTranslations('TagActions')
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { tags: allTags } = useTags()
  const { createTag } = useTagMutations()

  const available = useMemo(
    () => allTags.filter((tag) => !selectedIds.has(tag.id)),
    [allTags, selectedIds]
  )
  const existingNames = useMemo(
    () => new Set(allTags.map((tag) => foldTagName(tag.displayName))),
    [allTags]
  )

  const newName = normalizeTagName(searchTerm)
  const canCreate =
    allowCreate &&
    newName.length > 0 &&
    !existingNames.has(foldTagName(newName)) &&
    !createTag.isPending

  const close = () => {
    setOpen(false)
    setSearchTerm('')
  }

  const pick = (tag: Tag) => {
    close()
    onPick(tag)
  }

  const handleCreate = async () => {
    if (!canCreate) return
    try {
      pick(await createTag.mutateAsync({ displayName: newName }))
    } catch (e: unknown) {
      console.error(e)
      myToast?.({ message: getErrorMessage(e) })
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearchTerm('')
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open}>
          <TagIcon />
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command filter={matchesSearch}>
          <CommandInput
            placeholder={allowCreate ? t('findOrCreateTag') : t('findTag')}
            value={searchTerm}
            onValueChange={setSearchTerm}
            maxLength={MAX_TAG_NAME_LENGTH}
          />
          <CommandList>
            {/* With creating on, an unmatched search always offers the create item instead. */}
            {!allowCreate && <CommandEmpty>{t('noTagFound')}</CommandEmpty>}
            {available.length > 0 && (
              <CommandGroup>
                {available.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.displayName}
                    onSelect={() => pick(tag)}
                    className="cursor-pointer pl-8"
                  >
                    {tag.displayName}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
            {canCreate && (
              <CommandGroup forceMount>
                <CommandItem
                  forceMount
                  onSelect={handleCreate}
                  value={`__create__${newName}`}
                  className="cursor-pointer"
                >
                  <Plus />
                  {t('createTagOption', { name: newName })}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
