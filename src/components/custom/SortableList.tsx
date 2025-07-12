import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { nanoid } from 'nanoid'
import { Label } from '@/components/ui/label'
import { DndContext, DragEndEvent, Modifier } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableInput } from '@/components/custom'

type IngredientItem = {
  id: string
  value: string
  autoFocus?: boolean
  noAnimate?: boolean
}

type SortableListProps = {
  label: string
  newItemPlaceholder?: string[]
  initialItems: string[]
  onItemsChange: (newItems: string[]) => void
  className?: string
  multiLine?: boolean
}

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
  } else if (containerNodeRect.bottom - bottomOffset < draggingNodeRect.bottom + transform.y) {
    y = containerNodeRect.bottom - draggingNodeRect.bottom - bottomOffset
  }
  return {
    ...transform,
    x: 0,
    y,
  }
}

export function SortableList({
  label,
  newItemPlaceholder,
  initialItems,
  onItemsChange,
  className,
  multiLine,
}: SortableListProps) {
  const isInitialMount = useRef(true)
  const [internalItems, setInternalItems] = useState<IngredientItem[]>([
    ...initialItems.map((item) => ({
      value: item,
      id: nanoid(),
    })),
    { value: '', id: nanoid(), noAnimate: true },
  ])
  const ingredientInputRefs = useRef<{
    [key: string]: HTMLInputElement | HTMLTextAreaElement | null
  }>({})

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setInternalItems((prevInternalItems) => {
      const sameValues = initialItems.every(
        (item, index) => item === prevInternalItems[index].value
      )
      if (!initialItems.length || sameValues) {
        return prevInternalItems
      }
      return [
        ...initialItems.map((item) => ({
          value: item,
          id: nanoid(),
          noAnimate: true,
        })),
        { value: '', id: nanoid(), noAnimate: true },
      ]
    })
  }, [initialItems])

  useEffect(() => {
    onItemsChange(internalItems.map((item) => item.value).slice(0, -1))
  }, [internalItems, onItemsChange])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setInternalItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id)
        const newIndex = prevItems.findIndex((item) => item.id === over?.id)
        return arrayMove(prevItems, oldIndex, newIndex)
      })
      onItemsChange(internalItems.map((item) => item.value).slice(0, -1))
    }
  }

  const handleItemChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemId: string
  ) => {
    const { value } = changeEvent.target

    setInternalItems((prevItems) => {
      const currentIndex = prevItems.findIndex((item) => item.id === itemId)
      const isLastItem = currentIndex === prevItems.length - 1

      // Determine if we should add a new row.
      // This should only happen when typing in the very last, previously empty input.
      const shouldAddNewItem = isLastItem && prevItems[currentIndex].value === '' && value !== ''

      let updatedItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, value, autoFocus: false, noAnimate: false } : item
      )

      if (shouldAddNewItem) {
        // CHANGE IS HERE: The new item no longer has `noAnimate: true`.
        // It will now animate on entry.
        updatedItems = [...updatedItems, { id: nanoid(), value: '' }]
      }

      return updatedItems
    })
  }

  const handleKeydown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemId: string
  ) => {
    const currentIndex = internalItems.findIndex((item) => item.id === itemId)

    if (
      e.key === 'Backspace' &&
      currentIndex > 0 &&
      currentIndex < internalItems.length - 1 &&
      internalItems.find((item) => item.id === itemId)?.value === ''
    ) {
      setInternalItems((prevItems) =>
        prevItems.filter((item) => {
          return item.id !== itemId
        })
      )
      ingredientInputRefs.current[internalItems[currentIndex - 1].id]?.focus()
      e.preventDefault()
    } else if (e.key === 'Enter' && !multiLine) {
      setInternalItems((prevItems) => {
        if (currentIndex === prevItems.length - 1) {
          return prevItems
        }
        if (currentIndex === prevItems.length - 2) {
          ingredientInputRefs.current[internalItems[currentIndex + 1].id]?.focus()
          return prevItems
        }
        return [
          ...prevItems.slice(0, currentIndex + 1),
          { id: nanoid(), value: '', autoFocus: true },
          ...prevItems.slice(currentIndex + 1),
        ]
      })
    } else if (e.key === 'ArrowDown') {
      if (currentIndex >= internalItems.length - 1) return
      ingredientInputRefs.current[internalItems[currentIndex + 1].id]?.focus()
    } else if (e.key === 'ArrowUp') {
      if (currentIndex <= 0) return
      ingredientInputRefs.current[internalItems[currentIndex - 1].id]?.focus()
      e.preventDefault()
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setInternalItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  return (
    <div className={`grid w-full items-center gap-2 mb-4 ${className}`}>
      <Label>{label}</Label>
      <DndContext
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElementCustom]}
        id="dnd-context"
      >
        <ul className={`grid gap-[0.5rem]`}>
          <SortableContext items={internalItems} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {internalItems.map(({ value, id, autoFocus, noAnimate }, index) => (
                <SortableInput
                  key={id}
                  id={id}
                  value={value}
                  inputRef={(el) => (ingredientInputRefs.current[id] = el)}
                  onChange={(e) => handleItemChange(e, id)}
                  onRemoveSelf={() => handleRemoveItem(id)}
                  newItemMode={index === internalItems.length - 1}
                  onKeyDown={(e) => handleKeydown(e, id)}
                  autoFocus={autoFocus}
                  placeholder={newItemPlaceholder?.[index ? newItemPlaceholder?.length - 1 : 0]}
                  multiLine={multiLine}
                  noAnimate={noAnimate}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </ul>
      </DndContext>
    </div>
  )
}
