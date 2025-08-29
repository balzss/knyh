import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'motion/react'
import { SlidersHorizontal, Search, X } from 'lucide-react'
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
import { useConfig, useUpdateConfig } from '@/hooks'
import type { SortOption, UserConfig } from '@/lib/types'

function DisplayOptionsMenu() {
  const t = useTranslations('TopBar')
  const updateConfig = useUpdateConfig()
  const { data: userConfig } = useConfig()
  const [open, setOpen] = useState<boolean>(false)

  const layoutGridCols = userConfig?.defaultGridCols || 5
  const layout = userConfig?.defaultLayout || 'list'
  const sort = userConfig?.defaultSort || 'updated-desc'

  const handleUpdateConfig = (newConfig: Partial<UserConfig>) => {
    updateConfig.mutate(newConfig)
  }

  return (
    <Popover open={open} onOpenChange={(newValue) => setOpen(newValue)}>
      <PopoverTrigger asChild>
        <span>
          <IconButton
            iconSize="normal"
            variant="ghost"
            icon={<SlidersHorizontal />}
            tooltip={t('filterAndViewOptions')}
            isActive={open}
            onClick={() => setOpen((oldValue) => !oldValue)}
          />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 mx-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sortSelect">{t('sortBy')}</Label>
          <Select
            onValueChange={(defaultSort: SortOption) => handleUpdateConfig({ defaultSort })}
            defaultValue={sort}
          >
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
          <Select
            onValueChange={(defaultLayout: 'list' | 'grid') =>
              handleUpdateConfig({ defaultLayout })
            }
            defaultValue={layout}
          >
            <SelectTrigger className="w-[180px]" id="layoutSelect">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">{t('list')}</SelectItem>
              <SelectItem value="grid">{t('grid')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {layout === 'grid' && (
          <div className="flex items-center justify-between h-10">
            <Label htmlFor="layoutSelect">{t('maxCols', { cols: layoutGridCols })}</Label>
            <Slider
              defaultValue={[layoutGridCols - 2]}
              max={3}
              step={1}
              className="w-[180px]"
              onValueChange={(value) => handleUpdateConfig({ defaultGridCols: value[0] + 2 })}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

type TopBarSearchProps = {
  searchQuery: string
  onSearchQueryChange: (newValue: string) => void
}

function TopBarSearch({ searchQuery, onSearchQueryChange }: TopBarSearchProps) {
  const t = useTranslations('TopBar')
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
      <DisplayOptionsMenu />
    </motion.div>
  )
}

type SelectAction = {
  icon: React.ReactNode
  tooltip: string
  onClick: () => void
  disabled?: boolean
}

type TopBarSelectProps = {
  selectionLength: number
  onClearSelection: () => void
  selectActions: SelectAction[]
}

function TopBarSelect({ selectionLength, onClearSelection, selectActions }: TopBarSelectProps) {
  const t = useTranslations('TopBar')
  return (
    <motion.div
      className="flex items-center gap-2 w-full max-w-2xl"
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      layout
    >
      <IconButton
        iconSize="normal"
        variant="ghost"
        icon={<X />}
        tooltip={t('clearSelection')}
        onClick={onClearSelection}
      />
      <span className="mr-auto sm:mr-4 font-bold">
        {selectionLength} {t('selectedItems')}
      </span>
      {selectActions.map(({ icon, tooltip, onClick, disabled = false }, index) => (
        <IconButton
          key={index}
          iconSize="normal"
          variant="ghost"
          icon={icon}
          tooltip={tooltip}
          onClick={onClick}
          disabled={disabled}
        />
      ))}
    </motion.div>
  )
}

type TopBarSearchSelectProps = {
  mode: 'search' | 'select'
} & TopBarSearchProps &
  TopBarSelectProps

export function TopBarSearchSelect({
  mode = 'search',
  searchQuery,
  onSearchQueryChange,
  onClearSelection,
  selectionLength,
  selectActions,
}: TopBarSearchSelectProps) {
  return (
    <AnimatePresence initial={false}>
      {mode === 'select' ? (
        <TopBarSelect
          onClearSelection={onClearSelection}
          selectionLength={selectionLength}
          selectActions={selectActions}
        />
      ) : (
        <TopBarSearch searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} />
      )}
    </AnimatePresence>
  )
}
