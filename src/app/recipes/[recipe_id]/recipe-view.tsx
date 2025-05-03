'use client'

import { useState } from 'react'
import { Users, Timer, X, Pen, EllipsisVertical, Share2, Presentation } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AppSidebar, PageLayout, IconButton } from '@/components/custom'
import { useRecipes, useTags } from '@/hooks'

type RecipeViewProps = {
  recipeId: string
}

export default function RecipeView({ recipeId }: RecipeViewProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())
  const [selectedInstruction, setSelectedInstruction] = useState<number>(-1)
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const { recipes } = useRecipes({ ids: [recipeId] })
  const { tags } = useTags()
  const recipe = recipes?.[0]

  const handleClosePage = () => {
    router.replace('/')
  }

  const handleIngredientCheckChange = (checked: boolean, index: number) => {
    if (checked) {
      setCheckedIngredients((prev) => new Set(prev).add(index))
    } else {
      setCheckedIngredients((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }
  }

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        hideSidebarToggleMobile
        customTopbarContent={
          <div className="flex items-center gap-2">
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<X />}
              tooltip="Clear selection"
              onClick={handleClosePage}
            />
            <div className="w-full max-w-2xl flex gap-2 items-center justify-end">
              <IconButton
                iconSize="normal"
                variant="ghost"
                icon={<Presentation />}
                tooltip="More options"
                onClick={() => {}}
              />
              <IconButton
                iconSize="normal"
                variant="ghost"
                icon={<Pen />}
                tooltip="More options"
                onClick={() => {}}
              />
              <IconButton
                iconSize="normal"
                variant="ghost"
                icon={<Share2 />}
                tooltip="More options"
                onClick={() => {}}
              />
              <IconButton
                iconSize="normal"
                variant="ghost"
                icon={<EllipsisVertical />}
                tooltip="More options"
                onClick={() => {}}
              />
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
                    {tags.find((t) => t.id === tagId)?.displayName}
                  </Badge>
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl text-muted-foreground mt-4">Ingredients</h2>
            <ul>
              {recipe?.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center space-x-2 text-md leading-8">
                  <Checkbox
                    id={`ingredient-${index}`}
                    checked={checkedIngredients.has(index)}
                    onCheckedChange={(checked) =>
                      handleIngredientCheckChange(checked as boolean, index)
                    }
                    className={
                      checkedIngredients.has(index)
                        ? 'data-[state=checked]:bg-muted-foreground data-[state=checked]:text-black border-muted-foreground'
                        : ''
                    }
                  />
                  <label
                    htmlFor={`ingredient-${index}`}
                    className={`${checkedIngredients.has(index) ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {ingredient.toString()}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl text-muted-foreground mt-4">Instructions</h2>
            <ol className={` flex flex-col gap-3 ml-4 list-[x]`}>
              {recipe?.instructions.map((instruction, index) => (
                <li
                  key={index}
                  className={`${selectedInstruction === index ? `relative list-none before:content-['★'] before:absolute before:-left-5 text-primary` : selectedInstruction > -1 ? 'text-muted-foreground' : ''} flex items-center text-md leading-6 list-item transition duration-150`}
                  onClick={() => setSelectedInstruction((prev) => (prev === index ? -1 : index))}
                >
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
