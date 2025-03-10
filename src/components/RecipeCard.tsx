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

type Tag = {
  id: string
  displayName: string
}

type RecipeCardProps = {
  title: string
  tags: Tag[]
  isSelected: boolean
  onSelect: (isSelected: boolean) => void
}

export function RecipeCard({
  title,
  tags,
  isSelected = true,
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
        {(isSelected || isHovered )&& (
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
              <Badge key={tag.id}>{tag.displayName}</Badge>
          ))}
        </div>
        <div className={`flex gap-4 ${isHovered ? '' : 'invisible'}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil/>
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2/>
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Archive/>
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <EllipsisVertical/>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
