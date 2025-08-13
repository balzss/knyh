'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Save } from 'lucide-react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  PageLayout,
  SortableList,
  TagEditor,
  YieldDialog,
  TotalTimeDialog,
  myToast,
} from '@/components/custom'

import { useRecipeMutations, useTags } from '@/hooks'
import type { Tag, Recipe } from '@/lib/types'
import { formatTimestamp } from '@/lib/utils'

type RecipeForm = Omit<Recipe, 'id' | 'tags'> & { tags: Tag[] }

type FormViewProps = {
  initialRecipe?: Recipe
  resetTrigger?: number
}

export default function FormView({ initialRecipe, resetTrigger }: FormViewProps) {
  const t = useTranslations('FormView')
  const router = useRouter()
  const { createRecipe, updateRecipe } = useRecipeMutations()
  const { tags: initialTags } = useTags({
    ids: initialRecipe?.tags || [],
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<RecipeForm>({
    defaultValues: { ...initialRecipe, tags: initialTags },
  })

  useEffect(() => {
    reset()
  }, [resetTrigger, reset])

  const onSubmit: SubmitHandler<RecipeForm> = (submitData) => {
    if (!isValid) {
      alert(t('invalidRecipeData'))
      return
    }

    const now = formatTimestamp(new Date())
    const formattedSubmitData = {
      ...submitData,
      tags: submitData.tags.map((t) => t.id),
    }

    if (initialRecipe) {
      updateRecipe.mutate(
        {
          data: {
            ...formattedSubmitData,
            createdAt: initialRecipe.createdAt,
            lastModified: now,
          },
          id: initialRecipe.id,
        },
        {
          onSuccess: (updatedRecipe) => {
            router.push(`/recipes/${updatedRecipe.id}`)
            myToast({
              message: t('recipeUpdated'),
            })
          },
        }
      )
    } else {
      createRecipe.mutate(
        { ...formattedSubmitData, createdAt: now, lastModified: now },
        {
          onSuccess: (newlyCreatedRecipes) => {
            router.push(`/recipes/${newlyCreatedRecipes[0].id}`)
            myToast({
              message: t('recipeCreated'),
            })
          },
        }
      )
    }
  }

  return (
    <PageLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="recipe-title">{t('recipeTitle')}</Label>
          <Input type="text" autoComplete="off" {...register('title')} />
        </div>

        <Controller
          control={control}
          name="ingredients"
          render={({ field }) => (
            <SortableList
              label={t('ingredients')}
              addItemLabel={t('addIngredient')}
              items={field.value}
              onItemsChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="instructions"
          render={({ field }) => (
            <SortableList
              label={t('instructions')}
              addItemLabel={t('addInstruction')}
              items={field.value}
              onItemsChange={field.onChange}
              multiLine
            />
          )}
        />

        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagEditor
              label={t('tags')}
              buttonLabel={t('addTag')}
              tags={field.value}
              onTagChange={field.onChange}
              allowCreate={!initialRecipe}
            />
          )}
        />

        <div className="mb-3 flex gap-2">
          <Controller
            control={control}
            name="metadata.yield"
            render={({ field }) => (
              <YieldDialog yieldValue={field.value} onYieldValueChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="metadata.totalTime"
            render={({ field }) => (
              <TotalTimeDialog
                totalTimeValue={field.value}
                onTotalTimeValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="mb-3">
          <Button disabled={!isValid || !isDirty} type="submit">
            <Save />
            {t('saveRecipe')}
          </Button>
        </div>
      </form>
    </PageLayout>
  )
}
