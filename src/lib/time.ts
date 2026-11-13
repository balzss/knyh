/**
 * Total time is stored as "H:MM" (for example "0:45" or "1:30"). Values typed in markdown or
 * imported from older files can look different ("45m", "1h 30m", "45"), so reading is lenient.
 */

export type TotalTime = { hours: number; minutes: number }

// A number followed by a unit, in English or Hungarian. Either part may be missing.
const WITH_UNITS =
  /^(?:(\d+)\s*(?:h|hr|hrs|hour|hours|ó|óra)(?![\p{L}])\s*)?(?:(\d+)\s*(?:m|min|mins|minute|minutes|p|perc)(?![\p{L}])\s*)?$/iu

/** Reads a stored or typed time. Returns null when the text isn't a recognisable time. */
export function parseTotalTime(value: string | null | undefined): TotalTime | null {
  const text = (value ?? '').trim()
  if (!text) return null

  let hours: number
  let minutes: number

  const clock = /^(\d*)\s*:\s*(\d*)$/.exec(text)
  const units = WITH_UNITS.exec(text)
  if (clock) {
    hours = Number(clock[1] || 0)
    minutes = Number(clock[2] || 0)
  } else if (units) {
    hours = Number(units[1] || 0)
    minutes = Number(units[2] || 0)
  } else if (/^\d+$/.test(text)) {
    hours = 0
    minutes = Number(text)
  } else {
    return null
  }

  // 90 minutes is 1 hour 30 minutes
  const total = hours * 60 + minutes
  return { hours: Math.floor(total / 60), minutes: total % 60 }
}

/** The form stored in the database: "H:MM", an empty string for no time, or the text as typed if unreadable. */
export function normalizeTotalTime(value: string | null | undefined): string {
  const parsed = parseTotalTime(value)
  if (!parsed) return (value ?? '').trim()
  if (parsed.hours === 0 && parsed.minutes === 0) return ''
  return `${parsed.hours}:${String(parsed.minutes).padStart(2, '0')}`
}

export type TimeLabels = { hours: string; minutes: string }

/** "1 hrs", "45 mins", "1 hrs 30 mins". Text that isn't a time is shown as it was typed. */
export function formatTotalTime(value: string | null | undefined, labels: TimeLabels): string {
  const parsed = parseTotalTime(value)
  if (!parsed) return (value ?? '').trim()

  return [
    parsed.hours > 0 ? `${parsed.hours} ${labels.hours}` : '',
    parsed.minutes > 0 ? `${parsed.minutes} ${labels.minutes}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}
