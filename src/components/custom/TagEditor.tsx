import { useState } from 'react'
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
import { useTags } from '@/hooks'
import type { Tag } from '@/lib/data'

type TagEditorProps = {
  tags: Tag[]
  onTagChange: (tags: Tag[]) => void
}

export function TagEditor({ tags, onTagChange }: TagEditorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const { tags: tagsData } = useTags()

  const tagList = tagsData?.filter((tag) => !tags.find((t) => t.id === tag.id))

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-bold">Tags</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.id} className="flex pl-4 pr-1 rounded-md gap-1 text-sm" variant="outline">
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
              Add tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
            <Command>
              <CommandInput placeholder="Find tag" />
              <CommandList>
                <CommandEmpty>No tag found.</CommandEmpty>
                {tagList && tagList.length > 0 && (
                  <CommandGroup>
                    {tagList.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.displayName}
                        onSelect={(currentValue) => {
                          setOpen(false)
                          setValue(currentValue === value ? '' : currentValue)
                          setTimeout(() => {
                            onTagChange([...tags, tag])
                          }, 0)
                        }}
                        className="cursor-pointer pl-8"
                      >
                        {tag.displayName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={(currentValue) => {
                      console.log(currentValue)
                    }}
                    className="cursor-pointer"
                  >
                    <Plus />
                    Create new tag
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
