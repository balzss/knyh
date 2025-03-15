'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { nanoid } from 'nanoid'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { DndContext, DragEndEvent, Modifier } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AppSidebar, PageLayout, SortableInput } from '@/components/custom'

type IngredientItem = {
  id: string
  value: string
  autoFocus?: boolean
}

// gap between ingerdient list items
// const ingredientListGapRem = 0.5
// const ingredientListGapPx = ingredientListGapRem * parseFloat(getComputedStyle(document.documentElement).fontSize)
const ingredientListGapPx = 8 // TODO

const restrictToParentElementCustom: Modifier = ({
  containerNodeRect,
  draggingNodeRect,
  transform,
}) => {
  if (!draggingNodeRect || !containerNodeRect) {
    return transform
  }

  let y = transform.y
  const bottomOffset = draggingNodeRect.height + ingredientListGapPx
  if (containerNodeRect.top > draggingNodeRect.top + transform.y) {
    y = containerNodeRect.top - draggingNodeRect.top
  } else if (
    containerNodeRect.bottom - bottomOffset <
    draggingNodeRect.bottom + transform.y
  ) {
    y = containerNodeRect.bottom - draggingNodeRect.bottom - bottomOffset
  }
  return {
    ...transform,
    x: 0,
    y,
  }
}

export default function Create() {
  const { toggleSidebar } = useSidebar()
  const [ingredientList, setIngredientList] = useState<IngredientItem[]>([
    { id: nanoid(), value: '' },
  ])
  const [focusedIngredientId, setFocusedIngredientId] = useState<string>('')
  const ingredientInputRefs = useRef<{
    [key: string]: HTMLInputElement | null
  }>({})

  useEffect(() => {
    // keep focus when typing into the bottom item and a new one is being created
    if (
      focusedIngredientId !== null &&
      ingredientInputRefs.current[focusedIngredientId]
    ) {
      ingredientInputRefs.current[focusedIngredientId]?.focus()
    }
  }, [focusedIngredientId])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setIngredientList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleIngredientItemChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement>,
    itemId: string
  ) => {
    const { value } = changeEvent.target
    const lastItem =
      ingredientList.findIndex((item) => item.id === itemId) ===
      ingredientList.length - 1
    setIngredientList((prevItems) => {
      const updatedValues = prevItems.map((item) =>
        item.id === itemId ? { ...item, value, autoFocus: false } : item
      )
      return lastItem
        ? [...updatedValues, { id: nanoid(), value: '' }]
        : updatedValues
    })
    if (lastItem) {
      ingredientInputRefs.current[focusedIngredientId]?.focus()
    }
  }

  const handleIngredientItemKeydown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemId: string
  ) => {
    const currentIndex = ingredientList.findIndex((item) => item.id === itemId)

    if (
      e.key === 'Backspace' &&
      ingredientList.find((item) => item.id === itemId)?.value === ''
    ) {
      setIngredientList((prevItems) =>
        prevItems.filter((item) => {
          return item.id !== itemId
        })
      )
      ingredientInputRefs.current[ingredientList[currentIndex - 1].id]?.focus()
      e.preventDefault()
    } else if (e.key === 'Enter') {
      setIngredientList((prevItems) => {
        if (currentIndex === prevItems.length - 1) {
          return prevItems
        }
        if (currentIndex === prevItems.length - 2) {
          ingredientInputRefs.current[
            ingredientList[currentIndex + 1].id
          ]?.focus()
          return prevItems
        }
        return [
          ...prevItems.slice(0, currentIndex + 1),
          { id: nanoid(), value: '', autoFocus: true },
          ...prevItems.slice(currentIndex + 1),
        ]
      })
    }
  }

  const handleRemoveIngredient = (itemId: string) => {
    setIngredientList((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    )
  }

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-4 font-bold">Add Recipe</span>
          </div>
        }
      />
      <AppSidebar />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <div className="grid w-full items-center gap-2 mb-4">
            <Label htmlFor="recipe-title" className="font-bold">
              Recipe title
            </Label>
            <Input type="text" id="recipe-title" autoFocus />
          </div>

          <div className="grid w-full items-center gap-2 mb-4">
            <Label className="font-bold">Ingredients</Label>
            <DndContext
              onDragEnd={handleDragEnd}
              modifiers={[restrictToParentElementCustom]}
              id="dnd-context"
            >
              <ul className={`grid gap-[0.5rem]`}>
                <SortableContext
                  items={ingredientList}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {ingredientList.map(({ value, id, autoFocus }, index) => (
                      <SortableInput
                        key={id}
                        id={id}
                        value={value}
                        inputRef={(el) =>
                          (ingredientInputRefs.current[id] = el)
                        }
                        onChange={(e) => handleIngredientItemChange(e, id)}
                        onRemoveSelf={() => handleRemoveIngredient(id)}
                        newItemMode={index === ingredientList.length - 1}
                        onFocus={() => setFocusedIngredientId(id)}
                        onKeyDown={(e) => handleIngredientItemKeydown(e, id)}
                        autoFocus={autoFocus}
                        noAnimate={ingredientList.length <= 1}
                      />
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </ul>
            </DndContext>
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
