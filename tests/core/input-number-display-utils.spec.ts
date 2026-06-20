import { describe, it, expect } from 'vitest'
import { formatInputNumberDisplay, parseInputNumberInput } from '@expcat/tigercat-core'

describe('formatInputNumberDisplay', () => {
  it('returns empty string for null/undefined', () => {
    expect(formatInputNumberDisplay(null)).toBe('')
    expect(formatInputNumberDisplay(undefined)).toBe('')
  })

  it('prefers a custom formatter over precision', () => {
    expect(
      formatInputNumberDisplay(1234.5, {
        formatter: (v) => `$${v}`,
        precision: 0
      })
    ).toBe('$1234.5')
  })

  it('applies fixed precision via toFixed when no formatter is given', () => {
    expect(formatInputNumberDisplay(1.236, { precision: 2 })).toBe('1.24')
    expect(formatInputNumberDisplay(3, { precision: 1 })).toBe('3.0')
  })

  it('falls back to plain String when no formatter or precision', () => {
    expect(formatInputNumberDisplay(42)).toBe('42')
    expect(formatInputNumberDisplay(0)).toBe('0')
    expect(formatInputNumberDisplay(-7.5)).toBe('-7.5')
  })
})

describe('parseInputNumberInput', () => {
  it('treats empty string and a lone minus as null (in-progress input)', () => {
    expect(parseInputNumberInput('')).toBeNull()
    expect(parseInputNumberInput('-')).toBeNull()
  })

  it('prefers a custom parser', () => {
    expect(parseInputNumberInput('$1,000', { parser: (s) => Number(s.replace(/[$,]/g, '')) })).toBe(
      1000
    )
  })

  it('parses numbers via Number() by default', () => {
    expect(parseInputNumberInput('42')).toBe(42)
    expect(parseInputNumberInput('-7.5')).toBe(-7.5)
    expect(parseInputNumberInput('0')).toBe(0)
  })

  it('returns null for unparseable input', () => {
    expect(parseInputNumberInput('abc')).toBeNull()
  })
})
