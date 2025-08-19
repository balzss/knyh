'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Users, Timer, X, Pen, EllipsisVertical, Share2, Trash2, Archive } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AppSidebar,
  PageLayout,
  IconButton,
  ShareDialog,
  myToast,
  Loader,
} from '@/components/custom'
import { useRecipes, useTags, useRecipeMutations, useConfirmDialog } from '@/hooks'
import { getRecipeEditUrl } from '@/lib/data-config'

type RecipeViewProps = {
  recipeId: string
}

export default function RecipeView({ recipeId }: RecipeViewProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [selectedInstruction, setSelectedInstruction] = useState<number>(-1)

  const router = useRouter()
  const t = useTranslations('RecipeView')
  const { confirmDelete } = useConfirmDialog()
  const { toggleSidebar } = useSidebar()

  const { recipes, loading } = useRecipes({ ids: [recipeId], sort: 'random' })
  const { tags, loading: tagsLoading } = useTags()
  const recipe = recipes?.[0]

  const { deleteRecipe, updateRecipe } = useRecipeMutations()

  const handleClosePage = () => {
    if (window.history.length && document.referrer === '') {
      router.back()
    } else {
      router.replace('/')
    }
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
        router.push('/')
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
            router.push('/')
            myToast({
              message: t('recipeArchived'),
            })
          },
        }
      )
    }
  }

  // Show loading state
  if (loading || tagsLoading) {
    return (
      <div className="flex w-full">
        <TopBar onSidebarToggle={toggleSidebar} hideSidebarToggleMobile />
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
          onSidebarToggle={toggleSidebar}
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
                href="/"
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
        onSidebarToggle={toggleSidebar}
        hideSidebarToggleMobile
        customTopbarContent={
          <div className="flex items-center gap-2">
            <IconButton
              icon={<X />}
              tooltip={t('closeRecipe')}
              onClick={handleClosePage}
              className="mr-auto sm:mr-4 "
            />
            <span className="mr-4 font-bold ">{recipe.title}</span>
            <div className="flex gap-2 items-center">
              <IconButton
                icon={<Pen />}
                tooltip={t('editRecipe')}
                href={getRecipeEditUrl(recipeId)}
              />
              <ShareDialog
                recipeId={recipeId}
                trigger={<IconButton icon={<Share2 />} tooltip={t('shareRecipe')} />}
                recipeUrl={'https://placeholder.url'}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton icon={<EllipsisVertical />} tooltip={t('moreOptions')} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleArchiveRecipe}>
                    <Archive className="mr-2 h-4 w-4" />
                    {t('archiveRecipe')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteRecipe}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('deleteRecipe')}
                  </DropdownMenuItem>
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
            <h1 className="font-bold text-3xl md:text-4xl">{recipe?.title}</h1>
            <div className="text-muted-foreground flex gap-4">
              <div className="flex gap-1 items-center">
                <Users size="1rem" /> {recipe?.metadata?.yield}
              </div>
              <div className="flex gap-1 items-center">
                <Timer size="1rem" /> {recipe?.metadata?.totalTime}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap mt-3">
              {tags &&
                recipe?.tags.map((tagId) => (
                  <Badge key={tagId} onClick={() => console.log(tagId)} className="cursor-pointer">
                    <Link href={`/?tag=${tagId}`}>
                      {tags.find((t) => t.id === tagId)?.displayName}
                    </Link>
                  </Badge>
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl text-muted-foreground mt-4">{t('ingredients')}</h2>
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
                          {ingredient}
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
          <div className="mt-8 text-xs italic text-muted-foreground">
            {recipe?.lastModified && (
              <p>
                {t('lastModified')}: {recipe.lastModified}
              </p>
            )}
            {recipe?.createdAt && (
              <p className="mt-1">
                {t('created')}: {recipe.createdAt}
              </p>
            )}
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
