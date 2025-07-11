'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Save, Timer, Users, Ellipsis } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/TopBar'
import {
  AppSidebar,
  PageLayout,
  SortableList,
  IconButton,
  TagEditor,
  YieldDialog,
  TotalTimeDialog,
  SortableGroup,
  type GroupData,
} from '@/components/custom'
import { nanoid } from 'nanoid'
import type { Recipe, Tag } from '@/lib/data'

export default function Add() {
  const [recipeTitle, setRecipeTitle] = useState<string>('')
  const ingredientGroups = useRef<GroupData[]>([])

  const instructionList = useRef<string[]>([])

  const [tags, setTags] = useState<Tag[]>([])
  const [yieldValue, setYieldValue] = useState<string>('')
  const [totalTime, setTotalTime] = useState<string>('')
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(true)

  const { toggleSidebar } = useSidebar()
  const router = useRouter()

  useEffect(() => {
    setSubmitDisabled(!recipeTitle.length)
  }, [recipeTitle])

  const handleClosePage = () => {
    if (window.history.length && document.referrer === '') {
      router.back()
    } else {
      router.replace('/')
    }
  }

  const formatTotalTime = (time: string) => {
    const splitTime = time.split(':')
    const hours = Number(splitTime[0])
    const minutes = Number(splitTime[1])
    const formattedHours = hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : ''
    const formattedMinutes = minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : ''
    return [formattedHours, formattedMinutes].join(' ')
  }

  const handleSubmitRecipe = () => {
    const id = nanoid()
    const submitData: Recipe = {
      title: recipeTitle,
      id,
      ingredients: ingredientGroups.current,
      instructions: instructionList.current,
      tags: tags.map((t) => t.id),
      metadata: {
        yield: yieldValue,
        totalTime,
      },
    }
    alert(JSON.stringify(submitData))
  }

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        hideSidebarToggleMobile
        customTopbarContent={
          <div className="flex items-center gap-2">
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<X />}
              tooltip="Close"
              onClick={handleClosePage}
            />
            <span className="mr-auto sm:mr-4 font-bold">New recipe</span>
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<Ellipsis />}
              tooltip="More options"
              onClick={() => {}}
            />
          </div>
        }
      />
      <AppSidebar path="/new" />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <div className="grid w-full items-center gap-2 mb-4">
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
            onDataChange={(newData) => (ingredientGroups.current = newData)}
            initialData={[]}
          />

          <SortableList
            className="mb-4"
            newItemPlaceholder={['First step', 'Next step']}
            label="Instructions"
            initialItems={[]}
            onItemsChange={(newItems) => (instructionList.current = newItems)}
            multiLine
          />

          <div className="mb-4">
            <TagEditor
              label="Tags"
              buttonLabel="Add tag"
              tags={tags}
              onTagChange={(newTags) => setTags(newTags)}
            />
          </div>

          <div className="mb-8 flex gap-2">
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
                <Button onClick={() => {}} variant="outline">
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

          <div className="mb-4">
            <Button onClick={handleSubmitRecipe} disabled={submitDisabled}>
              <Save />
              Save recipe
            </Button>
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
