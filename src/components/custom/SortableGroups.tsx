import { Fragment, useState, useEffect } from 'react'
import { ChevronsUp, ChevronsDown, ListX, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SortableList, GroupLabelEdit } from '@/components/custom'
import type { GroupData } from '@/lib/types'

type SortableGroupsProps = {
  data?: GroupData[]
  onDataChange?: (newData: GroupData[]) => void
  defaultLabel: string
}

const defaultGroupData: GroupData[] = [{ label: '', items: [] }]

export function SortableGroups({ data, onDataChange, defaultLabel }: SortableGroupsProps) {
  const [groupData, setGroupData] = useState<GroupData[]>(() => {
    // Always ensure at least one group is present
    if (!data || data.length === 0) {
      return defaultGroupData
    }
    return data
  })

  useEffect(() => {
    // This effect syncs the component if the parent passes down a new `data` prop.
    // Always ensure at least one group is present
    if (data) {
      if (data.length === 0) {
        setGroupData(defaultGroupData)
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
    setGroupData(reorderedData)
    onDataChange?.(reorderedData)
  }

  const handleAddGroup = () => {
    const updatedData = [...groupData]
    if (updatedData.length === 1 && updatedData[0].label === '') {
      // When adding the second group, give the first one a default label
      updatedData[0].label = defaultLabel
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
    const newData = groupData.filter((_, i) => i !== index)
    setGroupData(newData)
    onDataChange?.(newData)
  }

  // This value is correctly derived from state on each render.
  const isAddGroupDisabled = groupData.at(-1)?.items.length === 0

  return (
    <Fragment>
      <div className="flex gap-3 flex-col">
        {groupData.map((group, index) => (
          <Fragment key={group.label + '-' + index}>
            {groupData.length > 1 && (
              <GroupLabelEdit
                isInEditMode={true}
                label={group.label}
                onLabelChange={(newValue) => handleGroupLabelChange(index, newValue)}
                actions={[
                  {
                    tooltip: 'Move group up',
                    icon: <ChevronsUp />,
                    disabled: index === 0,
                    onClick: () => handleMoveGroup(index, index - 1),
                  },
                  {
                    tooltip: 'Move group down',
                    icon: <ChevronsDown />,
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
          </Fragment>
        ))}
      </div>
      <div className="mb-4">
        <Button variant="outline" onClick={handleAddGroup} disabled={isAddGroupDisabled}>
          <ListPlus />
          Add ingredient group
        </Button>
      </div>
    </Fragment>
  )
}
