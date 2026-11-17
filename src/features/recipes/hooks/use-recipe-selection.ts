import { useCallback, useState } from 'react'

/** Which recipe cards are selected on a list page, and which mode the top bar is in because of it */
export function useRecipeSelection() {
  const [selection, setSelection] = useState<string[]>([])

  const select = useCallback((id: string, selected: boolean) => {
    setSelection((prev) => {
      if (selected) return prev.includes(id) ? prev : [...prev, id]
      return prev.filter((item) => item !== id)
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => setSelection(ids), [])
  const clear = useCallback(() => setSelection([]), [])

  return {
    selection,
    select,
    selectAll,
    clear,
    topBarMode: selection.length > 0 ? ('select' as const) : ('search' as const),
  }
}
