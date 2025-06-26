import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Archive,
  Share2,
  EllipsisVertical,
  Pencil,
  Circle,
  CircleCheckBig,
  Users,
  Timer,
  ArchiveRestore,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { IconButton, myToast, ShareDialog } from '@/components/custom'
import type { Recipe, Tag } from '@/lib/data'

type RecipeCardProps = {
  tags: Tag[]
  isSelected?: boolean
  selectionMode?: boolean
  onSelect?: (isSelected: boolean) => void
  archivedMode?: boolean
  recipeData: Recipe
  recipeUrl?: string
  compact?: boolean
}

export function RecipeCard({
  tags,
  isSelected = false,
  selectionMode = false,
  onSelect = () => {},
  archivedMode = false,
  recipeData,
  recipeUrl = '',
  compact = true,
}: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const selectTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = () => {
    selectTimeout.current = setTimeout(() => {
      onSelect(!isSelected)
    }, 500)
  }

  const clearSelectTimeout = () => {
    if (selectTimeout.current) {
      clearTimeout(selectTimeout.current)
      selectTimeout.current = null
    }
  }

  const { title, metadata, id } = recipeData

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Set isHovered to true when the card gains focus, and only set it to false when focus moves completely outside the card
      onFocus={() => setIsHovered(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsHovered(false)
        }
      }}
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-md flex flex-col ${isSelected ? 'border-primary' : ''}`}
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearSelectTimeout}
      onTouchCancel={clearSelectTimeout}
    >
      <CardHeader className={`relative ${compact ? 'p-3 sm:p-6' : ''}`}>
        <CardTitle>
          <h3>
            <Link
              href={`/recipes/${id}`}
              className="hover:underline break-words hyphens-auto leading-7"
              lang="hu"
            >
              {title}
            </Link>
          </h3>
        </CardTitle>
        <CardDescription className="flex gap-3 items-center select-none sm:select-text">
          <div className="flex gap-1 items-center">
            <Users size="1rem" /> {metadata?.yield || '1 adag'}
          </div>
          <div className="flex gap-1 items-center">
            <Timer size="1rem" /> {metadata?.totalTime || '00:30'}
          </div>
        </CardDescription>
        <div
          className={`text-muted-foreground absolute top-0 right-0 ${isHovered || selectionMode ? 'opacity-100' : 'sm:opacity-0 sm:invisible'} transition-all duration-100 ease-in-out`}
        >
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 mr-1.5 ${isSelected ? 'text-primary hover:text-primary' : ''}`}
            onClick={() => onSelect(!isSelected)}
          >
            {isSelected ? <CircleCheckBig /> : <Circle />}
          </Button>
        </div>
      </CardHeader>
      <CardFooter
        className={`flex flex-col gap-4 items-start pb-3 mt-auto ${compact ? 'p-3 sm:p-6' : ''} pt-0 sm:pt-0`}
      >
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              tabIndex={archivedMode ? undefined : 0}
              onClick={archivedMode ? undefined : () => console.log(tag.displayName)}
              className={archivedMode ? '' : 'cursor-pointer'}
              variant={archivedMode ? 'outline' : 'default'}
            >
              {tag.displayName}
            </Badge>
          ))}
        </div>
        <div
          className={`flex gap-4 ${isHovered ? 'opacity-100' : 'sm:opacity-0 sm:invisible'} ${selectionMode ? 'invisible' : ''} transition-all duration-100 ease-in-out`}
        >
          {archivedMode ? (
            <>
              <IconButton icon={<ArchiveRestore />} tooltip="Restore" iconSize="small" />
              <IconButton icon={<Trash2 />} tooltip="Delete" iconSize="small" />
            </>
          ) : (
            <>
              <IconButton icon={<Pencil />} tooltip="Edit Recipe" iconSize="small" />
              <ShareDialog
                recipeId={title.replace(' ', '-').toLowerCase()}
                trigger={<IconButton icon={<Share2 />} tooltip="Share" iconSize="small" />}
                recipeUrl={recipeUrl}
              />
              <IconButton
                icon={<Archive />}
                tooltip="Archive"
                iconSize="small"
                onClick={() =>
                  myToast({
                    message: 'Recipe archived',
                    action: { label: 'Undo', onClick: () => {} },
                  })
                }
              />
              <IconButton icon={<EllipsisVertical />} tooltip="More Options" iconSize="small" />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
