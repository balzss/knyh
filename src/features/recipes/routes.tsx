import { useParams } from 'react-router-dom'
import { EditorOnly } from '@/components/layout/EditorOnly'
import RecipePage from '@/features/recipes/view/RecipePage'
import EditRecipeView from '@/features/recipes/edit/EditRecipeView'

export function RecipeRoute() {
  const { id } = useParams()
  return <RecipePage recipeId={id!} />
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
