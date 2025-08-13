import { describe, it, expect } from 'vitest'
import {
  cn,
  shuffleArray,
  generateId,
  getErrorMessage,
  dataJsonPath,
  clientDataPath,
  serverDataPath,
} from '@/lib/utils'

// Helper to compare arrays as multisets
function sameMembers<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false
  const map = new Map<T, number>()
  for (const v of a) map.set(v, (map.get(v) || 0) + 1)
  for (const v of b) {
    const count = map.get(v)
    if (!count) return false
    if (count === 1) map.delete(v)
    else map.set(v, count - 1)
  }
  return map.size === 0
}

describe('cn', () => {
  it('merges conditional and tailwind classes (later overrides earlier)', () => {
    const result = cn('p-2', 'text-sm', undefined, 'p-4', ['font-bold'])
    // tailwind-merge should drop p-2 in favor of p-4
    expect(result.split(/\s+/).sort()).toEqual(['font-bold', 'p-4', 'text-sm'].sort())
  })
})

describe('shuffleArray', () => {
  it('returns new array reference with same members', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffleArray(input)
    expect(out).not.toBe(input)
    expect(sameMembers(out, input)).toBe(true)
  })

  it('handles empty & single-item arrays', () => {
    expect(shuffleArray([])).toEqual([])
    expect(shuffleArray([42])).toEqual([42])
  })
})

describe('generateId', () => {
  it('creates 8-char lowercase alnum id', () => {
    const id = generateId()
    expect(id).toMatch(/^[a-z0-9]{8}$/)
  })

  it('generates (likely) unique ids within a sample', () => {
    const set = new Set<string>()
    for (let i = 0; i < 500; i++) {
      set.add(generateId())
    }
    expect(set.size).toBe(500) // extremely unlikely collision with 36^8 space
  })
})

describe('getErrorMessage', () => {
  it('extracts message from Error', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
  })
  it('extracts message from plain object', () => {
    expect(getErrorMessage({ message: 'plain' })).toBe('plain')
  })
  it('falls back when message not string', () => {
    expect(getErrorMessage({ message: 123 as any }, 'fallback')).toBe('fallback')
  })
  it('falls back for primitive thrown value', () => {
    expect(getErrorMessage('oops' as any, 'fb')).toBe('fb')
  })
})

describe('data path constants', () => {
  it('dataJsonPath constant stable', () => {
    expect(dataJsonPath).toBe('data/data.json')
  })
  it('serverDataPath prefixes public', () => {
    expect(serverDataPath).toBe('public/data/data.json')
  })
  it('clientDataPath already includes base path (cannot re-eval easily in test)', () => {
    // Just assert current value shape
    expect(clientDataPath.endsWith('/data/data.json')).toBe(true)
  })
})
