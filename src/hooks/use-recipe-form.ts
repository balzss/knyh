import { useState, useMemo } from 'react'
import type { Recipe } from '@/lib/types'

type RecipeFormData = Omit<Recipe, 'id'>

export function useRecipeForm(initialData: RecipeFormData) {
  const [formData, setFormData] = useState<RecipeFormData>(initialData)

  // Derive the 'isDirty' state by comparing current form data to the initial state.
  const isDirty = useMemo(() => {
    if (formData.title !== initialData.title) {
      return true
    }
  }, [formData.title, initialData.title])

  // Derive the 'isValid' state based on validation rules.
  const isValid = useMemo(() => {
    return (
      formData.title.trim().length > 0 &&
      formData.ingredients.length > 0 &&
      formData.instructions.length > 0
    )
  }, [formData])

  // The final submittable state. For a new recipe, it only needs to be valid.
  // For an existing recipe, it must be both dirty and valid.
  // const isSubmittable = useMemo(() => {
  //   const isNewRecipe = !initialDataRef.current.title
  //   return isNewRecipe ? isValid : isDirty && isValid
  // }, [isDirty, isValid])

  const updateField = <K extends keyof RecipeFormData>(field: K, value: RecipeFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return {
    formData,
    updateField,
    isDirty,
    isValid,
    // isSubmittable,
  }
}
