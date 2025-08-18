import React, { useState, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { nanoid } from 'nanoid'
import { Plus } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { SortableInput } from '@/components/custom'

type ListItem = {
  id: string
  value: string
  autoFocus?: boolean
  noAnimate?: boolean
  checked?: boolean
}

type SortableListProps = {
  label?: string
  addItemLabel: string
  items: string[]
  onItemsChange: (newItems: string[]) => void
  className?: string
  multiLine?: boolean
  checkable?: boolean
  onItemCheckedChange?: (item: string, checked: boolean) => void
  checkedItems?: string[] // Items that should be checked
}

export function SortableList({
  label,
  addItemLabel,
  items,
  onItemsChange,
  className = '',
  multiLine,
  checkable = false,
  onItemCheckedChange,
  checkedItems = [],
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

  // Memoize the checked set to prevent unnecessary re-computations
  const checkedSet = useMemo(() => new Set(checkedItems), [checkedItems])

  // sync external prop changes to our internal state without breaking animations or focus
  // only update internal state if it doesn't match with the current one
  useEffect(() => {
    if (!items) return

    setInternalItems((currentInternalItems) => {
      // Check if values match 1:1 in order to avoid unnecessary rebuilds
      const valuesMatch =
        items.length === currentInternalItems.length &&
        items.every((item, i) => item === currentInternalItems[i].value)

      // If values match, just update checked states without rebuilding
      if (valuesMatch) {
        const checkedStatesMatch = currentInternalItems.every(
          (item) => checkedSet.has(item.value) === item.checked
        )

        if (checkedStatesMatch) {
          return currentInternalItems // No changes needed
        }

        // Only update checked states, preserve IDs and other properties
        return currentInternalItems.map((item) => ({
          ...item,
          checked: checkedSet.has(item.value),
        }))
      }

      // Only rebuild when items array has actually changed
      // Try to preserve existing items and their IDs when possible
      const used = new Set<number>()
      const rebuilt = items.map((val) => {
        const idx = currentInternalItems.findIndex((it, i) => it.value === val && !used.has(i))
        if (idx !== -1) {
          used.add(idx)
          // Preserve the existing item but update checked state
          return {
            ...currentInternalItems[idx],
            value: val, // Make sure value is current
            checked: checkedSet.has(val),
            noAnimate: true,
          }
        }
        // New item - generate new ID
        return { value: val, id: nanoid(), noAnimate: true, checked: checkedSet.has(val) }
      })
      return checkable ? sortByChecked(rebuilt) : rebuilt
    })
  }, [items, checkable, checkedSet])

  // set internal state and notify the parent
  const sortByChecked = (arr: ListItem[]) => {
    // Stable partition: unchecked first, then checked
    const unchecked = arr.filter((i) => !i.checked)
    const checked = arr.filter((i) => i.checked)
    return [...unchecked, ...checked]
  }

  const updateItems = (newItems: ListItem[]) => {
    const next = checkable ? sortByChecked(newItems) : newItems
    setInternalItems(next)
    onItemsChange(next.map((item) => item.value))
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
    updateItems([
      ...internalItems,
      { id: nanoid(), value: '', autoFocus: true, checked: false, noAnimate: false },
    ])
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

  const handleToggleChecked = (itemId: string, nextChecked: boolean) => {
    // Update the checked state first
    const updatedItems = internalItems.map((it) =>
      it.id === itemId ? { ...it, checked: nextChecked } : it
    )

    if (checkable) {
      // Calculate where the item should move to
      const itemIndex = updatedItems.findIndex((it) => it.id === itemId)
      let targetIndex: number

      if (nextChecked) {
        // Move checked item to the FIRST position among checked items
        // Find the index of the first checked item (excluding the one we're checking)
        const firstCheckedIndex = updatedItems.findIndex((it) => it.checked && it.id !== itemId)
        if (firstCheckedIndex === -1) {
          // No other checked items, put it at the end
          targetIndex = updatedItems.length - 1
        } else {
          // Put it right before the first checked item
          targetIndex = firstCheckedIndex
        }
      } else {
        // Move unchecked item to the LAST position among unchecked items
        // Count all items that will be unchecked (including this one)
        const allUncheckedItems = updatedItems.filter((it) => !it.checked || it.id === itemId)
        targetIndex = allUncheckedItems.length - 1
      }

      // Only animate if the item actually needs to move
      if (itemIndex !== targetIndex) {
        const reorderedItems = arrayMove(updatedItems, itemIndex, targetIndex)
        setInternalItems(reorderedItems)
        onItemsChange(reorderedItems.map((item) => item.value))
      } else {
        setInternalItems(updatedItems)
        onItemsChange(updatedItems.map((item) => item.value))
      }
    } else {
      setInternalItems(updatedItems)
      onItemsChange(updatedItems.map((item) => item.value))
    }

    // Call the callback with the item value and checked state
    const item = internalItems.find((it) => it.id === itemId)
    if (item && onItemCheckedChange) {
      onItemCheckedChange(item.value, nextChecked)
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
        <motion.ul
          className={`grid gap-2 ${internalItems.length > 0 ? 'mb-2' : ''}`}
          layout
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <SortableContext
            items={internalItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {internalItems.map(({ id, value, autoFocus, noAnimate, checked }) => (
                <SortableInput
                  key={id}
                  id={id}
                  value={value}
                  inputRef={(el) => (inputRefs.current[id] = el)}
                  onChange={(e) => handleItemChange(e, id)}
                  onRemoveSelf={() => handleRemoveItem(id)}
                  onKeyDown={(e) => handleKeydown(e, id)}
                  autoFocus={autoFocus}
                  multiLine={checkable ? false : multiLine}
                  noAnimate={noAnimate}
                  checkable={checkable}
                  checked={!!checked}
                  onCheckedChange={(c) => handleToggleChecked(id, c)}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </motion.ul>
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
