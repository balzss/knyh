import { useNavigate } from 'react-router-dom'
import { useEffect, type MutableRefObject } from 'react'
import { useTranslations } from 'use-intl'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageLayout } from '@/components/layout/PageLayout'
import { SortableList } from '@/components/inputs/SortableList'
import { SortableGroups } from './SortableGroups'
import { TagEditor } from '@/features/tags/TagEditor'
import { YieldDialog } from '@/features/recipes/components/YieldDialog'
import { TotalTimeDialog } from '@/features/recipes/components/TotalTimeDialog'
import { myToast } from '@/components/feedback/toast'
import { getRecipeEditUrl } from '@/lib/urls'
import { getErrorMessage } from '@/lib/utils'
import { useRecipeMutations } from '@/features/recipes/hooks/use-recipe-mutations'
import { useFormNavigationGuard } from '@/hooks/use-form-navigation-guard'
import { RECIPE_STATUSES, type Tag, type Recipe, type RecipeDraft } from '@shared/types'
import { clearRecipeDraft } from '@/features/recipes/lib/recipe-draft-cache'
import type { DraftGetter } from './use-save-action'
import { useSaveAction, type SaveAction } from './use-save-action'

type RecipeForm = Omit<Recipe, 'id' | 'tags'> & {
  tags: Tag[]
}

type FormViewProps = {
  initialRecipe?: Recipe
  resetTrigger?: number
  /** Content carried over from markdown mode */
  draft?: RecipeDraft | null
  draftGetter?: MutableRefObject<DraftGetter | null>
  onSaveActionChange?: (action: SaveAction | null) => void
}

export function FormView({
  initialRecipe,
  resetTrigger,
  draft,
  draftGetter,
  onSaveActionChange,
}: FormViewProps) {
  const t = useTranslations('FormView')
  const navigate = useNavigate()
  const { createRecipe, updateRecipe } = useRecipeMutations()

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
      notes: [],
      status: 'development',
      ...initialRecipe,
      tags: initialRecipe?.tags ?? [],
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
        notes: values.notes ?? [],
        tags: values.tags ?? [],
        totalTime: values.totalTime ?? null,
        yield: values.yield ?? null,
        status: values.status,
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
          onSuccess: () => {
            // Stay on the page; the saved values become the new baseline
            reset(submitData)
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
          clearRecipeDraft()
          navigate(getRecipeEditUrl(newlyCreatedRecipes[0].id), { replace: true })
          myToast({
            message: t('recipeCreated'),
          })
        },
      })
    }
  }

  const submit = handleSubmit(onSubmit)

  useSaveAction(onSaveActionChange, {
    label: t('saveRecipe'),
    disabled: !isValid || !isDirty,
    onSave: () => void submit(),
  })

  return (
    <PageLayout>
      <form onSubmit={submit} className="flex flex-col gap-6">
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
          name="notes"
          render={({ field }) => (
            <SortableList
              label={t('notes')}
              addItemLabel={t('addNote')}
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

        <div className="grid w-full items-center gap-2">
          <Label htmlFor="recipe-status">{t('status')}</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="recipe-status" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`status_${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </form>
    </PageLayout>
  )
}
