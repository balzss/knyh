import { describe, it, expect } from 'vitest'
import { foldTagName, normalizeTagName } from '../tag-name'

describe('normalizeTagName', () => {
  it('trims and collapses inner whitespace', () => {
    expect(normalizeTagName('  slow \t  cooker ')).toBe('slow cooker')
  })

  it('composes decomposed accents', () => {
    expect(normalizeTagName('árpa')).toBe('árpa')
  })
})

describe('foldTagName', () => {
  it('ignores case and accents', () => {
    expect(foldTagName('Árpa')).toBe(foldTagName('  arpa '))
  })
})
