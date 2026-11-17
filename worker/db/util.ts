/** An ISO timestamp for `value`, or the current time when it is missing or invalid. */
export const toIso = (value: unknown): string => {
  const date = value ? new Date(value as string) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}
