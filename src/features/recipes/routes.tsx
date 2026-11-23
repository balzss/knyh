import { useParams } from 'react-router-dom'
import RecipePage from '@/features/recipes/view/RecipePage'

export function RecipeRoute() {
  const { id } = useParams()
  return <RecipePage recipeId={id!} />
}
