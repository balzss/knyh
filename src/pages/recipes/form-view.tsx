import { useNavigate } from 'react-router-dom'
import { useEffect, type MutableRefObject } from 'react'
import { useTranslations } from 'use-intl'
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
import { getRecipeViewUrl } from '@/lib/urls'
import { getErrorMessage } from '@/lib/utils'
import { useRecipeMutations, useTags, useFormNavigationGuard } from '@/hooks'
import type { Tag, Recipe, RecipeDraft } from '@/lib/types'
import type { DraftGetter } from './edit-recipe-view'

type RecipeForm = Omit<Recipe, 'id' | 'tags'> & {
  tags: Tag[]
}

type FormViewProps = {
  initialRecipe?: Recipe
  resetTrigger?: number
  /** Content carried over from markdown mode */
  draft?: RecipeDraft | null
  draftGetter?: MutableRefObject<DraftGetter | null>
}

export default function FormView({
  initialRecipe,
  resetTrigger,
  draft,
  draftGetter,
}: FormViewProps) {
  const t = useTranslations('FormView')
  const navigate = useNavigate()
  const { createRecipe, updateRecipe } = useRecipeMutations()
  const { tags: initialTags } = useTags({
    ids: initialRecipe?.tags.map((t) => t.id) || [],
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isDirty, isValid, errors },
  } = useForm<RecipeForm>({
    defaultValues: {
      ingredients: [],
      instructions: [],
      ...initialRecipe,
      tags: initialTags,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    reset()
  }, [resetTrigger, reset])

  // Apply what was entered in markdown mode. Keeping the original defaults makes the form dirty,
  // so it still counts as unsaved and the save button follows the usual rules.
  useEffect(() => {
    if (draft) reset({ ...getValues(), ...draft }, { keepDefaultValues: true })
  }, [draft, reset, getValues])

  // Let the parent read the form when switching to markdown mode
  useEffect(() => {
    if (!draftGetter) return
    draftGetter.current = () => {
      if (!isDirty) return null
      const values = getValues()
      return {
        title: values.title ?? '',
        ingredients: values.ingredients ?? [],
        instructions: values.instructions ?? [],
        tags: values.tags ?? [],
        totalTime: values.totalTime ?? null,
        yield: values.yield ?? null,
      }
    }
    return () => {
      draftGetter.current = null
    }
  }, [draftGetter, getValues, isDirty])

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

  const showSaveError = (error: unknown) =>
    myToast({ message: `${t('saveFailed')} ${getErrorMessage(error)}` })

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
          onError: showSaveError,
          onSuccess: (updatedRecipe) => {
            navigate(getRecipeViewUrl(updatedRecipe.id))
            myToast({
              message: t('recipeUpdated'),
            })
          },
        }
      )
    } else {
      createRecipe.mutate(submitData, {
        onError: showSaveError,
        onSuccess: (newlyCreatedRecipes) => {
          navigate(getRecipeViewUrl(newlyCreatedRecipes[0].id))
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
