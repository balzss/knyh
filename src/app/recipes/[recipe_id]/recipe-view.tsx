'use client'

import { Users, Timer } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AppSidebar, PageLayout } from '@/components/custom'
import { useRecipes, useTags } from '@/hooks'

type RecipeViewProps = {
  recipeId: string
}

export default function RecipeView({ recipeId }: RecipeViewProps) {
  const { toggleSidebar } = useSidebar()
  const { recipes } = useRecipes({ ids: [recipeId] })
  const { tags } = useTags()
  const recipe = recipes?.[0]

  return (
    <div className="flex w-full">
      <TopBar onSidebarToggle={toggleSidebar} />
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
          <h2 className="text-xl text-muted-foreground mt-4">Ingredients</h2>
          <ul>
            {recipe?.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center space-x-2 text-md leading-8">
                <Checkbox id={`ingredient-${index}`} />
                <label htmlFor={`ingredient-${index}`}>{ingredient.toString()}</label>
              </li>
            ))}
          </ul>
          <h2 className="text-xl text-muted-foreground mt-4">Instructions</h2>
          <ol className="list-decimal flex flex-col gap-3 ml-4">
            {recipe?.instructions.map((instruction, index) => (
              <li key={index} className="flex items-center text-md leading-6 list-item">
                {instruction}
              </li>
            ))}
          </ol>
        </PageLayout>
      </main>
    </div>
  )
}
