import { useState } from 'react'
import { motion } from 'motion/react'
import { SlidersHorizontal, Search } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { TextInput, IconButton } from '@/components/custom'

type TopBarSearchProps = {
  searchQuery: string
  onSearchQueryChange: (newValue: string) => void
  selectedLayout: 'grid' | 'list'
  onLayoutChange: (selectedValue: 'grid' | 'list') => void
}

export function TopBarSearch({
  searchQuery,
  onSearchQueryChange,
  selectedLayout,
  onLayoutChange,
}: TopBarSearchProps) {
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState<boolean>(false)
  return (
    <motion.div
      className="flex-1"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex gap-2"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex-1 relative flex items-center max-w-2xl ml-1">
          <TextInput
            placeholder="Search"
            clearable
            Icon={Search}
            value={searchQuery}
            onChange={(_e, value) => onSearchQueryChange(value)}
          />
        </div>
        <Popover
          open={isFilterOptionsOpen}
          onOpenChange={(newValue) => setIsFilterOptionsOpen(newValue)}
        >
          <PopoverTrigger asChild>
            <span>
              <IconButton
                size="normal"
                variant="ghost"
                icon={<SlidersHorizontal />}
                tooltip="Filter and view options"
                isActive={isFilterOptionsOpen}
                onClick={() => setIsFilterOptionsOpen((oldValue) => !oldValue)}
              />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 mx-2">
            <div className="hidden sm:flex items-center justify-between">
              <Label htmlFor="layoutSelect" className="font-bold">
                Layout
              </Label>
              <Select
                onValueChange={onLayoutChange}
                defaultValue={selectedLayout}
              >
                <SelectTrigger className="w-[180px]" id="layoutSelect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
    </motion.div>
  )
}
