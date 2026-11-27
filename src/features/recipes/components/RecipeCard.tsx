import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Circle, CircleCheckBig, Timer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { IconButton } from '@/components/inputs/IconButton'
import { RecipeCardActions } from './RecipeCardActions'
import { Highlight } from './Highlight'
import { RecipeStatusBadge } from './RecipeStatusBadge'
import type { Recipe, Tag } from '@shared/types'
import type { ContentMatch } from '@/features/recipes/lib/search'
import { useLongPress } from '@/hooks/use-long-press'
import { useFormatTotalTime } from '@/features/recipes/hooks/use-format-total-time'
import { getRecipeViewUrl } from '@/lib/urls'

type RecipeCardProps = {
  tags: Tag[]
  isSelected?: boolean
  selectionMode?: boolean
  onSelect?: (isSelected: boolean) => void
  archivedMode?: boolean
  recipeData: Recipe
  highlight?: string
  /** The ingredient, step or note that made this recipe match the search */
  contentMatch?: ContentMatch
}

export function RecipeCard({
  tags,
  isSelected = false,
  selectionMode = false,
  onSelect,
  archivedMode = false,
  recipeData,
  highlight,
  contentMatch,
}: RecipeCardProps) {
  const t = useTranslations('RecipeCard')
  const formatTotalTime = useFormatTotalTime()
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const { bind: longPressBind, wasLongPress } = useLongPress(
    () => {
      onSelect?.(!isSelected)
    },
    { enabled: !selectionMode }
  )

  const { title, totalTime, id, status } = recipeData
  const inDevelopment = status === 'development'

  const headerContent = (
    <>
      <CardTitle className={cn('leading-snug', onSelect && 'pr-8')}>
        <h3>
          <span className={cn(inDevelopment && 'opacity-75')}>
            <Highlight text={title} term={highlight} />
          </span>
        </h3>
      </CardTitle>
      <CardDescription
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-1 select-none sm:select-text',
          inDevelopment && 'opacity-75'
        )}
      >
        <RecipeStatusBadge status={status} variant="label" />
        {formatTotalTime(totalTime) && (
          <div className="flex gap-1 items-center whitespace-nowrap">
            <Timer size="1rem" /> {formatTotalTime(totalTime)}
          </div>
        )}
      </CardDescription>
      {contentMatch && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          <span className="font-medium">{t(`match_${contentMatch.kind}`)}: </span>
          <Highlight text={contentMatch.text} term={highlight} />
        </p>
      )}
      <div
        className={cn(
          'flex absolute top-2 right-2 transition-all duration-100 ease-in-out',
          // On phones the check button only shows in selection mode, since a long tap enters it
          selectionMode && !isDropdownOpen
            ? 'opacity-100'
            : isHovered && !isDropdownOpen
              ? 'max-sm:opacity-0 max-sm:invisible'
              : 'opacity-0 invisible'
        )}
      >
        {onSelect && (
          <IconButton
            icon={isSelected ? <CircleCheckBig /> : <Circle />}
            tooltip={isSelected ? 'Unselect text placeholder' : 'Select text placeholder'}
            className={cn('h-8 w-8', isSelected && 'text-primary hover:text-primary')}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onSelect(!isSelected)
            }}
          />
        )}
      </div>
    </>
  )

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
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-md relative flex flex-col gap-3 p-3 sm:p-4 ${inDevelopment ? 'border-transparent' : isSelected ? 'border-primary' : ''} ${selectionMode ? 'cursor-pointer select-none' : ''}`}
      tabIndex={0}
      onClick={selectionMode ? () => onSelect?.(!isSelected) : undefined}
      {...longPressBind}
      role="article"
      aria-label={`Recipe: ${title}`}
    >
      {inDevelopment && (
        // CSS dashed borders can't set the gap, so the border is drawn as an SVG stroke
        <svg
          aria-hidden
          className="pointer-events-none absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)]"
        >
          <rect
            x="0.5"
            y="0.5"
            rx="8"
            strokeDasharray="6 5"
            className={`fill-none ${isSelected ? 'stroke-primary' : 'stroke-border'}`}
            style={{ width: 'calc(100% - 1px)', height: 'calc(100% - 1px)' }}
          />
        </svg>
      )}
      <CardHeader className="p-0">
        {selectionMode ? (
          <div className="flex flex-col gap-1">{headerContent}</div>
        ) : (
          <Link
            to={getRecipeViewUrl(id)}
            className="flex flex-col gap-1"
            onClick={(e) => {
              if (wasLongPress()) {
                e.preventDefault()
                e.stopPropagation()
                return
              }
            }}
          >
            {headerContent}
          </Link>
        )}
      </CardHeader>
      <CardFooter className="mt-auto flex-col items-stretch gap-3 p-0 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Tags and actions share a row from sm up and stack on phones. Each tag line is as tall
            as an action button (28 px, so 3 px above and below the 22 px tag), which keeps their
            centres on one line even when the tags wrap. */}
        {tags.length > 0 && (
          <div className={cn('flex flex-wrap gap-x-2 gap-y-0.5', inDevelopment && 'opacity-75')}>
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                className={cn('my-[3px]', !archivedMode && !selectionMode && 'cursor-pointer')}
                variant={archivedMode ? 'outline' : 'default'}
              >
                {archivedMode || selectionMode ? (
                  tag.displayName
                ) : (
                  <Link to={`/?tag=${tag.id}`}>{tag.displayName}</Link>
                )}
              </Badge>
            ))}
          </div>
        )}
        <div
          className={`ml-auto flex gap-2 [&_a]:h-7 [&_a]:w-7 [&_button]:h-7 [&_button]:w-7 ${isHovered || isDropdownOpen ? 'opacity-100' : 'sm:opacity-0 sm:invisible'} ${selectionMode ? 'invisible' : ''} transition-all duration-100 ease-in-out`}
        >
          <RecipeCardActions
            recipeData={recipeData}
            archivedMode={archivedMode}
            onMenuOpenChange={setIsDropdownOpen}
            onSelect={onSelect && (() => onSelect(true))}
          />
        </div>
      </CardFooter>
    </Card>
  )
}
