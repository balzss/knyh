import { describe, it, expect } from 'vitest'
import { formatAmount, parseFactor, scaleLine } from '@/lib/scale-quantity'

const scaled = (text: string, factor: number, separator: '.' | ',' = '.') => {
  const { amount, rest } = scaleLine(text, factor, separator)
  return amount + rest
}

describe('scaleLine', () => {
  it('scales whole numbers and keeps the rest of the line', () => {
    expect(scaleLine('5 dkg füstölt szalonna', 2)).toEqual({
      amount: '10',
      rest: ' dkg füstölt szalonna',
      changed: true,
    })
    expect(scaled('300 g rizs', 0.5)).toBe('150 g rizs')
    expect(scaled('2 tojás', 3)).toBe('6 tojás')
  })

  it('returns the line untouched at factor 1', () => {
    expect(scaleLine('300 g rizs', 1)).toEqual({ amount: '', rest: '300 g rizs', changed: false })
  })

  it('leaves lines without a leading amount alone', () => {
    for (const line of ['Só, bors, vegeta ízlés szerint', 'csipet só', 'a pinch of salt', '']) {
      expect(scaleLine(line, 2)).toEqual({ amount: '', rest: line, changed: false })
    }
  })

  it('leaves percentages alone', () => {
    expect(scaleLine('100% rizs', 2).changed).toBe(false)
    expect(scaleLine('50 % tej', 2).changed).toBe(false)
  })

  it('scales only the first number on a line', () => {
    expect(scaled('2 db 400 g-os konzerv paradicsom', 2)).toBe('4 db 400 g-os konzerv paradicsom')
  })

  it('handles fractions, mixed numbers and unicode fractions', () => {
    expect(scaled('1/2 tk só', 2)).toBe('1 tk só')
    expect(scaled('1 1/2 bögre liszt', 2)).toBe('3 bögre liszt')
    expect(scaled('½ citrom', 3)).toBe('1.5 citrom')
    expect(scaled('1½ ek olaj', 2)).toBe('3 ek olaj')
    expect(scaled('1 ½ ek olaj', 2)).toBe('3 ek olaj')
  })

  it('shows thirds as decimals', () => {
    expect(scaled('1/3 csésze cukor', 3)).toBe('1 csésze cukor')
    expect(scaled('1 hagyma', 1 / 3)).toBe('0.33 hagyma')
    expect(scaled('2 hagyma', 1 / 3)).toBe('0.67 hagyma')
  })

  it('scales both ends of a range', () => {
    expect(scaled('1-2 gerezd fokhagyma', 2)).toBe('2-4 gerezd fokhagyma')
    expect(scaled('2–3 ek olaj', 3)).toBe('6–9 ek olaj')
    expect(scaled('1 - 2 db tojás', 2)).toBe('2 - 4 db tojás')
  })

  it('keeps decimals as decimals and honours the separator', () => {
    expect(scaled('0.5 l tej', 2)).toBe('1 l tej')
    expect(scaled('0,5 l tej', 3, ',')).toBe('1,5 l tej')
    expect(scaled('0,5 l tej', 0.5, ',')).toBe('0,25 l tej')
    expect(scaled('0.5 l tej', 0.5, '.')).toBe('0.25 l tej')
  })

  it('rounds large amounts to one decimal', () => {
    expect(scaled('250 g liszt', 0.33)).toBe('82.5 g liszt')
    expect(scaled('100 g vaj', 1.5)).toBe('150 g vaj')
  })

  it('scales a yield the same way', () => {
    expect(scaled('5 adag', 2)).toBe('10 adag')
    expect(scaled('4-6 servings', 0.5)).toBe('2-3 servings')
  })

  it('ignores a zero denominator', () => {
    expect(scaleLine('1/0 tk só', 2).changed).toBe(false)
  })
})

describe('formatAmount', () => {
  it('always uses decimals', () => {
    expect(formatAmount(0.5)).toBe('0.5')
    expect(formatAmount(2.75)).toBe('2.75')
    expect(formatAmount(12.54)).toBe('12.5')
    expect(formatAmount(1.5, ',')).toBe('1,5')
  })

  it('drops trailing zeros and rounds near-whole values', () => {
    expect(formatAmount(2)).toBe('2')
    expect(formatAmount(0.999)).toBe('1')
  })
})

describe('parseFactor', () => {
  it('reads integers, decimals and fractions', () => {
    expect(parseFactor('2')).toBe(2)
    expect(parseFactor(' 1.5 ')).toBe(1.5)
    expect(parseFactor('0,5')).toBe(0.5)
    expect(parseFactor('1/2')).toBe(0.5)
    expect(parseFactor('½')).toBe(0.5)
  })

  it('rejects empty, zero, negative, huge and non-numeric input', () => {
    for (const input of ['', '0', '-2', '101', 'abc', '2x', '1/0', '1-2']) {
      expect(parseFactor(input)).toBeNull()
    }
  })
})
