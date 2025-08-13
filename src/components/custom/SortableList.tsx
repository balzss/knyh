import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
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
}

export function SortableList({
  label,
  addItemLabel,
  items,
  onItemsChange,
  className = '',
  multiLine,
  checkable = false,
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
      // If values match 1:1 in order, keep as-is to preserve focus/animations and checked states
      if (
        items.length === currentInternalItems.length &&
        items.every((item, i) => item === currentInternalItems[i].value)
      ) {
        return currentInternalItems
      }
      // Otherwise, rebuild while attempting to preserve checked flags by matching on value
      const used = new Set<number>()
      const rebuilt = items.map((val) => {
        const idx = currentInternalItems.findIndex((it, i) => it.value === val && !used.has(i))
        if (idx !== -1) {
          used.add(idx)
          const { checked } = currentInternalItems[idx]
          return { value: val, id: nanoid(), noAnimate: true, checked }
        }
        return { value: val, id: nanoid(), noAnimate: true, checked: false }
      })
      return checkable ? sortByChecked(rebuilt) : rebuilt
    })
  }, [items, checkable])

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
    updateItems([...internalItems, { id: nanoid(), value: '', autoFocus: true, checked: false }])
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
    const updated = internalItems.map((it) =>
      it.id === itemId ? { ...it, checked: nextChecked } : it
    )
    updateItems(updated)
  }

  return (
    <div className={`grid w-full items-center ${className}`}>
      {label && <Label className="mb-2">{label}</Label>}
      <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]} id="dnd-context">
        <motion.ul
          className={`grid gap-2 ${internalItems.length > 0 ? 'mb-2' : ''}`}
          layout="position"
          transition={{ duration: 0.12, ease: 'easeOut' }}
        >
          <SortableContext
            items={internalItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
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
