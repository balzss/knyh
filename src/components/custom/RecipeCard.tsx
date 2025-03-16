import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { IconButton } from '@/components/custom'

type Tag = {
  id: string
  displayName: string
}

type RecipeCardProps = {
  title: string
  tags: Tag[]
  isSelected: boolean
  selectionMode?: boolean
  onSelect: (isSelected: boolean) => void
  archivedMode?: boolean
}

export function RecipeCard({
  title,
  tags,
  isSelected = true,
  selectionMode = false,
  onSelect,
  archivedMode = false,
}: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)

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
      className={`focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:rounded-md flex flex-col ${isSelected ? 'border-primary' : ''}`}
      tabIndex={0}
    >
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="flex gap-3 items-center">
          <div className="flex gap-1 items-center">
            <Users size="1rem" /> 4 adag
          </div>
          <div className="flex gap-1 items-center">
            <Timer size="1rem" /> 30 perc
          </div>
        </CardDescription>
        <AnimatePresence>
          {(isSelected || isHovered || selectionMode) && (
            <motion.div
              className="absolute top-0 right-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, translateX: 2 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 mr-1.5 ${isSelected ? 'text-primary hover:text-primary' : ''}`}
                onClick={() => onSelect(!isSelected)}
              >
                {isSelected ? <CircleCheckBig /> : <Circle />}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="flex-grow">card content</CardContent>
      <CardFooter className="flex flex-col gap-4 items-start pb-3 mt-auto">
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              tabIndex={archivedMode ? undefined : 0}
              onClick={
                archivedMode ? undefined : () => console.log(tag.displayName)
              }
              className={archivedMode ? '' : 'cursor-pointer'}
              variant={archivedMode ? 'outline' : 'default'}
            >
              {tag.displayName}
            </Badge>
          ))}
        </div>
        <div
          className={`flex gap-4 ${isHovered && !selectionMode ? 'opacity-100' : 'opacity-0 invisible'}`}
          style={{ transition: 'visibility 0.1s linear, opacity 0.1s linear' }}
        >
          {archivedMode ? (
            <>
              <IconButton
                icon={<ArchiveRestore />}
                tooltip="Restore"
                size="small"
              />
              <IconButton icon={<Trash2 />} tooltip="Delete" size="small" />
            </>
          ) : (
            <>
              <IconButton
                icon={<Pencil />}
                tooltip="Edit Recipe"
                size="small"
              />
              <IconButton icon={<Share2 />} tooltip="Share" size="small" />
              <IconButton icon={<Archive />} tooltip="Archive" size="small" />
              <IconButton
                icon={<EllipsisVertical />}
                tooltip="More Options"
                size="small"
              />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
