import { useState, useMemo } from 'react'
import { TagIcon, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/custom'
import { useTags, useTagMutations } from '@/hooks'
import { myToast } from '@/components/custom'
import { getErrorMessage } from '@/lib/utils'
import type { Tag } from '@/lib/types'

type TagEditorProps = {
  tags: Tag[]
  onTagChange: (tags: Tag[]) => void
  label: string
  buttonLabel: string
  className?: string
}

export function TagEditor({ tags, onTagChange, label, buttonLabel, className }: TagEditorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { tags: tagsData } = useTags()
  const { createTag } = useTagMutations()

  const tagList = useMemo(
    () => tagsData?.filter((tag) => !tags.find((t) => t.id === tag.id)),
    [tagsData, tags]
  )

  const normalizedExisting = useMemo(
    () => new Set(tagsData.map((t) => t.displayName.toLowerCase())),
    [tagsData]
  )

  const trimmedSearch = searchTerm.trim()
  const isDuplicate = normalizedExisting.has(trimmedSearch.toLowerCase())
  // Show create only when trimmed value is non-empty and not already existing (ignores trailing spaces)
  const canCreate = trimmedSearch.length > 0 && !isDuplicate

  const handleCreate = async () => {
    if (!canCreate) return
    try {
      const newTag = await createTag.mutateAsync({ displayName: trimmedSearch })
      onTagChange([...tags, newTag])
      setSearchTerm('')
      setOpen(false)
    } catch (e: unknown) {
      console.error(e)
      myToast?.({ message: getErrorMessage(e) })
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            className="flex pl-5 pr-2 rounded-3xl gap-1 text-sm"
            variant="outline"
          >
            {tag.displayName}
            <IconButton
              icon={<X />}
              tooltip="Remove tag"
              iconSize="small"
              onClick={() => onTagChange(tags.filter((t) => t.id !== tag.id))}
            />
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open}>
              <TagIcon />
              {buttonLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Find or create tag"
                value={searchTerm}
                onValueChange={setSearchTerm}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canCreate) {
                    e.preventDefault()
                    void handleCreate()
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>No tag found.</CommandEmpty>
                {tagList && tagList.length > 0 && (
                  <CommandGroup>
                    {tagList.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.displayName}
                        onSelect={() => {
                          setOpen(false)
                          setSearchTerm('')
                          onTagChange([...tags, tag])
                          // Clear the input
                          setSearchTerm('')
                        }}
                        className="cursor-pointer pl-8"
                      >
                        {tag.displayName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandSeparator />
                {canCreate && (
                  <CommandGroup>
                    <CommandItem
                      disabled={createTag.isPending}
                      onSelect={handleCreate}
                      value={`__create__${trimmedSearch}`}
                      className="cursor-pointer"
                    >
                      <Plus />
                      {`Create tag "${trimmedSearch}"`}
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {tags && tags?.length > 0 && (
          <IconButton
            icon={<X />}
            tooltip="Clear selected tags"
            onClick={() => onTagChange([])}
            variant="outline"
          />
        )}
      </div>
    </div>
  )
}
