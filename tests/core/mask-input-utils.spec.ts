import { describe, expect, it } from 'vitest'
import {
  applyMaskInput,
  countMaskTokens,
  DEFAULT_MASK_TOKENS,
  extractRawValue,
  formatMaskValue,
  getMaskCaretPosition,
  parseMask
} from '@expcat/tigercat-core'

const DATE_SPEC = parseMask('##/##/####')
const PHONE_SPEC = parseMask('(###) ###-####')

describe('mask-input-utils', () => {
  describe('parseMask', () => {
    it('maps built-in tokens and fixed literals', () => {
      const spec = parseMask('#a*-')
      expect(spec).toHaveLength(4)
      expect(spec[0].kind).toBe('token')
      expect(spec[1].kind).toBe('token')
      expect(spec[2].kind).toBe('token')
      expect(spec[3]).toEqual({ kind: 'fixed', char: '-' })
    })

    it('escapes the next character with !', () => {
      const spec = parseMask('!##')
      expect(spec).toEqual([
        { kind: 'fixed', char: '#' },
        { kind: 'token', token: DEFAULT_MASK_TOKENS['#'] }
      ])
    })

    it('ignores a dangling escape and counts tokens', () => {
      expect(parseMask('##!')).toHaveLength(2)
      expect(countMaskTokens(DATE_SPEC)).toBe(8)
      expect(countMaskTokens(PHONE_SPEC)).toBe(10)
    })

    it('merges custom tokens over built-ins', () => {
      const spec = parseMask('X#', { X: { pattern: /[xy]/ } })
      expect(spec[0].kind).toBe('token')
      expect(formatMaskValue('x1', spec).maskedValue).toBe('x1')
    })
  })

  describe('formatMaskValue', () => {
    it('formats and eagerly appends fixed characters', () => {
      expect(formatMaskValue('12', DATE_SPEC).maskedValue).toBe('12/')
      expect(formatMaskValue('1234', DATE_SPEC).maskedValue).toBe('12/34/')
      expect(formatMaskValue('12345678', DATE_SPEC)).toEqual({
        rawValue: '12345678',
        maskedValue: '12/34/5678',
        completed: true
      })
    })

    it('never renders a bare fixed prefix for an empty value', () => {
      expect(formatMaskValue('', PHONE_SPEC).maskedValue).toBe('')
      expect(formatMaskValue('5', PHONE_SPEC).maskedValue).toBe('(5')
    })

    it('drops invalid characters and truncates overflow', () => {
      expect(formatMaskValue('1a2b3c4d5e6f7g8h9', DATE_SPEC).rawValue).toBe('12345678')
      expect(formatMaskValue('123456789', DATE_SPEC).rawValue).toBe('12345678')
    })

    it('applies token transforms', () => {
      const plateSpec = parseMask('AA-###', {
        A: { pattern: /[A-Z]/, transform: (char) => char.toUpperCase() }
      })
      expect(formatMaskValue('ab123', plateSpec)).toEqual({
        rawValue: 'AB123',
        maskedValue: 'AB-123',
        completed: true
      })
    })

    it('reports completion only when every token slot is filled', () => {
      expect(formatMaskValue('1234567', DATE_SPEC).completed).toBe(false)
      expect(formatMaskValue('12345678', DATE_SPEC).completed).toBe(true)
      expect(formatMaskValue('x', parseMask('--')).completed).toBe(false)
    })
  })

  describe('extractRawValue', () => {
    it('recovers the raw value from a clean masked string', () => {
      expect(extractRawValue('12/34/5678', DATE_SPEC)).toBe('12345678')
      expect(extractRawValue('(555) 123-4567', PHONE_SPEC)).toBe('5551234567')
    })

    it('recovers from dirty input with foreign separators', () => {
      expect(extractRawValue('555.123.4567', PHONE_SPEC)).toBe('5551234567')
      expect(extractRawValue('12-34-5678', DATE_SPEC)).toBe('12345678')
    })

    it('limits extraction for caret mapping', () => {
      expect(extractRawValue('12/34', DATE_SPEC, 3)).toBe('12')
      expect(extractRawValue('12/34', DATE_SPEC, 4)).toBe('123')
    })
  })

  describe('getMaskCaretPosition', () => {
    it.each([
      [0, 0],
      [1, 1],
      [2, 3], // after '12' the eager '/' is included
      [3, 4],
      [4, 6],
      [8, 10]
    ])('raw index %i maps to masked position %i (date mask)', (rawIndex, expected) => {
      expect(getMaskCaretPosition(DATE_SPEC, rawIndex)).toBe(expected)
    })

    it('includes the leading fixed prefix once a character is placed', () => {
      // '(###) ###-####': first raw char sits after '(' at masked index 2
      expect(getMaskCaretPosition(PHONE_SPEC, 1)).toBe(2)
      expect(getMaskCaretPosition(PHONE_SPEC, 3)).toBe(6) // after '(555) '
    })
  })

  describe('applyMaskInput', () => {
    it('handles appending keystrokes', () => {
      expect(applyMaskInput('12', 2, DATE_SPEC, '1')).toEqual({
        rawValue: '12',
        maskedValue: '12/',
        caret: 3,
        completed: false
      })
    })

    it('handles mid-string insertion with right shift', () => {
      // display '12/34/' with caret after '1', typing '9' -> '192/34/'
      const result = applyMaskInput('192/34/', 2, DATE_SPEC, '12/34/')
      expect(result.rawValue).toBe('19234')
      expect(result.maskedValue).toBe('19/23/4')
      expect(result.caret).toBe(3)
    })

    it('handles pasting a dirty string over everything', () => {
      const result = applyMaskInput('555.123.4567', 12, PHONE_SPEC)
      expect(result.maskedValue).toBe('(555) 123-4567')
      expect(result.completed).toBe(true)
      expect(result.caret).toBe(14)
    })

    it('deletes through a trailing fixed character instead of bouncing back', () => {
      // '12/' -> Backspace gives '12'; the raw '2' must go too
      expect(applyMaskInput('12', 2, DATE_SPEC, '12/')).toEqual({
        rawValue: '1',
        maskedValue: '1',
        caret: 1,
        completed: false
      })
    })

    it('deletes the raw character before the caret when a mid-string fixed char is removed', () => {
      // display '12/34/' with caret after the first '/', Backspace -> '1234/'
      const result = applyMaskInput('1234/', 2, DATE_SPEC, '12/34/')
      expect(result.rawValue).toBe('134')
      expect(result.maskedValue).toBe('13/4')
      expect(result.caret).toBe(1)
    })

    it('handles plain character deletion without the fixed-char special case', () => {
      // display '12/34/' -> select the '3' and delete -> '12/4/'
      const result = applyMaskInput('12/4/', 3, DATE_SPEC, '12/34/')
      expect(result.rawValue).toBe('124')
      expect(result.maskedValue).toBe('12/4')
      expect(result.caret).toBe(3)
    })

    it('handles clearing the whole value', () => {
      expect(applyMaskInput('', 0, DATE_SPEC, '12/34')).toEqual({
        rawValue: '',
        maskedValue: '',
        caret: 0,
        completed: false
      })
    })
  })
})
