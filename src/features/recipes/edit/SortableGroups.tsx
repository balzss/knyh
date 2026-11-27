import { Fragment, useState, useEffect, useRef } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { nanoid } from 'nanoid'
import { ArrowUp, ArrowDown, ListX, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SortableList } from '@/components/inputs/SortableList'
import { GroupLabelEdit } from './GroupLabelEdit'
import type { GroupData } from '@shared/types'

type SortableGroupsProps = {
  data?: GroupData[]
  onDataChange?: (newData: GroupData[]) => void
  defaultLabel: string
}

const defaultGroupData = (): GroupData[] => [{ label: '', items: [] }]

export function SortableGroups({ data, onDataChange, defaultLabel }: SortableGroupsProps) {
  const [groupData, setGroupData] = useState<GroupData[]>(() => {
    // Always ensure at least one group is present
    if (!data || data.length === 0) {
      return defaultGroupData()
    }
    return data
  })

  // Stable ids so motion can animate groups to their new position when reordered.
  const idsRef = useRef<string[]>([])
  while (idsRef.current.length < groupData.length) idsRef.current.push(nanoid())
  idsRef.current.length = groupData.length

  useEffect(() => {
    // This effect syncs the component if the parent passes down a new `data` prop.
    // Always ensure at least one group is present
    if (data) {
      if (data.length === 0) {
        setGroupData(defaultGroupData())
      } else {
        setGroupData(data)
      }
    }
  }, [data])

  // --- Event Handlers using Functional Updates ---
  // Each handler now passes a function to setGroupData to avoid stale state.

  const handleGroupLabelChange = (index: number, newLabel: string) => {
    const newData = groupData.map((group, i) =>
      i === index ? { ...group, label: newLabel } : group
    )
    setGroupData(newData)
    onDataChange?.(newData)
  }

  const handleItemsChange = (index: number, newItems: string[]) => {
    const newData = groupData.map((group, i) =>
      i === index ? { ...group, items: newItems } : group
    )
    setGroupData(newData)
    onDataChange?.(newData)
  }

  const handleMoveGroup = (currentIndex: number, newIndex: number) => {
    const reorderedData = [...groupData]
    const [itemToMove] = reorderedData.splice(currentIndex, 1)
    reorderedData.splice(newIndex, 0, itemToMove)
    idsRef.current.splice(newIndex, 0, idsRef.current.splice(currentIndex, 1)[0])
    setGroupData(reorderedData)
    onDataChange?.(reorderedData)
  }

  const handleAddGroup = () => {
    const updatedData = [...groupData]
    if (updatedData.length === 1 && updatedData[0].label === '') {
      // When adding the second group, give the first one a default label
      updatedData[0] = { ...updatedData[0], label: defaultLabel }
    }
    const newData = [...updatedData, { label: 'New Group', items: [] }]
    setGroupData(newData)
    onDataChange?.(newData)
  }

  const handleRemoveGroup = (index: number) => {
    // Prevent removing the last group - always keep at least one
    if (groupData.length <= 1) {
      return
    }
    idsRef.current.splice(index, 1)
    const newData = groupData.filter((_, i) => i !== index)
    setGroupData(newData)
    onDataChange?.(newData)
  }

  // This value is correctly derived from state on each render.
  const isAddGroupDisabled = groupData.at(-1)?.items.length === 0

  return (
    <Fragment>
      <MotionConfig reducedMotion="user">
        <div className="flex gap-3 flex-col">
          <AnimatePresence initial={false}>
            {groupData.map((group, index) => (
              // layout="position" slides groups to their new place without stretching them
              <motion.div
                key={idsRef.current[index]}
                layout="position"
                className="flex gap-3 flex-col"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {groupData.length > 1 && (
                  <GroupLabelEdit
                    isInEditMode={true}
                    label={group.label}
                    onLabelChange={(newValue) => handleGroupLabelChange(index, newValue)}
                    actions={[
                      {
                        tooltip: 'Move group up',
                        icon: <ArrowUp />,
                        disabled: index === 0,
                        onClick: () => handleMoveGroup(index, index - 1),
                      },
                      {
                        tooltip: 'Move group down',
                        icon: <ArrowDown />,
                        disabled: index === groupData.length - 1,
                        onClick: () => handleMoveGroup(index, index + 1),
                      },
                      {
                        tooltip: 'Remove group',
                        icon: <ListX />,
                        onClick: () => handleRemoveGroup(index),
                      },
                    ]}
                  />
                )}
                <SortableList
                  label={groupData.length === 1 ? defaultLabel : ''}
                  addItemLabel="New ingredient"
                  items={group.items}
                  onItemsChange={(newItems) => handleItemsChange(index, newItems)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </MotionConfig>
      <div className="mb-4">
        <Button variant="outline" onClick={handleAddGroup} disabled={isAddGroupDisabled}>
          <ListPlus />
          Add ingredient group
        </Button>
      </div>
    </Fragment>
  )
}
