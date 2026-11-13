import type { SortOption } from './types'

/** How a visitor likes to look at the recipe lists. Kept in the browser, not on the server. */
export type ViewPreferences = {
  sort: SortOption
  layout: 'list' | 'grid'
  /** The most columns the grid may use on a wide screen */
  gridCols: number
}

export const DEFAULT_VIEW_PREFERENCES: ViewPreferences = {
  sort: 'updated-desc',
  layout: 'list',
  gridCols: 5,
}

export const GRID_COLS_RANGE = { min: 2, max: 5 } as const

const SORT_OPTIONS: SortOption[] = [
  'random',
  'title-asc',
  'title-desc',
  'updated-asc',
  'updated-desc',
]

/** Reads stored JSON. Anything missing or invalid falls back to its default, field by field. */
export function parseViewPreferences(raw: string | null | undefined): ViewPreferences {
  let stored: Record<string, unknown> = {}
  try {
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && typeof parsed === 'object') stored = parsed
  } catch {
    /* corrupt value: use the defaults */
  }

  const { sort, layout, gridCols } = stored
  return {
    sort: SORT_OPTIONS.includes(sort as SortOption)
      ? (sort as SortOption)
      : DEFAULT_VIEW_PREFERENCES.sort,
    layout: layout === 'list' || layout === 'grid' ? layout : DEFAULT_VIEW_PREFERENCES.layout,
    gridCols:
      typeof gridCols === 'number' &&
      Number.isInteger(gridCols) &&
      gridCols >= GRID_COLS_RANGE.min &&
      gridCols <= GRID_COLS_RANGE.max
        ? gridCols
        : DEFAULT_VIEW_PREFERENCES.gridCols,
  }
}
