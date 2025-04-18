'use client'

import { useState, Fragment, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  ListPlus,
  ChevronsUp,
  ChevronsDown,
  ListX,
  Save,
  Timer,
  Users,
  Ellipsis,
} from 'lucide-react'
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
  GroupLabelEdit,
  TagEditor,
  YieldDialog,
  TotalTimeDialog,
} from '@/components/custom'

export default function Add() {
  const [ingredientGroupLabels, setIngredientGroupLabels] = useState<string[]>([''])
  const [tags, setTags] = useState<string[]>([])
  const [yieldValue, setYieldValue] = useState<string>('')
  const [totalTime, setTotalTime] = useState<string>('')
  const [disableAddIngredientGroupBtn, setDisableAddIngredientGroupBtn] = useState<boolean>(true)
  const ingredientLists = useRef<string[][]>([[]])
  const ingredientsRef = useRef<HTMLDivElement>(null)

  const { toggleSidebar } = useSidebar()
  const router = useRouter()

  const handleClosePage = () => {
    if (document.referrer.startsWith('https://balzss.github.io/knyh/')) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  const handleIngredientGroupLabelChange = (groupIndex: number, newValue: string) => {
    setIngredientGroupLabels((prevItems) =>
      prevItems.map((item, i) => (i === groupIndex ? newValue : item))
    )
  }

  const handleAddIngredientGroup = () => {
    ingredientLists.current.push([])

    setIngredientGroupLabels((prevItems) => {
      const isFirstGroup = prevItems.length === 1 && prevItems[0] === ''
      return [...(isFirstGroup ? ['First group'] : prevItems), 'New group']
    })

    // wait one tick to ensure the new group is included in the ref and can be focued
    setTimeout(() => {
      focusLastGroupLabel()
    }, 0)
  }

  const focusLastGroupLabel = () => {
    const ingredientsChildren = ingredientsRef.current?.children
    ;(ingredientsChildren?.[ingredientsChildren?.length - 2].firstChild as HTMLSpanElement)?.focus()
  }

  const handleIngredientsChange = (groupIndex: number, newIngredients: string[]) => {
    ingredientLists.current[groupIndex] = newIngredients
    setDisableAddIngredientGroupBtn(
      ingredientLists.current[ingredientLists.current.length - 1].length === 0
    )
  }

  const handleChangeIngredientGroupOrder = (currentIndex: number, newIndex: number) => {
    setIngredientGroupLabels((prevItems) => {
      ingredientLists.current = ingredientLists.current.map((item, index) =>
        index === currentIndex
          ? ingredientLists.current[newIndex]
          : index === newIndex
            ? ingredientLists.current[currentIndex]
            : item
      )
      return prevItems.map((item, index) =>
        index === currentIndex
          ? prevItems[newIndex]
          : index === newIndex
            ? prevItems[currentIndex]
            : item
      )
    })
  }

  const formatTotalTime = (time: string) => {
    const splitTime = time.split(':')
    const hours = Number(splitTime[0])
    const minutes = Number(splitTime[1])
    const formattedHours = hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : ''
    const formattedMinutes = minutes > 0 ? `${minutes} min${minutes > 1 ? 's' : ''}` : ''
    return [formattedHours, formattedMinutes].join(' ')
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
              tooltip="Clear selection"
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
      <AppSidebar path="/add" />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <div className="grid w-full items-center gap-2 mb-4">
            <Label htmlFor="recipe-title" className="font-bold">
              Recipe title
            </Label>
            <Input type="text" id="recipe-title" autoComplete="off" />
          </div>

          <div className="flex gap-3 flex-col" ref={ingredientsRef}>
            {ingredientGroupLabels.map((label, index) => {
              return (
                <Fragment key={index}>
                  {ingredientGroupLabels.length > 1 && (
                    <GroupLabelEdit
                      isInEditMode={true}
                      label={label}
                      onLabelChange={(newValue) =>
                        handleIngredientGroupLabelChange(index, newValue)
                      }
                      actions={[
                        {
                          tooltip: 'Move group up',
                          icon: <ChevronsUp />,
                          disabled: index === 0,
                          onClick: () => handleChangeIngredientGroupOrder(index, index - 1),
                        },
                        {
                          tooltip: 'Move group down',
                          icon: <ChevronsDown />,
                          disabled: index === ingredientGroupLabels.length - 1,
                          onClick: () => handleChangeIngredientGroupOrder(index, index + 1),
                        },
                        { tooltip: 'Remove group', icon: <ListX /> },
                      ]}
                    />
                  )}
                  <SortableList
                    label="Ingredients"
                    newItemPlaceholder={['New ingredient']}
                    initialItems={ingredientLists.current[index]}
                    onItemsChange={(newItems) => handleIngredientsChange(index, newItems)}
                  />
                </Fragment>
              )
            })}
          </div>

          <div className="mb-4">
            <Button
              variant="outline"
              onClick={handleAddIngredientGroup}
              disabled={disableAddIngredientGroupBtn}
            >
              <ListPlus />
              Add ingredient group
            </Button>
          </div>

          <SortableList
            className="mb-4"
            newItemPlaceholder={['First step', 'Next step']}
            label="Instructions"
            initialItems={[]}
            onItemsChange={() => {}}
            multiLine
          />

          <div className="mb-4">
            <TagEditor tags={tags} onTagChange={(newTags) => setTags(newTags)} />
          </div>

          <div className="mb-8 flex gap-2">
            <YieldDialog
              trigger={
                <Button className="font-bold" variant="outline">
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
                <Button onClick={() => {}} className="font-bold" variant="outline">
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
            <Button onClick={() => {}} disabled={true} className="font-bold">
              <Save />
              Save recipe
            </Button>
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
