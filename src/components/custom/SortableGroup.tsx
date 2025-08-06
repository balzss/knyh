import { Fragment, useState, useEffect } from 'react'
import { ChevronsUp, ChevronsDown, ListX, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SortableList, GroupLabelEdit } from '@/components/custom'
import type { GroupData } from '@/lib/types'

type SortableGroupProps = {
  data?: GroupData[]
  onDataChange?: (newData: GroupData[]) => void
  defaultLabel: string
}

const defaultGroupData: GroupData[] = [{ label: '', items: [] }]

export function SortableGroup({ data, onDataChange, defaultLabel }: SortableGroupProps) {
  const [groupData, setGroupData] = useState<GroupData[]>(() => {
    return data && data.length > 0 ? data : defaultGroupData
  })

  useEffect(() => {
    // This effect syncs the component if the parent passes down a new `data` prop.
    // It's important for fully controlled behavior.
    if (data) {
      setGroupData(data)
    }
  }, [data])

  // --- Event Handlers using Functional Updates ---
  // Each handler now passes a function to setGroupData to avoid stale state.

  const handleGroupLabelChange = (index: number, newLabel: string) => {
    setGroupData((currentData) => {
      // <-- Use a function to get the latest state
      const newData = currentData.map((group, i) =>
        i === index ? { ...group, label: newLabel } : group
      )
      onDataChange?.(newData) // Notify parent from within the update
      return newData
    })
  }

  const handleItemsChange = (index: number, newItems: string[]) => {
    setGroupData((currentData) => {
      // <-- Use a function to get the latest state
      const newData = currentData.map((group, i) =>
        i === index ? { ...group, items: newItems } : group
      )
      onDataChange?.(newData) // Notify parent from within the update
      return newData
    })
  }

  const handleMoveGroup = (currentIndex: number, newIndex: number) => {
    setGroupData((currentData) => {
      // <-- Use a function to get the latest state
      const reorderedData = [...currentData]
      const [itemToMove] = reorderedData.splice(currentIndex, 1)
      reorderedData.splice(newIndex, 0, itemToMove)
      onDataChange?.(reorderedData)
      return reorderedData
    })
  }

  const handleAddGroup = () => {
    setGroupData((currentData) => {
      // <-- Use a function to get the latest state
      const updatedData = [...currentData]
      if (updatedData.length === 1 && updatedData[0].label === '') {
        updatedData[0].label = 'First Group'
      }
      const newData = [...updatedData, { label: 'New Group', items: [] }]
      onDataChange?.(newData)
      return newData
    })
  }

  const handleRemoveGroup = (index: number) => {
    setGroupData((currentData) => {
      // <-- Use a function to get the latest state
      const newData = currentData.filter((_, i) => i !== index)
      onDataChange?.(newData)
      return newData
    })
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
              label={group.label || defaultLabel}
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
