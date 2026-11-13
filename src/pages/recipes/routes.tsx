import { useParams } from 'react-router-dom'
import { EditorOnly } from '@/components/custom'
import RecipeView from './recipe-view'
import EditRecipeView from './edit-recipe-view'

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
