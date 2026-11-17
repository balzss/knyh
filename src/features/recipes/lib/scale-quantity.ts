/** A line of text split so the (possibly scaled) leading amount can be styled on its own. */
export type ScaledLine = {
  /** The scaled amount, or '' when the line has none or is unchanged */
  amount: string
  /** Everything after the amount, or the whole line when nothing was scaled */
  rest: string
  changed: boolean
}

export type DecimalSeparator = '.' | ','

const GLYPHS: Record<string, number> = {
  '½': 1 / 2,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 1 / 4,
  '¾': 3 / 4,
  '⅛': 1 / 8,
  '⅜': 3 / 8,
  '⅝': 5 / 8,
  '⅞': 7 / 8,
}

/** From here on one decimal is precise enough ("82.5 g"), below it two keep "0.25" intact */
const COARSE_FROM = 10
const MAX_FACTOR = 100

const GLYPH_CLASS = `[${Object.keys(GLYPHS).join('')}]`
// Order matters: the longer forms must be tried before the plain integer or decimal
const TOKEN = `(?:\\d+\\s+\\d+\\/\\d+|\\d+\\s?${GLYPH_CLASS}|\\d+\\/\\d+|${GLYPH_CLASS}|\\d+(?:[.,]\\d+)?)`
const LEADING_AMOUNT = new RegExp(`^(\\s*)(${TOKEN})(?:(\\s*[-–]\\s*)(${TOKEN}))?`)
const WHOLE_TOKEN = new RegExp(`^${TOKEN}$`)

function parseToken(token: string): number | null {
  const mixed = token.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) {
    const den = Number(mixed[3])
    return den ? Number(mixed[1]) + Number(mixed[2]) / den : null
  }
  const glyph = token.match(new RegExp(`^(\\d+)?\\s?(${GLYPH_CLASS})$`))
  if (glyph) return Number(glyph[1] ?? 0) + GLYPHS[glyph[2]]
  const fraction = token.match(/^(\d+)\/(\d+)$/)
  if (fraction) {
    const den = Number(fraction[2])
    return den ? Number(fraction[1]) / den : null
  }
  return Number(token.replace(',', '.'))
}

/** Formats an amount as a short decimal, never as a fraction */
export function formatAmount(value: number, separator: DecimalSeparator = '.') {
  const places = value >= COARSE_FROM ? 1 : 2
  return String(Number(value.toFixed(places))).replace('.', separator)
}

/**
 * Scales the leading amount of an ingredient line (or the yield). Handles integers, decimals
 * with a point or comma, 1/2, 1 1/2, ½, 1½ and ranges like 1-2. The result is always a decimal. Lines without a leading amount
 * ("salt to taste") and percentages are returned as they are.
 */
export function scaleLine(
  text: string,
  factor: number,
  separator: DecimalSeparator = '.'
): ScaledLine {
  const unchanged = { amount: '', rest: text, changed: false }
  if (factor === 1) return unchanged

  const match = text.match(LEADING_AMOUNT)
  if (!match) return unchanged

  const [whole, space, firstToken, dash, secondToken] = match
  const rest = text.slice(whole.length)
  if (/^\s*%/.test(rest)) return unchanged

  const first = parseToken(firstToken)
  const second = secondToken ? parseToken(secondToken) : null
  if (first === null || (secondToken && second === null)) return unchanged

  const scaled = (value: number) => formatAmount(value * factor, separator)
  const amount = second !== null ? `${scaled(first)}${dash}${scaled(second)}` : scaled(first)
  return { amount: space + amount, rest, changed: true }
}

/** Reads what a person typed as a multiplier. Returns null for anything unusable. */
export function parseFactor(input: string): number | null {
  const trimmed = input.trim()
  if (!WHOLE_TOKEN.test(trimmed)) return null
  const parsed = parseToken(trimmed)
  if (parsed === null || !Number.isFinite(parsed)) return null
  return parsed > 0 && parsed <= MAX_FACTOR ? parsed : null
}
