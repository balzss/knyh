import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { nanoid } from 'nanoid'
import { Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { SortableInput } from './SortableInput'

type ListItem = {
  id: string
  value: string
  autoFocus?: boolean
  noAnimate?: boolean
}

type SortableListProps = {
  label?: string
  addItemLabel: string
  items: string[]
  onItemsChange: (newItems: string[]) => void
  onItemBlur?: (items: string[]) => void
  className?: string
  multiLine?: boolean
  /** Drops an item that is still empty once focus leaves it */
  removeEmptyOnBlur?: boolean
  showCheckboxes?: boolean
  onItemChecked?: (item: string) => void
}

export function SortableList({
  label,
  addItemLabel,
  items,
  onItemsChange,
  onItemBlur,
  className = '',
  multiLine,
  removeEmptyOnBlur = false,
  showCheckboxes = false,
  onItemChecked,
}: SortableListProps) {
  const [internalItems, setInternalItems] = useState<ListItem[]>([])
  const inputRefs = useRef<{
    [key: string]: HTMLInputElement | HTMLTextAreaElement | null
  }>({})

  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    })
  )

  // sync external prop changes to our internal state without breaking animations or focus
  // only update internal state if it doesn't match with the current one
  useEffect(() => {
    if (!items) return

    setInternalItems((currentInternalItems) => {
      // Check if values match 1:1 in order to avoid unnecessary rebuilds
      const valuesMatch =
        items.length === currentInternalItems.length &&
        items.every((item, i) => item === currentInternalItems[i].value)

      if (valuesMatch) {
        return currentInternalItems // No changes needed
      }

      // Only rebuild when items array has actually changed
      // Try to preserve existing items and their IDs when possible
      const used = new Set<number>()
      const rebuilt = items.map((val) => {
        const idx = currentInternalItems.findIndex((it, i) => it.value === val && !used.has(i))
        if (idx !== -1) {
          used.add(idx)
          // Preserve the existing item
          return {
            ...currentInternalItems[idx],
            value: val, // Make sure value is current
            noAnimate: true,
          }
        }
        // New item - animate in unless this is the initial load
        const isInitialLoad = currentInternalItems.length === 0
        return { value: val, id: nanoid(), noAnimate: isInitialLoad }
      })
      return rebuilt
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
      item.id === itemId ? { ...item, value, autoFocus: false } : item
    )
    updateItems(updatedItems)
  }

  // Only the item that lost focus can be dropped. The one that just gained it may be new and empty.
  const handleItemBlur = (itemId: string) => {
    const blurred = internalItems.find((item) => item.id === itemId)
    if (removeEmptyOnBlur && blurred && blurred.value.trim() === '') {
      const remaining = internalItems.filter((item) => item.id !== itemId)
      updateItems(remaining)
      onItemBlur?.(remaining.map((item) => item.value))
      return
    }
    onItemBlur?.(internalItems.map((item) => item.value))
  }

  const handleRemoveItem = (itemId: string) => {
    updateItems(internalItems.filter((item) => item.id !== itemId))
  }

  const handleAddItem = () => {
    updateItems([...internalItems, { id: nanoid(), value: '', autoFocus: true, noAnimate: false }])
  }

  const handleKeydown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    itemId: string
  ) => {
    const currentIndex = internalItems.findIndex((item) => item.id === itemId)

    if (e.key === 'Escape' && !e.nativeEvent.isComposing) {
      e.currentTarget.blur()
      return
    }

    // In multi-line lists Shift+Enter keeps the default line break
    if (e.key === 'Enter' && !(multiLine && e.shiftKey) && !e.nativeEvent.isComposing) {
      e.preventDefault()
      updateItems([
        ...internalItems.slice(0, currentIndex + 1),
        { id: nanoid(), value: '', autoFocus: true },
        ...internalItems.slice(currentIndex + 1),
      ])
    }

    if (e.key === 'Backspace' && e.currentTarget.value === '' && currentIndex > 0) {
      e.preventDefault()
      const prev = inputRefs.current[internalItems[currentIndex - 1].id]
      if (prev) {
        prev.focus()
        prev.setSelectionRange(prev.value.length, prev.value.length)
      }
      updateItems(internalItems.filter((item) => item.id !== itemId))
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
    <div className={`grid w-full items-center ${className}`}>
      {label && <Label className="mb-2">{label}</Label>}
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
        id="dnd-context"
      >
        <ul className={`grid gap-2 ${internalItems.length > 0 ? 'mb-2' : ''}`}>
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
                  onInputBlur={() => handleItemBlur(id)}
                  autoFocus={autoFocus}
                  multiLine={multiLine}
                  noAnimate={noAnimate}
                  showCheckbox={showCheckboxes}
                  onItemChecked={() => onItemChecked?.(value)}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </ul>
      </DndContext>
      <Button
        type="button"
        variant="ghost"
        className="font-normal text-muted-foreground justify-start hover:bg-transparent"
        onClick={handleAddItem}
      >
        <Plus size={16} style={{ marginRight: '1px' }} />
        {addItemLabel}
      </Button>
    </div>
  )
}
