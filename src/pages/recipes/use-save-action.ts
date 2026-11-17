import { useEffect, useRef } from 'react'
import type { RecipeDraft } from '@/lib/types'

/** Reads the in-progress recipe from whichever edit view is mounted. */
export type DraftGetter = () => RecipeDraft | null | undefined

/** The save button the edit page shows in its top bar, owned by whichever view is mounted. */
export type SaveAction = {
  label: string
  disabled: boolean
  onSave: () => void
}

/** Hands the current save action to the parent and removes it when the view unmounts. */
export function useSaveAction(
  register: ((action: SaveAction | null) => void) | undefined,
  { label, disabled, onSave }: SaveAction
) {
  // The handler changes on every render, so call it through a ref to keep the registration stable
  const onSaveRef = useRef(onSave)
  useEffect(() => {
    onSaveRef.current = onSave
  })

  useEffect(() => {
    if (!register) return
    register({ label, disabled, onSave: () => onSaveRef.current() })
    return () => register(null)
  }, [register, label, disabled])
}
