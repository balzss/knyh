export const MAX_TAG_NAME_LENGTH = 100

/** Canonical stored form of a tag name: composed Unicode, inner whitespace collapsed, ends trimmed. */
export const normalizeTagName = (name: string): string =>
  name.normalize('NFC').replace(/\s+/g, ' ').trim()

/** Key for comparing and searching names, ignoring case and accents. */
export const foldTagName = (name: string): string =>
  normalizeTagName(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
