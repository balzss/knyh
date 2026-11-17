import { useParams } from 'react-router-dom'
import { EditorOnly } from '@/components/layout/EditorOnly'
import RecipeView from '@/features/recipes/pages/RecipeView'
import EditRecipeView from '@/features/recipes/edit/EditRecipeView'

export function RecipeRoute() {
  const { id } = useParams()
  return <RecipeView recipeId={id!} />
}

export function EditRecipeRoute() {
  const { id } = useParams()
  return (
    <EditorOnly>
      <EditRecipeView recipeId={id!} />
    </EditorOnly>
  )
}

export function NewRecipeRoute() {
  return (
    <EditorOnly>
      <EditRecipeView />
    </EditorOnly>
  )
}
