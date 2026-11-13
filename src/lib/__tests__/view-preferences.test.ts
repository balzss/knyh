import { describe, it, expect } from 'vitest'
import { DEFAULT_VIEW_PREFERENCES, parseViewPreferences } from '@/lib/view-preferences'

describe('parseViewPreferences', () => {
  it('returns the defaults when nothing is stored', () => {
    expect(parseViewPreferences(null)).toEqual(DEFAULT_VIEW_PREFERENCES)
    expect(parseViewPreferences(undefined)).toEqual(DEFAULT_VIEW_PREFERENCES)
    expect(parseViewPreferences('')).toEqual(DEFAULT_VIEW_PREFERENCES)
  })

  it('reads valid stored values', () => {
    const raw = JSON.stringify({ sort: 'title-desc', layout: 'grid', gridCols: 3 })
    expect(parseViewPreferences(raw)).toEqual({ sort: 'title-desc', layout: 'grid', gridCols: 3 })
  })

  it('falls back field by field for invalid values', () => {
    const raw = JSON.stringify({ sort: 'sideways', layout: 'grid', gridCols: 99 })
    expect(parseViewPreferences(raw)).toEqual({
      sort: DEFAULT_VIEW_PREFERENCES.sort,
      layout: 'grid',
      gridCols: DEFAULT_VIEW_PREFERENCES.gridCols,
    })
  })

  it('rejects non-integer and out-of-range column counts', () => {
    for (const gridCols of [1, 6, 2.5, '3', null]) {
      expect(parseViewPreferences(JSON.stringify({ gridCols })).gridCols).toBe(
        DEFAULT_VIEW_PREFERENCES.gridCols
      )
    }
  })

  it('survives corrupt or unexpected JSON', () => {
    for (const raw of ['{not json', '[]', '42', '"text"', 'null']) {
      expect(parseViewPreferences(raw)).toEqual(DEFAULT_VIEW_PREFERENCES)
    }
  })
})
