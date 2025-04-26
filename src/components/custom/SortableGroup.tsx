import { Fragment, useState, useEffect, useRef } from 'react'
import { ChevronsUp, ChevronsDown, ListX, ListPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SortableList, GroupLabelEdit } from '@/components/custom'

export type GroupData = {
  label: string
  items: string[]
}

type SortableGroupProps = {
  initialData?: GroupData[]
  onDataChange?: (newData: GroupData[]) => void
}

export function SortableGroup({ initialData, onDataChange }: SortableGroupProps) {
  const [, setUpdateTrigger] = useState<number>(0)
  const [disableAddGroupBtn, setDisableAddGroupBtn] = useState<boolean>(false)
  const groupData = useRef<GroupData[]>([{ label: '', items: [] }])

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      groupData.current = initialData
      // setUpdateTrigger((p) => p + 1)
    }
  }, [initialData])

  const handleGroupLabelChange = (index: number, newLabel: string) => {
    const newData = groupData.current.map((group, i) =>
      i === index ? { ...group, label: newLabel } : group
    )
    groupData.current = newData
    onDataChange?.(newData)
  }

  const handleItemsChange = (index: number, newItems: string[]) => {
    const newData = groupData.current.map((group, i) =>
      i === index ? { ...group, items: newItems } : group
    )
    groupData.current = newData
    onDataChange?.(newData)
    setDisableAddGroupBtn(groupData.current[groupData.current.length - 1].items.length === 0)
  }

  const handleMoveGroup = (currentIndex: number, newIndex: number) => {
    const array = groupData.current
    const [itemToMove] = array.splice(currentIndex, 1)
    array.splice(newIndex, 0, itemToMove)
    onDataChange?.(array)
    setUpdateTrigger((p) => p + 1)
  }

  const handleAddGroup = () => {
    if (groupData.current.length === 1) {
      groupData.current[0].label = 'First Group'
    }
    groupData.current.push({ label: 'New Group', items: [] })
    setUpdateTrigger((p) => p + 1)
  }

  const handleRemoveGroup = (index: number) => {
    groupData.current.splice(index, 1)
    onDataChange?.(groupData.current)
    setUpdateTrigger((p) => p + 1)
  }

  return (
    <Fragment>
      <div className="flex gap-3 flex-col">
        {groupData.current.map((group, index) => {
          return (
            <Fragment key={index}>
              {groupData.current.length > 1 && (
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
                      disabled: index === groupData.current.length - 1,
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
                label="Ingredients"
                newItemPlaceholder={['New ingredient']}
                initialItems={group.items}
                onItemsChange={(newItems) => handleItemsChange(index, newItems)}
              />
            </Fragment>
          )
        })}
      </div>
      <div className="mb-4">
        <Button variant="outline" onClick={handleAddGroup} disabled={disableAddGroupBtn}>
          <ListPlus />
          Add ingredient group
        </Button>
      </div>
    </Fragment>
  )
}
