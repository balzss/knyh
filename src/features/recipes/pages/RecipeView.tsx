import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocale, useTranslations } from 'use-intl'
import {
  Users,
  Timer,
  X,
  Pen,
  EllipsisVertical,
  Share2,
  Trash2,
  Archive,
  Calculator,
  Hammer,
  CircleCheck,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TopBar } from '@/components/layout/TopBar'
import { AppSidebar } from '@/app/layout/AppSidebar'
import { PageLayout } from '@/components/layout/PageLayout'
import { IconButton } from '@/components/inputs/IconButton'
import { ShareDialog } from '@/features/recipes/components/ShareDialog'
import { ScaleDialog } from '@/features/recipes/components/ScaleDialog'
import { myToast } from '@/components/feedback/toast'
import { Loader } from '@/components/layout/Loader'
import { RelativeTime } from '@/components/feedback/RelativeTime'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
import { useRecipes } from '@/features/recipes/hooks/use-recipes'
import { useRecipeMutations } from '@/features/recipes/hooks/use-recipe-mutations'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { useFormatTotalTime } from '@/features/recipes/hooks/use-format-total-time'
import { useEditMode } from '@/app/providers/EditModeProvider'
import { getRecipeEditUrl } from '@/lib/urls'
import { formatAmount, scaleLine } from '@/features/recipes/lib/scale-quantity'

type RecipeViewProps = {
  recipeId: string
}

/** Text with its scaled leading amount highlighted, so it's clear it isn't the original */
function ScaledText({
  text,
  factor,
  separator,
}: {
  text: string
  factor: number
  separator: ',' | '.'
}) {
  const { amount, rest } = scaleLine(text, factor, separator)
  return (
    <>
      {amount && <span className="text-primary">{amount}</span>}
      {rest}
    </>
  )
}

/** Text with its web addresses turned into links */
function LinkifiedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(https?:\/\/\S+)/).map((part, index) => {
        if (index % 2 === 0) return part
        // Punctuation at the end of a sentence isn't part of the address
        const [, url, trailing] = /^(.*?)([.,;:!?)]*)$/.exec(part) ?? [part, part, '']
        return (
          <span key={index}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline break-all"
            >
              {url}
            </a>
            {trailing}
          </span>
        )
      })}
    </>
  )
}

export default function RecipeView({ recipeId }: RecipeViewProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [selectedInstruction, setSelectedInstruction] = useState<number>(-1)
  const [factor, setFactor] = useState(1)
  const [scaleOpen, setScaleOpen] = useState(false)
  const [titleEl, setTitleEl] = useState<HTMLHeadingElement | null>(null)
  const [titleOffscreen, setTitleOffscreen] = useState(false)

  const navigate = useNavigate()
  const t = useTranslations('RecipeView')
  const separator = useLocale() === 'hu' ? ',' : '.'
  const { confirmDelete } = useConfirmDialog()
  const formatTotalTime = useFormatTotalTime()

  const { recipes, loading } = useRecipes({ ids: [recipeId], sort: 'random' })
  const recipe = recipes?.[0]

  const { editor } = useEditMode()
  const { deleteRecipe, updateRecipe } = useRecipeMutations()

  // Show the top bar title only once the main title has scrolled under the top bar (h-14 = 56px)
  useEffect(() => {
    if (!titleEl) return
    const observer = new IntersectionObserver(
      ([entry]) => setTitleOffscreen(!entry.isIntersecting),
      { rootMargin: '-56px 0px 0px 0px' }
    )
    observer.observe(titleEl)
    return () => observer.disconnect()
  }, [titleEl])

  const handleClosePage = () => {
    navigate('/', { replace: true })
  }

  const handleIngredientCheckChange = (checked: boolean, index: number) => {
    setCheckedIngredients((prev) => {
      const newChecked = new Set(prev)
      if (checked) {
        newChecked.add(index)
      } else {
        newChecked.delete(index)
      }
      return newChecked
    })
  }

  const handleDeleteRecipe = async () => {
    const confirmed = await confirmDelete({ name: recipe?.title })
    if (!confirmed) return

    deleteRecipe.mutate(recipeId, {
      onSuccess: () => {
        navigate('/')
        myToast({
          message: t('recipeDeleted'),
        })
      },
    })
  }

  const handleArchiveRecipe = () => {
    if (recipe) {
      const { id, ...data } = recipe
      updateRecipe.mutate(
        { id, data: { ...data, archived: true } },
        {
          onSuccess: () => {
            navigate('/')
            myToast({
              message: t('recipeArchived'),
            })
          },
        }
      )
    }
  }

  const handleToggleStatus = () => {
    if (!recipe) return
    const { id, ...data } = recipe
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
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex w-full">
        <TopBar hideSidebarToggleMobile />
        <AppSidebar />
        <main className="w-full mt-16 mx-auto">
          <PageLayout>
            <Loader />
          </PageLayout>
        </main>
      </div>
    )
  }

  // Show not found message if recipe doesn't exist
  if (!recipe) {
    return (
      <div className="flex w-full">
        <TopBar
          hideSidebarToggleMobile
          customTopbarContent={
            <div className="flex items-center gap-2">
              <IconButton
                icon={<X />}
                tooltip={t('closeRecipe')}
                onClick={handleClosePage}
                className="mr-auto sm:mr-4 "
              />
            </div>
          }
        />
        <AppSidebar />
        <main className="w-full mt-16 mx-auto">
          <PageLayout>
            <div className="flex flex-col items-center justify-center py-12">
              <h1 className="font-bold text-2xl mb-4">{t('recipeNotFound')}</h1>
              <p className="text-muted-foreground mb-6">{t('recipeNotFoundDesc')}</p>
              <Link
                to="/"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {t('backToHome')}
              </Link>
            </div>
          </PageLayout>
        </main>
      </div>
    )
  }

  return (
    <div className="flex w-full">
      <TopBar
        hideSidebarToggleMobile
        customTopbarContent={
          <div className="flex items-center gap-2">
            <IconButton
              icon={<X />}
              tooltip={t('closeRecipe')}
              onClick={handleClosePage}
              className="mr-2"
            />
            <span
              className={`mr-auto font-bold truncate transition-opacity duration-150 ${titleOffscreen ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={!titleOffscreen}
            >
              {recipe.title}
            </span>
            <div className="flex gap-2 items-center">
              {editor && (
                <IconButton
                  icon={<Pen />}
                  tooltip={t('editRecipe')}
                  href={getRecipeEditUrl(recipeId)}
                />
              )}
              <ShareDialog
                title={recipe.title}
                trigger={<IconButton icon={<Share2 />} tooltip={t('shareRecipe')} />}
                recipeUrl={window.location.href}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton icon={<EllipsisVertical />} tooltip={t('moreOptions')} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setScaleOpen(true)}>
                    <Calculator className="mr-2 h-4 w-4" />
                    {t('adjustAmounts')}
                  </DropdownMenuItem>
                  {editor && (
                    <>
                      <DropdownMenuItem onClick={handleToggleStatus}>
                        {recipe.status === 'development' ? (
                          <CircleCheck className="mr-2 h-4 w-4" />
                        ) : (
                          <Hammer className="mr-2 h-4 w-4" />
                        )}
                        {recipe.status === 'development' ? t('markReady') : t('markDevelopment')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleArchiveRecipe}>
                        <Archive className="mr-2 h-4 w-4" />
                        {t('archiveRecipe')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDeleteRecipe}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('deleteRecipe')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        }
      />
      <AppSidebar />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <div className="flex flex-col gap-1">
            <h1 ref={setTitleEl} className="font-bold text-3xl md:text-4xl">
              {recipe?.title}
            </h1>
            <RecipeStatusBadge status={recipe.status} className="self-start my-1" />
            <div className="text-muted-foreground flex gap-4">
              {recipe?.yield && (
                <div className="flex gap-1 items-center">
                  <Users size="1rem" />{' '}
                  <span>
                    <ScaledText text={recipe.yield} factor={factor} separator={separator} />
                  </span>
                </div>
              )}
              {formatTotalTime(recipe?.totalTime) && (
                <div className="flex gap-1 items-center">
                  <Timer size="1rem" /> {formatTotalTime(recipe?.totalTime)}
                </div>
              )}
            </div>
            <div className="flex gap-3 flex-wrap mt-3">
              {recipe?.tags.map(({ id, displayName }) => (
                <Badge key={id} className="cursor-pointer">
                  <Link to={`/?tag=${id}`}>{displayName}</Link>
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between mt-4">
              <h2 className="text-xl text-muted-foreground">{t('ingredients')}</h2>
              <div className="flex items-center gap-1">
                {factor !== 1 && (
                  <button
                    type="button"
                    onClick={() => setFactor(1)}
                    aria-label={t('resetAmounts')}
                    title={t('resetAmounts')}
                    className="text-primary text-sm font-medium px-1"
                  >
                    ×{formatAmount(factor, separator)}
                  </button>
                )}
              </div>
            </div>
            <ScaleDialog
              open={scaleOpen}
              onOpenChange={setScaleOpen}
              factor={factor}
              onApply={setFactor}
            />
            {recipe?.ingredients?.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                {group.label && <h3 className="font-medium text-lg mb-2">{group.label}</h3>}
                <ul>
                  {group.items.map((ingredient, itemIndex) => {
                    const globalIndex = groupIndex * 1000 + itemIndex // Simple way to create unique indices
                    return (
                      <li
                        key={globalIndex}
                        className="flex items-center space-x-2 text-md leading-8"
                      >
                        <Checkbox
                          id={`ingredient-${globalIndex}`}
                          checked={checkedIngredients.has(globalIndex)}
                          onCheckedChange={(checked) =>
                            handleIngredientCheckChange(checked as boolean, globalIndex)
                          }
                          className={
                            checkedIngredients.has(globalIndex)
                              ? 'data-[state=checked]:bg-muted-foreground data-[state=checked]:text-black border-muted-foreground'
                              : ''
                          }
                        />
                        <label
                          htmlFor={`ingredient-${globalIndex}`}
                          className={`${checkedIngredients.has(globalIndex) ? 'text-muted-foreground line-through' : ''}`}
                        >
                          <ScaledText text={ingredient} factor={factor} separator={separator} />
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl text-muted-foreground mt-4">{t('instructions')}</h2>
            <ol className={` flex flex-col gap-3 ml-4 list-[x]`}>
              {recipe?.instructions?.map((instruction, index) => (
                <li
                  key={index}
                  className={`${selectedInstruction === index ? `relative list-none before:content-['★'] before:absolute before:-left-5 text-primary` : selectedInstruction > -1 ? 'text-muted-foreground' : ''} flex items-center text-md leading-6 list-item transition duration-150 ${selectedInstruction > index ? 'line-through' : ''}`}
                  onClick={() => setSelectedInstruction((prev) => (prev === index ? -1 : index))}
                >
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
          {editor && recipe.notes.length > 0 && (
            <div className="flex flex-col gap-1">
              <h2 className="text-xl text-muted-foreground mt-4">{t('notes')}</h2>
              <ul className="flex flex-col gap-2 ml-4 list-disc text-md leading-6">
                {recipe.notes.map((note, index) => (
                  <li key={index}>
                    <LinkifiedText text={note} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {editor && (
            <div className="mt-8 text-xs italic text-muted-foreground">
              {recipe?.updatedAt && (
                <p>
                  {t('modified')}: <RelativeTime date={recipe.updatedAt} />
                </p>
              )}
              {recipe?.createdAt && (
                <p className="mt-1">
                  {t('created')}: <RelativeTime date={recipe.createdAt} />
                </p>
              )}
            </div>
          )}
        </PageLayout>
      </main>
    </div>
  )
}
