'use client'

import { useSearchParams } from 'next/navigation'
import EditRecipeView from '../recipes/edit-recipe-view'

export default function EditRecipePage() {
  const searchParams = useSearchParams()
  const recipeId = searchParams.get('id')

  if (!recipeId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Recipe ID is required</p>
      </div>
    )
  }

  return <EditRecipeView recipeId={recipeId} />
}
