import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
import type { SortOption } from '@/hooks/use-recipes'

type TopBarSearchProps = {
  searchQuery: string
  onSearchQueryChange: (newValue: string) => void
  selectedLayout: 'grid' | 'list'
  layoutGridCols: number
  onLayoutChange: (selectedValue: 'grid' | 'list', layoudGridCols?: number) => void
  sortOption?: SortOption
  onSortChange?: (sortOption: SortOption) => void
}

export function TopBarSearch({
  searchQuery,
  onSearchQueryChange,
  selectedLayout,
  onLayoutChange,
  layoutGridCols = 7,
  sortOption = 'random',
  onSortChange,
}: TopBarSearchProps) {
  const t = useTranslations('TopBar')
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
          placeholder={t('searchRecipes')}
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
              tooltip={t('filterAndViewOptions')}
              isActive={isFilterOptionsOpen}
              onClick={() => setIsFilterOptionsOpen((oldValue) => !oldValue)}
            />
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-80 mx-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sortSelect">{t('sortBy')}</Label>
            <Select onValueChange={onSortChange} defaultValue={sortOption}>
              <SelectTrigger className="w-[180px]" id="sortSelect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">{t('random')}</SelectItem>
                <SelectItem value="title-asc">{t('titleAsc')}</SelectItem>
                <SelectItem value="title-desc">{t('titleDesc')}</SelectItem>
                <SelectItem value="updated-asc">{t('updatedAsc')}</SelectItem>
                <SelectItem value="updated-desc">{t('updatedDesc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="layoutSelect">{t('layout')}</Label>
            <Select onValueChange={onLayoutChange} defaultValue={selectedLayout}>
              <SelectTrigger className="w-[180px]" id="layoutSelect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">{t('list')}</SelectItem>
                <SelectItem value="grid">{t('grid')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedLayout === 'grid' && (
            <div className="flex items-center justify-between h-10">
              <Label htmlFor="layoutSelect">{t('maxCols', { cols: layoutGridCols })}</Label>
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
