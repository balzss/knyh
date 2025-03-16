import { useState, useEffect, useRef } from 'react'
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
  initialItems: string[]
  onItemsChange: (newItems: string[]) => void
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

export function SortableList({ label, initialItems, onItemsChange }: SortableListProps) {
  const [noAnimate, setNoAnimate] = useState<boolean>(true)
  const [internalItems, setInternalItems] = useState<IngredientItem[]>([
    ...initialItems.map((item) => ({
      value: item,
      id: nanoid(),
    })),
    { value: '', id: nanoid() },
  ])
  const [focusedIngredientId, setFocusedIngredientId] = useState<string>('')
  const ingredientInputRefs = useRef<{
    [key: string]: HTMLInputElement | null
  }>({})

  useEffect(() => {
    onItemsChange(internalItems.map((item) => item.value).slice(0, -1))
  }, [internalItems, onItemsChange])

  useEffect(() => {
    setNoAnimate(false)
  }, [])

  useEffect(() => {
    // keep focus when typing into the bottom item and a new one is being created
    if (focusedIngredientId !== null && ingredientInputRefs.current[focusedIngredientId]) {
      ingredientInputRefs.current[focusedIngredientId]?.focus()
    }
  }, [focusedIngredientId])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setInternalItems((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id)
        const newIndex = prevItems.findIndex((item) => item.id === over?.id)
        return arrayMove(prevItems, oldIndex, newIndex)
      })
    }
  }

  const handleIngredientItemChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement>,
    itemId: string
  ) => {
    const { value } = changeEvent.target
    const lastItem =
      internalItems.findIndex((item) => item.id === itemId) === internalItems.length - 1
    setInternalItems((prevItems) => {
      const updatedValues = prevItems.map((item) =>
        item.id === itemId ? { ...item, value, autoFocus: false, noAnimate: false } : item
      )
      return lastItem ? [...updatedValues, { id: nanoid(), value: '' }] : updatedValues
    })
    if (lastItem) {
      ingredientInputRefs.current[focusedIngredientId]?.focus()
    }
  }

  const handleIngredientItemKeydown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemId: string
  ) => {
    const currentIndex = internalItems.findIndex((item) => item.id === itemId)

    if (
      e.key === 'Backspace' &&
      internalItems.find((item) => item.id === itemId)?.value === '' &&
      currentIndex > 0
    ) {
      setInternalItems((prevItems) =>
        prevItems.filter((item) => {
          return item.id !== itemId
        })
      )
      ingredientInputRefs.current[internalItems[currentIndex - 1].id]?.focus()
      e.preventDefault()
    } else if (e.key === 'Enter') {
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

  const handleRemoveIngredient = (itemId: string) => {
    setInternalItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  return (
    <div className="grid w-full items-center gap-2 mb-4">
      <Label className="font-bold">{label}</Label>
      <DndContext
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElementCustom]}
        id="dnd-context"
      >
        <ul className={`grid gap-[0.5rem]`}>
          <SortableContext items={internalItems} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {internalItems.map(({ value, id, autoFocus }, index) => (
                <SortableInput
                  key={id}
                  id={id}
                  value={value}
                  inputRef={(el) => (ingredientInputRefs.current[id] = el)}
                  onChange={(e) => handleIngredientItemChange(e, id)}
                  onRemoveSelf={() => handleRemoveIngredient(id)}
                  newItemMode={index === internalItems.length - 1}
                  onFocus={() => setFocusedIngredientId(id)}
                  onKeyDown={(e) => handleIngredientItemKeydown(e, id)}
                  autoFocus={autoFocus}
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
