import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { AnimatePresence, motion } from 'motion/react'
import { SlidersHorizontal, Search, X, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { TextInput } from './TextInput'
import { IconButton } from './IconButton'
import { useViewPreferences } from '@/hooks/use-view-preferences'
import { useEditMode } from '@/app/providers/EditModeProvider'
import { DEFAULT_VIEW_PREFERENCES, GRID_COLS_RANGE } from '@/lib/view-preferences'
import { RECIPE_STATUSES, type RecipeStatus, type SortOption } from '@shared/types'

function DisplayOptionsMenu() {
  const t = useTranslations('TopBar')
  const { sort, layout, gridCols, status, update } = useViewPreferences()
  const { editor } = useEditMode()
  const statusFilterActive = editor && status !== DEFAULT_VIEW_PREFERENCES.status
  const [open, setOpen] = useState<boolean>(false)

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
            showDot={statusFilterActive}
            aria-label={
              statusFilterActive ? t('filterAndViewOptionsActive') : t('filterAndViewOptions')
            }
            onClick={() => setOpen((oldValue) => !oldValue)}
          />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 mx-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sortSelect">{t('sortBy')}</Label>
          <Select onValueChange={(newSort: SortOption) => update({ sort: newSort })} value={sort}>
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
        {editor && (
          <div className="flex items-center justify-between">
            <Label htmlFor="statusSelect">{t('showRecipes')}</Label>
            <Select
              onValueChange={(newStatus: RecipeStatus | 'all') => update({ status: newStatus })}
              value={status}
            >
              <SelectTrigger className="w-[180px]" id="statusSelect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('statusAll')}</SelectItem>
                {RECIPE_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`status_${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Label htmlFor="layoutSelect">{t('layout')}</Label>
          <Select
            onValueChange={(newLayout: 'list' | 'grid') => update({ layout: newLayout })}
            value={layout}
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
            <Label htmlFor="layoutSelect">{t('maxCols', { cols: gridCols })}</Label>
            <Slider
              value={[gridCols - GRID_COLS_RANGE.min]}
              max={GRID_COLS_RANGE.max - GRID_COLS_RANGE.min}
              step={1}
              className="w-[180px]"
              onValueChange={(value) => update({ gridCols: value[0] + GRID_COLS_RANGE.min })}
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

type MoreAction = {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

type TopBarSelectProps = {
  selectionLength: number
  onClearSelection: () => void
  selectActions: SelectAction[]
  moreActions?: MoreAction[]
}

function TopBarSelect({
  selectionLength,
  onClearSelection,
  selectActions,
  moreActions = [],
}: TopBarSelectProps) {
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
      {moreActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span>
              <IconButton
                iconSize="normal"
                variant="ghost"
                icon={<MoreVertical />}
                tooltip={t('moreActions')}
              />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {moreActions.map(({ icon, label, onClick }, index) => (
              <DropdownMenuItem key={index} className="gap-2" onClick={onClick}>
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
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
  moreActions,
}: TopBarSearchSelectProps) {
  return (
    <AnimatePresence initial={false}>
      {mode === 'select' ? (
        <TopBarSelect
          onClearSelection={onClearSelection}
          selectionLength={selectionLength}
          selectActions={selectActions}
          moreActions={moreActions}
        />
      ) : (
        <TopBarSearch searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} />
      )}
    </AnimatePresence>
  )
}
