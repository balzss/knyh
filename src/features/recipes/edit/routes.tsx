import { useParams } from 'react-router-dom'
import { EditorOnly } from '@/components/layout/EditorOnly'
import EditRecipeView from './EditRecipeView'

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
