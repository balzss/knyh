import { useState } from 'react'
import { motion } from 'motion/react'
import { SlidersHorizontal, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { TextInput, IconButton } from '@/components/custom'

type TopBarSearchProps = {
  searchQuery: string
  onSearchQueryChange: (newValue: string) => void
  selectedLayout: 'grid' | 'list'
  layoutGridCols: number
  onLayoutChange: (selectedValue: 'grid' | 'list', layoudGridCols?: number) => void
}

export function TopBarSearch({
  searchQuery,
  onSearchQueryChange,
  selectedLayout,
  onLayoutChange,
  layoutGridCols = 7,
}: TopBarSearchProps) {
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState<boolean>(false)
  return (
    <motion.div
      className="flex gap-2"
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      layout
    >
      <div className="flex-1 relative flex items-center max-w-2xl ml-1">
        <TextInput
          placeholder="Search"
          clearable
          icon={Search}
          value={searchQuery}
          onValueChange={(_e, value) => onSearchQueryChange(value)}
          type="search"
        />
      </div>
      <Popover
        open={isFilterOptionsOpen}
        onOpenChange={(newValue) => setIsFilterOptionsOpen(newValue)}
      >
        <PopoverTrigger asChild>
          <span>
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<SlidersHorizontal />}
              tooltip="Filter and view options"
              isActive={isFilterOptionsOpen}
              onClick={() => setIsFilterOptionsOpen((oldValue) => !oldValue)}
            />
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-80 mx-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="layoutSelect">Layout</Label>
            <Select onValueChange={onLayoutChange} defaultValue={selectedLayout}>
              <SelectTrigger className="w-[180px]" id="layoutSelect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedLayout === 'grid' && (
            <div className="flex items-center justify-between h-10">
              <Label htmlFor="layoutSelect">Max cols: {layoutGridCols}</Label>
              <Slider
                defaultValue={[layoutGridCols - 2]}
                max={3}
                step={1}
                className="w-[180px]"
                onValueChange={(value) => onLayoutChange(selectedLayout, value[0] + 2)}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </motion.div>
  )
}
