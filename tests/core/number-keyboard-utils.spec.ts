import { describe, expect, it } from 'vitest'
import {
  applyNumberKeyboardInput,
  deleteNumberKeyboardValue,
  getNumberKeyboardAction,
  getNumberKeyboardKeyClasses,
  getNumberKeyboardKeys,
  getNumberKeyboardMaxLength,
  getNumberKeyboardPrecision,
  normalizeNumberKeyboardValue
} from '@expcat/tigercat-core'

describe('number-keyboard-utils', () => {
  it('normalizes empty values to an empty string', () => {
    expect(normalizeNumberKeyboardValue(undefined)).toBe('')
    expect(normalizeNumberKeyboardValue(null)).toBe('')
    expect(normalizeNumberKeyboardValue(123)).toBe('123')
  })

  it('uses mode-specific max lengths', () => {
    expect(getNumberKeyboardMaxLength('phone')).toBe(11)
    expect(getNumberKeyboardMaxLength('id-card')).toBe(18)
    expect(getNumberKeyboardMaxLength('number')).toBe(Infinity)
    expect(getNumberKeyboardMaxLength('phone', 6)).toBe(6)
  })

  it('uses amount precision defaults', () => {
    expect(getNumberKeyboardPrecision('amount')).toBe(2)
    expect(getNumberKeyboardPrecision('amount', 4)).toBe(4)
    expect(getNumberKeyboardPrecision('number')).toBeUndefined()
  })

  it('appends digits in number mode', () => {
    expect(applyNumberKeyboardInput('12', '3')).toBe('123')
    expect(applyNumberKeyboardInput('12', 'x')).toBe('12')
  })

  it('respects maxLength in number mode', () => {
    expect(applyNumberKeyboardInput('12', '3', { maxLength: 2 })).toBe('12')
  })

  it('formats amount mode with a single decimal separator', () => {
    expect(applyNumberKeyboardInput('', '.', { mode: 'amount' })).toBe('0.')
    expect(applyNumberKeyboardInput('12.', '.', { mode: 'amount' })).toBe('12.')
    expect(applyNumberKeyboardInput('12.', '3', { mode: 'amount' })).toBe('12.3')
  })

  it('limits amount precision', () => {
    expect(applyNumberKeyboardInput('12.34', '5', { mode: 'amount' })).toBe('12.34')
    expect(applyNumberKeyboardInput('12.34', '5', { mode: 'amount', precision: 3 })).toBe('12.345')
  })

  it('normalizes leading zeroes in amount mode', () => {
    expect(applyNumberKeyboardInput('0', '8', { mode: 'amount' })).toBe('8')
    expect(applyNumberKeyboardInput('0', '0', { mode: 'amount' })).toBe('0')
  })

  it('uses custom decimal separators in amount mode', () => {
    expect(applyNumberKeyboardInput('12', ',', { mode: 'amount', decimalSeparator: ',' })).toBe(
      '12,'
    )
  })

  it('limits phone mode to 11 digits by default', () => {
    expect(applyNumberKeyboardInput('13800138000', '1', { mode: 'phone' })).toBe('13800138000')
  })

  it('allows only X in the final id-card position', () => {
    expect(applyNumberKeyboardInput('123', 'X', { mode: 'id-card' })).toBe('123')
    expect(applyNumberKeyboardInput('12345678901234567', 'x', { mode: 'id-card' })).toBe(
      '12345678901234567X'
    )
  })

  it('prevents input after id-card X', () => {
    expect(applyNumberKeyboardInput('12345678901234567X', '1', { mode: 'id-card' })).toBe(
      '12345678901234567X'
    )
  })

  it('deletes the last character', () => {
    expect(deleteNumberKeyboardValue('123')).toBe('12')
    expect(deleteNumberKeyboardValue('')).toBe('')
  })

  it('builds mode-specific key layouts', () => {
    expect(getNumberKeyboardKeys({ mode: 'amount' }).map((key) => key.value)).toContain('.')
    expect(getNumberKeyboardKeys({ mode: 'id-card' }).map((key) => key.value)).toContain('X')
    expect(
      getNumberKeyboardKeys({ showConfirm: false }).some((key) => key.type === 'confirm')
    ).toBe(false)
  })

  it('uses custom delete and confirm labels', () => {
    const keys = getNumberKeyboardKeys({ deleteText: 'Back', confirmText: 'OK' })
    expect(keys.find((key) => key.type === 'delete')?.label).toBe('Back')
    expect(keys.find((key) => key.type === 'confirm')?.label).toBe('OK')
  })

  it('derives actions and classes for special keys', () => {
    const confirm = getNumberKeyboardKeys().find((key) => key.type === 'confirm')!
    const empty = getNumberKeyboardKeys({ mode: 'phone' }).find((key) => key.type === 'empty')!
    expect(getNumberKeyboardAction(confirm)).toBe('confirm')
    expect(getNumberKeyboardKeyClasses(confirm)).toContain('col-span-3')
    expect(getNumberKeyboardKeyClasses(empty)).toContain('opacity-0')
  })
})
