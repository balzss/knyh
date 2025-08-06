import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { nanoid } from 'nanoid'
import { Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { SortableInput } from '@/components/custom'

type ListItem = {
  id: string
  value: string
  autoFocus?: boolean
  noAnimate?: boolean
}

type SortableListProps = {
  label: string
  addItemLabel: string
  items: string[]
  onItemsChange: (newItems: string[]) => void
  className?: string
  multiLine?: boolean
}

export function SortableList({
  label,
  addItemLabel,
  items,
  onItemsChange,
  className = '',
  multiLine,
}: SortableListProps) {
  const [internalItems, setInternalItems] = useState<ListItem[]>([])
  const inputRefs = useRef<{
    [key: string]: HTMLInputElement | HTMLTextAreaElement | null
  }>({})

  // sync external prop changes to our internal state without breaking animations or focus
  // only update internal state if it doesn't match with the current one
  useEffect(() => {
    if (!items) return
    setInternalItems((currentInternalItems) => {
      if (
        items.length === currentInternalItems.length &&
        items.every((item, i) => item === currentInternalItems[i].value)
      ) {
        return currentInternalItems
      }
      return items.map((item) => ({ value: item, id: nanoid(), noAnimate: true }))
    })
  }, [items])

  // set internal state and notify the parent
  const updateItems = (newItems: ListItem[]) => {
    setInternalItems(newItems)
    onItemsChange(newItems.map((item) => item.value))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = internalItems.findIndex((item) => item.id === active.id)
      const newIndex = internalItems.findIndex((item) => item.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        updateItems(arrayMove(internalItems, oldIndex, newIndex))
      }
    }
  }

  const handleItemChange = (
    changeEvent: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemId: string
  ) => {
    const { value } = changeEvent.target
    const updatedItems = internalItems.map((item) =>
      item.id === itemId ? { ...item, value, autoFocus: false, noAnimate: false } : item
    )
    updateItems(updatedItems)
  }

  const handleRemoveItem = (itemId: string) => {
    updateItems(internalItems.filter((item) => item.id !== itemId))
  }

  const handleAddItem = () => {
    updateItems([...internalItems, { id: nanoid(), value: '', autoFocus: true }])
  }

  const handleKeydown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemId: string
  ) => {
    const currentIndex = internalItems.findIndex((item) => item.id === itemId)

    if (e.key === 'Enter' && !multiLine) {
      e.preventDefault()
      updateItems([
        ...internalItems.slice(0, currentIndex + 1),
        { id: nanoid(), value: '', autoFocus: true },
        ...internalItems.slice(currentIndex + 1),
      ])
    }

    if (e.key === 'ArrowDown') {
      if (currentIndex < internalItems.length - 1) {
        inputRefs.current[internalItems[currentIndex + 1].id]?.focus()
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (currentIndex > 0) {
        inputRefs.current[internalItems[currentIndex - 1].id]?.focus()
      }
    }
  }

  return (
    <div className={`grid w-full items-center gap-2 ${className}`}>
      <Label>{label}</Label>
      <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]} id="dnd-context">
        <ul className="grid gap-2">
          <SortableContext
            items={internalItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {internalItems.map(({ id, value, autoFocus, noAnimate }) => (
                <SortableInput
                  key={id}
                  id={id}
                  value={value}
                  inputRef={(el) => (inputRefs.current[id] = el)}
                  onChange={(e) => handleItemChange(e, id)}
                  onRemoveSelf={() => handleRemoveItem(id)}
                  onKeyDown={(e) => handleKeydown(e, id)}
                  autoFocus={autoFocus}
                  multiLine={multiLine}
                  noAnimate={noAnimate}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </ul>
      </DndContext>
      <Button
        type="button"
        variant="ghost"
        className="font-normal text-muted-foreground justify-start"
        onClick={handleAddItem}
      >
        <Plus size={16} style={{ marginRight: '1px' }} />
        {addItemLabel}
      </Button>
    </div>
  )
}
