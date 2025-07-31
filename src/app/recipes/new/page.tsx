'use client'

import NewRecipeView from '../edit-recipe-view'
import { useSearchParams } from 'next/navigation'

export default function NewPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'raw' ? 'raw' : 'form'

  return <NewRecipeView mode={mode} />
}
