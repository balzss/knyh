import { useTranslations } from 'use-intl'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import {
  Archive,
  Share2,
  EllipsisVertical,
  Pencil,
  Circle,
  CircleCheckBig,
  Timer,
  ArchiveRestore,
  Copy,
  Hammer,
  CircleCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconButton } from '@/components/inputs/IconButton'
import { myToast } from '@/components/feedback/toast'
import { ShareDialog } from './ShareDialog'
import { Highlight } from './Highlight'
import { RecipeStatusBadge } from './RecipeStatusBadge'
import type { Recipe, Tag } from '@shared/types'
import { useRecipeMutations } from '@/hooks/use-recipe-mutations'
import { useLongPress } from '@/hooks/use-long-press'
import { useFormatTotalTime } from '@/hooks/use-format-total-time'
import { getRecipeViewUrl, getRecipeEditUrl } from '@/lib/urls'
import { useEditMode } from '@/app/providers/EditModeProvider'

type RecipeCardProps = {
  tags: Tag[]
  isSelected?: boolean
  selectionMode?: boolean
  onSelect?: (isSelected: boolean) => void
  archivedMode?: boolean
  recipeData: Recipe
  highlight?: string
}

export function RecipeCard({
  tags,
  isSelected = false,
  selectionMode = false,
  onSelect,
  archivedMode = false,
  recipeData,
  highlight,
}: RecipeCardProps) {
  const t = useTranslations('RecipeCard')
  const { editor } = useEditMode()
  const formatTotalTime = useFormatTotalTime()
  const { updateRecipe, createRecipe } = useRecipeMutations()
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const { bind: longPressBind, wasLongPress } = useLongPress(
    () => {
      onSelect?.(!isSelected)
    },
    { enabled: !selectionMode }
  )

  const handleDuplicateRecipe = useCallback(async () => {
    const { id: _id, ...recipeDataWithoutId } = recipeData
    const duplicatedRecipe = {
      ...recipeDataWithoutId,
      title: `${recipeData.title} (Copy)`,
      // A copy is new work, so it starts out in development
      status: 'development' as const,
    }
    createRecipe.mutate(duplicatedRecipe, {
      onSuccess: () => {
        myToast({
          message: t('recipeDuplicated'),
        })
      },
    })
  }, [createRecipe, recipeData, t])

  const handleArchiveRecipe = useCallback(
    (archived: boolean = true) => {
      const { id, ...data } = recipeData
      updateRecipe.mutate(
        { id, data: { ...data, archived } },
        {
          onSuccess: () => {
            myToast({
              message: archived ? t('recipeArchived') : t('recipeRestored'),
              action: {
                label: t('undo'),
                onClick: () => updateRecipe.mutate({ id, data: { ...data, archived: !archived } }),
              },
            })
          },
        }
      )
    },
    [updateRecipe, recipeData, t]
  )

  const { title, totalTime, id, status } = recipeData
  const inDevelopment = status === 'development'

  const handleToggleStatus = useCallback(() => {
    const { id, ...data } = recipeData
    const previous = data.status
    const next = previous === 'development' ? 'ready' : 'development'
    updateRecipe.mutate(
      { id, data: { ...data, status: next } },
      {
        onSuccess: () => {
          myToast({
            message: t('statusChanged', { status: next }),
            action: {
              label: t('undo'),
              onClick: () => updateRecipe.mutate({ id, data: { ...data, status: previous } }),
            },
          })
        },
      }
    )
  }, [updateRecipe, recipeData, t])
  const recipeUrl = `${window.location.origin}${getRecipeViewUrl(id)}`

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
      <div
        className={cn(
          'flex absolute top-2 right-2 transition-all duration-100 ease-in-out',
          (isHovered || selectionMode) && !isDropdownOpen
            ? 'opacity-100'
            : 'sm:opacity-0 sm:invisible'
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
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-md relative flex flex-col gap-3 p-3 sm:p-4 ${isSelected ? 'border-primary' : ''} ${inDevelopment ? 'border-dashed' : ''} ${selectionMode ? 'cursor-pointer select-none' : ''}`}
      tabIndex={0}
      onClick={selectionMode ? () => onSelect?.(!isSelected) : undefined}
      {...longPressBind}
      role="article"
      aria-label={`Recipe: ${title}`}
    >
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
          {archivedMode ? (
            editor && (
              <IconButton
                icon={<ArchiveRestore />}
                tooltip={t('restore')}
                iconSize="small"
                onClick={() => handleArchiveRecipe(false)}
              />
            )
          ) : (
            <>
              {editor && (
                <IconButton
                  icon={<Pencil />}
                  tooltip={t('edit')}
                  iconSize="small"
                  href={getRecipeEditUrl(id)}
                />
              )}
              <ShareDialog
                title={title}
                trigger={<IconButton icon={<Share2 />} tooltip={t('share')} iconSize="small" />}
                recipeUrl={recipeUrl}
              />
              {editor && (
                <DropdownMenu onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <IconButton
                      icon={<EllipsisVertical />}
                      tooltip={t('moreOptions')}
                      iconSize="small"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDuplicateRecipe}>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('duplicate')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleStatus}>
                      {inDevelopment ? (
                        <CircleCheck className="mr-2 h-4 w-4" />
                      ) : (
                        <Hammer className="mr-2 h-4 w-4" />
                      )}
                      {inDevelopment ? t('markReady') : t('markDevelopment')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchiveRecipe()}>
                      <Archive className="mr-2 h-4 w-4" />
                      {t('archive')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
