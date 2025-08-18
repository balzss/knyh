'use client'

import { useSearchParams } from 'next/navigation'
import RecipeView from '../recipes/view/[...id]/recipe-view'

export default function RecipePage() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id')

  if (!recipeId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Recipe ID is required</p>
      </div>
    )
  }

  return <RecipeView recipeId={recipeId} />
}
