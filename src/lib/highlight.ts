/**
 * Splits text into segments for highlighting a search term,
 * accent-insensitive and case-insensitive.
 * Returns an array of { text, match } segments.
 */
export function highlightSegments(
  text: string,
  term: string
): Array<{ text: string; match: boolean }> {
  if (!term) return [{ text, match: false }]
  // Regex to strip diacritical marks
  const diacriticsRegex = /[\u0300-\u036f]/g
  const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(diacriticsRegex, '')

  const normText = normalize(text)
  const normTerm = normalize(term)
  const idx = normText.indexOf(normTerm)
  if (idx === -1) return [{ text, match: false }]

  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + term.length)
  const after = text.slice(idx + term.length)
  return [
    { text: before, match: false },
    { text: match, match: true },
    { text: after, match: false },
  ]
}
