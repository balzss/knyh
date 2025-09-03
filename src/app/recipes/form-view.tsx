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
  SortableGroups,
  TagEditor,
  YieldDialog,
  TotalTimeDialog,
  myToast,
} from '@/components/custom'
import { getRecipeViewUrl } from '@/lib/data-config'
import { useRecipeMutations, useTags, useFormNavigationGuard } from '@/hooks'
import type { Tag, Recipe } from '@/lib/types'

type RecipeForm = Omit<Recipe, 'id' | 'tags'> & {
  tags: Tag[]
}

type FormViewProps = {
  initialRecipe?: Recipe
  resetTrigger?: number
}

export default function FormView({ initialRecipe, resetTrigger }: FormViewProps) {
  const t = useTranslations('FormView')
  const router = useRouter()
  const { createRecipe, updateRecipe } = useRecipeMutations()
  const { tags: initialTags } = useTags({
    ids: initialRecipe?.tags.map((t) => t.id) || [],
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, errors },
  } = useForm<RecipeForm>({
    defaultValues: {
      ...initialRecipe,
      tags: initialTags,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    reset()
  }, [resetTrigger, reset])

  // Block navigation when there are unsaved changes
  useFormNavigationGuard({
    isDirty,
    message: {
      title: t('unsavedChanges'),
      description: t('unsavedChangesDescription'),
      confirmText: t('leave'),
      cancelText: t('stay'),
    },
  })

  const onSubmit: SubmitHandler<RecipeForm> = (submitData) => {
    if (!isValid) {
      myToast({
        message: t('invalidRecipeData'),
      })
      return
    }

    if (initialRecipe) {
      updateRecipe.mutate(
        {
          data: submitData,
          id: initialRecipe.id,
        },
        {
          onSuccess: (updatedRecipe) => {
            router.push(getRecipeViewUrl(updatedRecipe.id))
            myToast({
              message: t('recipeUpdated'),
            })
          },
        }
      )
    } else {
      createRecipe.mutate(submitData, {
        onSuccess: (newlyCreatedRecipes) => {
          router.push(getRecipeViewUrl(newlyCreatedRecipes[0].id))
          myToast({
            message: t('recipeCreated'),
          })
        },
      })
    }
  }

  return (
    <PageLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="recipe-title">{t('recipeTitle')}</Label>
          <Input
            type="text"
            autoComplete="off"
            {...register('title', {
              required: t('recipeTitleRequired'),
              minLength: {
                value: 1,
                message: t('recipeTitleRequired'),
              },
            })}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <Controller
          control={control}
          name="ingredients"
          render={({ field }) => (
            <SortableGroups
              data={field.value}
              onDataChange={field.onChange}
              defaultLabel={t('ingredients')}
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
              allowCreate
            />
          )}
        />

        <div className="mb-3 flex gap-2">
          <Controller
            control={control}
            name="yield"
            render={({ field }) => (
              <YieldDialog yieldValue={field.value || ''} onYieldValueChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="totalTime"
            render={({ field }) => (
              <TotalTimeDialog
                totalTimeValue={field.value || ''}
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
