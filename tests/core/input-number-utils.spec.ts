import { describe, it, expect } from 'vitest'
import {
  addDecimalString,
  commitInputNumberModel,
  commitInputNumberValue,
  formatInputNumberDisplay,
  formatInputNumberEditingDisplay,
  getInputNumberInputClasses,
  getInputNumberKeyboardNextValue,
  inputNumberControlsRightClasses,
  parseInputNumberValue,
  stepInputNumberModel,
  stepValue
} from '@expcat/tigercat-core'

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

  describe('formatInputNumberEditingDisplay', () => {
    it('never applies a formatter', () => {
      expect(formatInputNumberEditingDisplay(1000, undefined)).toBe('1000')
      expect(formatInputNumberEditingDisplay(1.5, 2)).toBe('1.50')
      expect(formatInputNumberEditingDisplay(null)).toBe('')
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

    it('treats parser NaN as null', () => {
      expect(parseInputNumberValue('x', { parser: () => Number.NaN })).toBeNull()
    })

    it('prefers a custom parser', () => {
      const parser = (input: string) => Number(input.replace(/[^0-9.-]/g, ''))
      expect(parseInputNumberValue('$1,200', { parser })).toBe(1200)
    })
  })

  describe('stepValue', () => {
    it('adds decimal steps without binary residue', () => {
      expect(stepValue(0.1, 0.1, 'up')).toBe(0.2)
      expect(stepValue(0.1, 0.2, 'up')).toBe(0.3)
      expect(stepValue(1.1, 0.1, 'up')).toBe(1.2)
    })

    it('clamps to min/max', () => {
      expect(stepValue(10, 1, 'up', 0, 10)).toBe(10)
      expect(stepValue(0, 1, 'down', 0, 10)).toBe(0)
    })
  })

  describe('commitInputNumberValue', () => {
    it('does not mark unchanged boundary steps as changed', () => {
      expect(commitInputNumberValue(5, 5, { min: 0, max: 5 })).toEqual({
        value: 5,
        changed: false
      })
    })

    it('collapses non-finite values to null', () => {
      expect(commitInputNumberValue(Number.NaN, 1)).toEqual({ value: null, changed: true })
    })
  })

  describe('getInputNumberKeyboardNextValue', () => {
    it('moves Home/End to finite bounds', () => {
      expect(getInputNumberKeyboardNextValue('Home', 4, { min: 0, max: 10, step: 1 })).toBe(0)
      expect(getInputNumberKeyboardNextValue('End', 4, { min: 0, max: 10, step: 1 })).toBe(10)
    })

    it('ignores Home/End when bounds are infinite', () => {
      expect(getInputNumberKeyboardNextValue('Home', 4, { step: 1 })).toBeUndefined()
      expect(getInputNumberKeyboardNextValue('End', 4, { step: 1 })).toBeUndefined()
    })
  })

  describe('string model contracts', () => {
    it('applies the same clamp, snap and precision contract as the number path', () => {
      expect(commitInputNumberModel('9007199254740993', null, { max: 100 }).value).toBe(100)
      expect(commitInputNumberModel('-9007199254740993', null, { min: -100.5 }).value).toBe(-100.5)
      expect(commitInputNumberModel('9.999', null, { max: 1.5, precision: 2 }).value).toBe('1.50')
      expect(
        commitInputNumberModel('9007199254740993', null, { max: 94, step: 10, snapToStep: true })
          .value
      ).toBe(commitInputNumberValue(100, null, { max: 94, step: 10, snapToStep: true }).value)
      expect(
        commitInputNumberModel('9007199254740993', null, { snapToStep: true, step: 10 }).value
      ).toBe('9007199254740990')
      expect(
        commitInputNumberModel('9007199254740993.93', null, { snapToStep: true, step: 0.1 }).value
      ).toBe('9007199254740993.90')
    })

    it('steps exact decimal strings including scientific-notation deltas', () => {
      expect(addDecimalString('9007199254740993', 1e-7)).toBe('9007199254740993.0000001')
      expect(addDecimalString('9007199254740993', 1e21)).toBe('1000009007199254740993')
      expect(stepInputNumberModel('9007199254740993', 1, 'up')).toBe('9007199254740994')
      expect(stepInputNumberModel('9007199254740993', 1, 'up', -Infinity, 100)).toBe(100)
      expect(stepInputNumberModel('1.25', 0.1, 'up', -Infinity, 1.2, 2)).toBe('1.20')
      expect(getInputNumberKeyboardNextValue('ArrowUp', '9007199254740993')).toBe(
        '9007199254740994'
      )
      expect(getInputNumberKeyboardNextValue('PageUp', '9007199254740993')).toBe('9007199254741003')
    })
  })

  describe('getInputNumberInputClasses', () => {
    it('uses one padding set for end controls, not stacked px and pe', () => {
      const classes = getInputNumberInputClasses('md', 'end')
      expect(classes).toContain('pe-8')
      expect(classes).toContain('ps-3')
      expect(classes).not.toContain('px-3')
    })

    it('pins end controls with a Tailwind v4 inset and a fixed column width', () => {
      expect(inputNumberControlsRightClasses).toContain('end-0')
      expect(inputNumberControlsRightClasses).toContain('w-7')
      expect(inputNumberControlsRightClasses).not.toContain('inset-inline-end')
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
