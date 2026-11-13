import { describe, it, expect } from 'vitest'
import { parseTotalTime, normalizeTotalTime, formatTotalTime } from '@/lib/time'

const en = { hours: 'hrs', minutes: 'mins' }
const hu = { hours: 'óra', minutes: 'perc' }

describe('parseTotalTime', () => {
  it('reads the stored H:MM form', () => {
    expect(parseTotalTime('1:30')).toEqual({ hours: 1, minutes: 30 })
    expect(parseTotalTime('0:45')).toEqual({ hours: 0, minutes: 45 })
    expect(parseTotalTime('01:05')).toEqual({ hours: 1, minutes: 5 })
  })

  it('reads a clock with one side empty', () => {
    expect(parseTotalTime('2:')).toEqual({ hours: 2, minutes: 0 })
    expect(parseTotalTime(':45')).toEqual({ hours: 0, minutes: 45 })
  })

  it('reads times written with units', () => {
    expect(parseTotalTime('45m')).toEqual({ hours: 0, minutes: 45 })
    expect(parseTotalTime('1h 30m')).toEqual({ hours: 1, minutes: 30 })
    expect(parseTotalTime('2 hours')).toEqual({ hours: 2, minutes: 0 })
    expect(parseTotalTime('1 óra 15 perc')).toEqual({ hours: 1, minutes: 15 })
    expect(parseTotalTime('20 MIN')).toEqual({ hours: 0, minutes: 20 })
  })

  it('treats a bare number as minutes', () => {
    expect(parseTotalTime('45')).toEqual({ hours: 0, minutes: 45 })
  })

  it('carries minutes over 59 into hours', () => {
    expect(parseTotalTime('0:90')).toEqual({ hours: 1, minutes: 30 })
    expect(parseTotalTime('120')).toEqual({ hours: 2, minutes: 0 })
  })

  it('reads an empty clock as no time', () => {
    expect(parseTotalTime(':')).toEqual({ hours: 0, minutes: 0 })
  })

  it('returns null for empty or unreadable text', () => {
    expect(parseTotalTime('')).toBeNull()
    expect(parseTotalTime(null)).toBeNull()
    expect(parseTotalTime(undefined)).toBeNull()
    expect(parseTotalTime('overnight')).toBeNull()
    expect(parseTotalTime('5 hamsters')).toBeNull()
  })
})

describe('normalizeTotalTime', () => {
  it('writes H:MM with padded minutes', () => {
    expect(normalizeTotalTime('45m')).toBe('0:45')
    expect(normalizeTotalTime('1h 5m')).toBe('1:05')
    expect(normalizeTotalTime('1:5')).toBe('1:05')
    expect(normalizeTotalTime('0:90')).toBe('1:30')
  })

  it('returns an empty string for no time', () => {
    expect(normalizeTotalTime('0:0')).toBe('')
    expect(normalizeTotalTime('')).toBe('')
    expect(normalizeTotalTime(null)).toBe('')
  })

  it('keeps text it cannot read', () => {
    expect(normalizeTotalTime(' overnight ')).toBe('overnight')
  })
})

describe('formatTotalTime', () => {
  it('shows exact hours as hours only', () => {
    expect(formatTotalTime('1:00', en)).toBe('1 hrs')
    expect(formatTotalTime('1:00', hu)).toBe('1 óra')
    expect(formatTotalTime('2:00', en)).toBe('2 hrs')
  })

  it('shows just minutes as minutes only', () => {
    expect(formatTotalTime('0:45', en)).toBe('45 mins')
    expect(formatTotalTime('0:45', hu)).toBe('45 perc')
    expect(formatTotalTime('45m', en)).toBe('45 mins')
  })

  it('shows both for a mix', () => {
    expect(formatTotalTime('1:30', en)).toBe('1 hrs 30 mins')
    expect(formatTotalTime('1:30', hu)).toBe('1 óra 30 perc')
    expect(formatTotalTime('0:90', hu)).toBe('1 óra 30 perc')
  })

  it('shows nothing for no time', () => {
    expect(formatTotalTime('', en)).toBe('')
    expect(formatTotalTime('0:00', en)).toBe('')
    expect(formatTotalTime(null, en)).toBe('')
  })

  it('shows text it cannot read as typed, instead of a blank', () => {
    expect(formatTotalTime('overnight', en)).toBe('overnight')
  })
})
