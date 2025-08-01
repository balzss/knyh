'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Timer, Users } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  PageLayout,
  SortableList,
  TagEditor,
  YieldDialog,
  TotalTimeDialog,
  SortableGroup,
  myToast,
} from '@/components/custom'

import { useRecipeMutations, useTags } from '@/hooks'
import type { GroupData, Tag, Recipe } from '@/lib/types'

type FormViewProps = {
  recipeData: Recipe
}

export default function FormView({ recipeData }: FormViewProps) {
  const [recipeTitle, setRecipeTitle] = useState<string>('')
  const ingredientGroups = useRef<GroupData[]>([])

  const instructionList = useRef<string[]>([])

  const [tags, setTags] = useState<Tag[]>([])
  const [yieldValue, setYieldValue] = useState<string>('')
  const [totalTime, setTotalTime] = useState<string>('')
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(true)

  const router = useRouter()
  const { createRecipe } = useRecipeMutations()
  const { tags: initialTags } = useTags({
    ids: recipeData?.tags || [],
  })

  useEffect(() => {
    setSubmitDisabled(!recipeTitle.length)
    setTags(initialTags)
  }, [recipeTitle, initialTags])

  useEffect(() => {
    if (recipeData) {
      setRecipeTitle(recipeData.title)
    }
  }, [recipeData])

  const formatTotalTime = (time: string) => {
    const splitTime = time.split(':')
    const hours = Number(splitTime[0])
    const minutes = Number(splitTime[1])
    const formattedHours = hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : ''
    const formattedMinutes = minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : ''
    return [formattedHours, formattedMinutes].join(' ')
  }

  const handleSubmitRecipe = () => {
    if (!recipeTitle || !ingredientGroups.current.length || !instructionList.current.length) {
      alert('Some fields are empty')
      return
    }
    const newRecipePayload = {
      title: recipeTitle,
      ingredients: ingredientGroups.current,
      instructions: instructionList.current,
      tags: tags.map((t) => t.id),
      metadata: {
        yield: yieldValue,
        totalTime,
      },
    }
    createRecipe.mutate(newRecipePayload, {
      onSuccess: (newlyCreatedRecipes) => {
        router.push(`/recipes/${newlyCreatedRecipes[0].id}`)
        myToast({
          message: 'Recipe created successfully!',
        })
      },
    })
  }
  return (
    <PageLayout>
      <div className="grid w-full items-center gap-2 mb-3">
        <Label htmlFor="recipe-title">Recipe title</Label>
        <Input
          type="text"
          id="recipe-title"
          autoComplete="off"
          value={recipeTitle}
          onChange={(e) => setRecipeTitle(e.target.value)}
        />
      </div>

      <SortableGroup
        defaultLabel="Ingredients"
        onDataChange={(newData) => (ingredientGroups.current = newData)}
        initialData={
          typeof recipeData?.ingredients[0] === 'string'
            ? [{ label: 'vale', items: recipeData?.ingredients as string[] }]
            : []
        }
      />

      <SortableList
        className="mb-3"
        newItemPlaceholder={['First step', 'Next step']}
        label="Instructions"
        initialItems={recipeData?.instructions || []}
        onItemsChange={(newItems) => (instructionList.current = newItems)}
        multiLine
      />

      <div className="mb-3">
        <TagEditor
          label="Tags"
          buttonLabel="Add tag"
          tags={tags}
          onTagChange={(newTags) => setTags(newTags)}
        />
      </div>

      <div className="mb-6 flex gap-2">
        <YieldDialog
          trigger={
            <Button variant="outline">
              <Users />
              {yieldValue ? (
                <>
                  Yield: <span className="font-normal">{yieldValue}</span>
                </>
              ) : (
                'Set yield'
              )}
            </Button>
          }
          yieldValue={yieldValue}
          onYieldValueChange={(newValue) => setYieldValue(newValue)}
        />
        <TotalTimeDialog
          trigger={
            <Button variant="outline">
              <Timer />
              {totalTime ? (
                <>
                  Total time: <span className="font-normal">{formatTotalTime(totalTime)}</span>
                </>
              ) : (
                'Add total time'
              )}
            </Button>
          }
          totalTimeValue={totalTime}
          onTotalTimeValueChange={(newValue) => setTotalTime(newValue)}
        />
      </div>

      <div className="mb-3">
        <Button onClick={handleSubmitRecipe} disabled={submitDisabled} size="sm">
          <Save />
          Save recipe
        </Button>
      </div>
    </PageLayout>
  )
}
