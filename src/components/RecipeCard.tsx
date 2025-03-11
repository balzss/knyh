import { useState } from 'react'
import {
  Archive,
  Share2,
  EllipsisVertical,
  Pencil,
  Circle,
  CircleCheckBig,
  Users,
  Timer
} from 'lucide-react'
import {
  Badge
} from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
}

export function RecipeCard({
  title,
  tags,
  isSelected = true,
  selectionMode = false,
  onSelect,
}: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  return (
    <Card onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={`flex flex-col ${isSelected ? 'border-primary' : ''}`}>
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="flex gap-3 items-center">
          <div className="flex gap-1 items-center">
            <Users size="1rem"/> 4 adag
          </div>
          <div className="flex gap-1 items-center">
            <Timer size="1rem"/> 30 perc
          </div>
        </CardDescription>
        {(isSelected || isHovered || selectionMode) && (
          <div className="absolute top-1 right-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isSelected ? 'text-primary hover:text-primary' : ''}`}
              onClick={() =>
              onSelect(!isSelected)}
            >
              {isSelected ? <CircleCheckBig/> : <Circle/>}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        card content
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-start pb-3 mt-auto">
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag.id} onClick={() => console.log(tag.displayName)} className="cursor-pointer">{tag.displayName}</Badge>
          ))}
        </div>
        <div className={`flex gap-4 ${(isHovered && !selectionMode) ? '' : 'invisible'}`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit recipe</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Archive/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Archive</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <EllipsisVertical/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  )
}
