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
  Users,
  Timer,
  ArchiveRestore,
  Trash2,
  Copy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconButton, myToast, ShareDialog, Highlight } from '@/components/custom'
import type { Recipe, Tag } from '@/lib/types'
import { useRecipeMutations, useConfirmDialog, useLongPress, useFormatTotalTime } from '@/hooks'
import { getRecipeViewUrl, getRecipeEditUrl } from '@/lib/urls'
import { useEditMode } from '@/providers/EditModeProvider'

type RecipeCardProps = {
  tags: Tag[]
  isSelected?: boolean
  selectionMode?: boolean
  onSelect?: (isSelected: boolean) => void
  archivedMode?: boolean
  recipeData: Recipe
  highlight?: string
}

/*
 * Card spacing, on a 4 px grid. The gap grows with the level of grouping:
 *   4 px (1)   inside one line: icon and its label, the title and its meta line
 *   8 px (2)   between siblings: tags, action buttons, meta items
 *  12 px (3)   between groups in the card, and between cards (see PageLayout)
 *  16 px (4)   the card's inset (12 px on phones)
 * Padding lives on the Card only. The header and footer have none of their own.
 */
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
  const { updateRecipe, deleteRecipe, createRecipe } = useRecipeMutations()
  const { confirmDelete } = useConfirmDialog()
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const { bind: longPressBind, wasLongPress } = useLongPress(() => {
    onSelect?.(!isSelected)
  })

  const handleDeleteRecipe = useCallback(async () => {
    const confirmed = await confirmDelete({ name: recipeData.title })
    if (confirmed) deleteRecipe.mutate(recipeData.id)
  }, [confirmDelete, recipeData.title, recipeData.id, deleteRecipe])

  const handleDuplicateRecipe = useCallback(async () => {
    const { id: _id, ...recipeDataWithoutId } = recipeData
    const duplicatedRecipe = {
      ...recipeDataWithoutId,
      title: `${recipeData.title} (Copy)`,
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

  const { title, yield: recipeYield, totalTime, id } = recipeData
  const recipeUrl = `${window.location.origin}${getRecipeViewUrl(id)}`

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
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-md relative flex flex-col gap-3 p-3 sm:p-4 ${isSelected ? 'border-primary' : ''}`}
      tabIndex={0}
      {...longPressBind}
      role="article"
      aria-label={`Recipe: ${title}`}
    >
      <CardHeader className="p-0">
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
          onContextMenu={(e) => {
            if (selectionMode) {
              e.preventDefault()
            }
          }}
        >
          <CardTitle className={cn('leading-snug', onSelect && 'pr-8')}>
            <h3>
              <Highlight text={title} term={highlight} />
            </h3>
          </CardTitle>
          <CardDescription className="flex items-center gap-2 select-none sm:select-text">
            {recipeYield && (
              <div className="flex gap-1 items-center">
                <Users size="1rem" /> {recipeYield}
              </div>
            )}
            {formatTotalTime(totalTime) && (
              <div className="flex gap-1 items-center">
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
        </Link>
      </CardHeader>
      <CardFooter className="mt-auto flex-wrap items-end justify-between gap-x-3 gap-y-2 p-0">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              className={archivedMode ? '' : 'cursor-pointer'}
              variant={archivedMode ? 'outline' : 'default'}
            >
              {archivedMode ? (
                tag.displayName
              ) : (
                <Link to={`/?tag=${tag.id}`}>{tag.displayName}</Link>
              )}
            </Badge>
          ))}
        </div>
        <div
          className={`ml-auto flex gap-1 [&_button]:h-7 [&_button]:w-7 ${isHovered || isDropdownOpen ? 'opacity-100' : 'sm:opacity-0 sm:invisible'} ${selectionMode ? 'invisible' : ''} transition-all duration-100 ease-in-out`}
        >
          {archivedMode ? (
            editor && (
              <>
                <IconButton
                  icon={<ArchiveRestore />}
                  tooltip={t('restore')}
                  iconSize="small"
                  onClick={() => handleArchiveRecipe(false)}
                />
                <IconButton
                  icon={<Trash2 />}
                  tooltip={t('delete')}
                  iconSize="small"
                  onClick={handleDeleteRecipe}
                />
              </>
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
                recipeId={title.replaceAll(' ', '-').toLowerCase()}
                trigger={<IconButton icon={<Share2 />} tooltip={t('share')} iconSize="small" />}
                recipeUrl={recipeUrl}
              />
              {editor && (
                <IconButton
                  icon={<Archive />}
                  tooltip={t('archive')}
                  iconSize="small"
                  onClick={() => handleArchiveRecipe()}
                />
              )}
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
                    <DropdownMenuItem onClick={handleDeleteRecipe}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('delete')}
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
