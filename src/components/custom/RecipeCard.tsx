import { useTranslations } from 'next-intl'
import { useState, useCallback } from 'react'
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
  Copy,
  CloudOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconButton, myToast, ShareDialog, Highlight } from '@/components/custom'
import type { Recipe, Tag } from '@/lib/types'
import { useRecipeMutations, useConfirmDialog, useLongPress } from '@/hooks'
import { getRecipeViewUrl, getRecipeEditUrl } from '@/lib/data-config'

type RecipeCardProps = {
  tags: Tag[]
  isSelected?: boolean
  selectionMode?: boolean
  onSelect?: (isSelected: boolean) => void
  archivedMode?: boolean
  recipeData: Recipe
  recipeUrl?: string
  highlight?: string
}

export function RecipeCard({
  tags,
  isSelected = false,
  selectionMode = false,
  onSelect,
  archivedMode = false,
  recipeData,
  recipeUrl = '',
  highlight,
}: RecipeCardProps) {
  const t = useTranslations('RecipeCard')
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

  const { title, metadata, id } = recipeData
  const isLocalRecipe = id.startsWith('local_')

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
      {...longPressBind}
      role="article"
      aria-label={`Recipe: ${title}`}
    >
      <CardHeader className="relative p-3 sm:p-6">
        <CardTitle>
          <div className="flex items-center gap-2">
            <h3 className="flex-1 flex items-center gap-3">
              <Link
                href={getRecipeViewUrl(id)}
                className="hover:underline break-words hyphens-auto leading-7"
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
                <Highlight text={title} term={highlight} />
              </Link>
              {isLocalRecipe && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CloudOff size={20} className="text-muted-foreground flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('localStorageRecipe')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h3>
          </div>
        </CardTitle>
        <CardDescription className="flex gap-3 items-center select-none sm:select-text">
          <div className="flex gap-1 items-center">
            <Users size="1rem" /> {metadata?.yield || t('yield')}
          </div>
          <div className="flex gap-1 items-center">
            <Timer size="1rem" /> {metadata?.totalTime || t('totalTime')}
          </div>
        </CardDescription>
        <div
          className={`text-muted-foreground absolute top-0 right-0 ${(isHovered || selectionMode) && !isDropdownOpen ? 'opacity-100' : 'sm:opacity-0 sm:invisible'} transition-all duration-100 ease-in-out`}
        >
          {onSelect && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 mr-1.5 ${isSelected ? 'text-primary hover:text-primary' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(!isSelected)
              }}
            >
              {isSelected ? <CircleCheckBig /> : <Circle />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardFooter className="flex flex-col gap-4 items-start pb-3 mt-auto p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              className={archivedMode ? '' : 'cursor-pointer'}
              variant={archivedMode ? 'outline' : 'default'}
            >
              {archivedMode ? (
                tag.displayName
              ) : (
                <Link href={`/?tag=${tag.id}`}>{tag.displayName}</Link>
              )}
            </Badge>
          ))}
        </div>
        <div
          className={`flex gap-4 ${isHovered || isDropdownOpen ? 'opacity-100' : 'sm:opacity-0 sm:invisible'} ${selectionMode ? 'invisible' : ''} transition-all duration-100 ease-in-out`}
        >
          {archivedMode ? (
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
          ) : (
            <>
              <IconButton
                icon={<Pencil />}
                tooltip={t('edit')}
                iconSize="small"
                href={getRecipeEditUrl(id)}
              />
              {!isLocalRecipe && (
                <ShareDialog
                  recipeId={title.replaceAll(' ', '-').toLowerCase()}
                  trigger={<IconButton icon={<Share2 />} tooltip={t('share')} iconSize="small" />}
                  recipeUrl={recipeUrl}
                />
              )}
              <IconButton
                icon={<Archive />}
                tooltip={t('archive')}
                iconSize="small"
                onClick={() => handleArchiveRecipe()}
              />
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
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
