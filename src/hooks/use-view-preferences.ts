import { useCallback, useSyncExternalStore } from 'react'
import {
  DEFAULT_VIEW_PREFERENCES,
  parseViewPreferences,
  type ViewPreferences,
} from '@/lib/view-preferences'

const STORAGE_KEY = 'knyh-view'
const CHANGE_EVENT = 'knyh-view-change'

// Used when the browser won't let us touch localStorage (private windows, blocked site data)
let memoryValue: string | null = null

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? memoryValue
  } catch {
    return memoryValue
  }
}

// useSyncExternalStore needs the same object back until the stored value changes
let cachedRaw: string | null | undefined
let cachedValue: ViewPreferences = DEFAULT_VIEW_PREFERENCES

function getSnapshot(): ViewPreferences {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedValue = parseViewPreferences(raw)
  }
  return cachedValue
}

function subscribe(onChange: () => void) {
  // "storage" covers other tabs, our own event covers this one
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

function save(next: ViewPreferences) {
  const raw = JSON.stringify(next)
  memoryValue = raw
  try {
    localStorage.setItem(STORAGE_KEY, raw)
  } catch {
    /* kept in memory for this tab */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** The visitor's sort order and layout, saved in this browser and shared across its tabs. */
export function useViewPreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_VIEW_PREFERENCES)

  const update = useCallback((changes: Partial<ViewPreferences>) => {
    save({ ...getSnapshot(), ...changes })
  }, [])

  return { ...preferences, update }
}
