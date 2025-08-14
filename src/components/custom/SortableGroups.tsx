// Back-compat wrapper for the old component name "SortableGroups".
// It simply delegates to the new implementation in SortableGroup.
import { SortableGroup } from './SortableGroup'
import type { GroupData } from '@/lib/types'

type SortableGroupsProps = {
  data?: GroupData[]
  onDataChange?: (newData: GroupData[]) => void
  defaultLabel: string
}

export function SortableGroups(props: SortableGroupsProps) {
  return <SortableGroup {...props} />
}
