import { useState } from 'react'
import { Tag, X, Plus } from 'lucide-react'
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
import { placeholderTags } from '@/lib/mock-data'

type TagEditorProps = {
  tags: string[]
  onTagChange: (tags: string[]) => void
}

export function TagEditor({ tags, onTagChange }: TagEditorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  const tagList = Object.values(placeholderTags).filter((tag) => !tags.includes(tag.displayName))

  return (
    <div className="flex flex-col gap-2">
      <Label className="font-bold">Tags</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} className="flex pl-4 pr-1 rounded-md gap-1 text-sm" variant="outline">
            {tag}
            <IconButton
              icon={<X />}
              tooltip="Remove tag"
              iconSize="small"
              onClick={() => onTagChange(tags.filter((t) => t !== tag))}
            />
          </Badge>
        ))}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open}>
              <Tag />
              Add tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
            <Command>
              <CommandInput placeholder="Find tag" />
              <CommandList>
                <CommandEmpty>No tag found.</CommandEmpty>
                {tagList.length > 0 && (
                  <CommandGroup>
                    {tagList.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.displayName}
                        onSelect={(currentValue) => {
                          setOpen(false)
                          setValue(currentValue === value ? '' : currentValue)
                          onTagChange([...tags, currentValue])
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
