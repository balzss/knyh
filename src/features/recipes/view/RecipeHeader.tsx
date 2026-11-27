import { Link } from 'react-router-dom'
import { Users, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
import { useFormatTotalTime } from '@/features/recipes/hooks/use-format-total-time'
import { ScaledText } from './ScaledText'
import type { Recipe } from '@shared/types'

type RecipeHeaderProps = {
  recipe: Recipe
  factor: number
  separator: ',' | '.'
  /** Lets the page watch when the title scrolls out of view */
  titleRef: (element: HTMLHeadingElement | null) => void
}

export function RecipeHeader({ recipe, factor, separator, titleRef }: RecipeHeaderProps) {
  const formatTotalTime = useFormatTotalTime()

  return (
    <div className="flex flex-col gap-1">
      <h1 ref={titleRef} className="font-bold text-3xl md:text-4xl">
        {recipe.title}
      </h1>
      <div className="text-muted-foreground flex gap-4">
        <RecipeStatusBadge status={recipe.status} />
        {recipe.yield && (
          <div className="flex gap-1 items-center">
            <Users size="1rem" />{' '}
            <span>
              <ScaledText text={recipe.yield} factor={factor} separator={separator} />
            </span>
          </div>
        )}
        {formatTotalTime(recipe.totalTime) && (
          <div className="flex gap-1 items-center">
            <Timer size="1rem" /> {formatTotalTime(recipe.totalTime)}
          </div>
        )}
      </div>
      <div className="flex gap-3 flex-wrap mt-3">
        {recipe.tags.map(({ id, displayName }) => (
          <Badge key={id} className="cursor-pointer">
            <Link to={`/?tag=${id}`}>{displayName}</Link>
          </Badge>
        ))}
      </div>
    </div>
  )
}
