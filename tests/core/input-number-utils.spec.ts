import { describe, it, expect } from 'vitest'
import { formatInputNumberDisplay, parseInputNumberValue } from '@expcat/tigercat-core'

describe('input-number-utils', () => {
  describe('formatInputNumberDisplay', () => {
    it('returns empty string for null', () => {
      expect(formatInputNumberDisplay(null, {})).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(formatInputNumberDisplay(undefined, {})).toBe('')
    })

    it('formats plain numbers via String when no formatter or precision', () => {
      expect(formatInputNumberDisplay(42, {})).toBe('42')
      expect(formatInputNumberDisplay(-3.5, {})).toBe('-3.5')
      expect(formatInputNumberDisplay(0, {})).toBe('0')
    })

    it('applies precision with toFixed', () => {
      expect(formatInputNumberDisplay(3.14159, { precision: 2 })).toBe('3.14')
      expect(formatInputNumberDisplay(5, { precision: 1 })).toBe('5.0')
    })

    it('prefers a custom formatter over precision', () => {
      const formatter = (value: number | undefined) => `$${value}`
      expect(formatInputNumberDisplay(10, { formatter, precision: 2 })).toBe('$10')
    })
  })

  describe('parseInputNumberValue', () => {
    it('returns null for empty string', () => {
      expect(parseInputNumberValue('', {})).toBeNull()
    })

    it('returns null for a lone minus sign while typing', () => {
      expect(parseInputNumberValue('-', {})).toBeNull()
    })

    it('parses numeric strings via Number', () => {
      expect(parseInputNumberValue('42', {})).toBe(42)
      expect(parseInputNumberValue('-3.5', {})).toBe(-3.5)
    })

    it('returns null for non-numeric input (NaN)', () => {
      expect(parseInputNumberValue('abc', {})).toBeNull()
    })

    it('prefers a custom parser', () => {
      const parser = (input: string) => Number(input.replace(/[^0-9.-]/g, ''))
      expect(parseInputNumberValue('$1,200', { parser })).toBe(1200)
    })
  })

  describe('Edge Cases', () => {
    it('round-trips a formatted value back through the parser', () => {
      const display = formatInputNumberDisplay(7.5, { precision: 2 })
      expect(parseInputNumberValue(display, {})).toBe(7.5)
    })

    it('formats zero with precision rather than treating it as empty', () => {
      expect(formatInputNumberDisplay(0, { precision: 2 })).toBe('0.00')
    })
  })
})
