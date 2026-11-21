import type { RecipeDraft } from '@shared/types'

const STORAGE_KEY = 'knyh:new-recipe-draft'

/** Reads the unsaved new-recipe draft kept on this device, if any. */
export function loadRecipeDraft(): RecipeDraft | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as RecipeDraft) : null
  } catch {
    return null
  }
}

/** Keeps the draft on this device. Storage can be blocked or full, so failures are ignored. */
export function saveRecipeDraft(draft: RecipeDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Losing the draft cache is not worth interrupting the user
  }
}

/** Call after saving, on discard, and on sign-out so the next visitor doesn't see it. */
export function clearRecipeDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear
  }
}
