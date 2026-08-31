import { describe, expect, it } from 'vitest'
import {
  applyNumberKeyboardInput,
  applyNumberKeyboardKey,
  deleteNumberKeyboardValue,
  getNumberKeyboardAction,
  getNumberKeyboardKeyClasses,
  getNumberKeyboardKeys,
  getNumberKeyboardMaxLength,
  getNumberKeyboardPrecision,
  moveNumberKeyboardIndex,
  normalizeNumberKeyboardValue,
  postNumberKeyboardValue,
  resolveNumberKeyboardPhysicalKey
} from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'

const labels = {
  deleteText: enUS.numberKeyboard!.deleteText!,
  confirmText: enUS.common!.okText!,
  decimalAriaLabel: enUS.numberKeyboard!.decimalAriaLabel!,
  idCardXAriaLabel: enUS.numberKeyboard!.idCardXAriaLabel!
}

describe('number-keyboard-utils', () => {
  it('normalizes empty values to an empty string', () => {
    expect(normalizeNumberKeyboardValue(undefined)).toBe('')
    expect(normalizeNumberKeyboardValue(null)).toBe('')
    expect(normalizeNumberKeyboardValue(123)).toBe('123')
  })

  it('uppercases id-card values', () => {
    expect(postNumberKeyboardValue('110101x', 'id-card')).toBe('110101X')
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

  it('appends digits in number mode and keeps leading zeros', () => {
    expect(applyNumberKeyboardInput('12', '3')).toBe('123')
    expect(applyNumberKeyboardInput('12', 'x')).toBe('12')
    expect(applyNumberKeyboardInput('00', '1')).toBe('001')
  })

  it('respects maxLength in number mode', () => {
    expect(applyNumberKeyboardInput('12', '3', { maxLength: 2 })).toBe('12')
  })

  it('formats amount mode with a single decimal separator', () => {
    expect(applyNumberKeyboardInput('', '.', { mode: 'amount' })).toBe('0.')
    expect(applyNumberKeyboardInput('12.', '.', { mode: 'amount' })).toBe('12.')
    expect(applyNumberKeyboardInput('12.', '3', { mode: 'amount' })).toBe('12.3')
  })

  it('does not treat "." as decimal when the separator is ","', () => {
    expect(applyNumberKeyboardInput('12', '.', { mode: 'amount', decimalSeparator: ',' })).toBe(
      '12'
    )
    expect(applyNumberKeyboardInput('12', ',', { mode: 'amount', decimalSeparator: ',' })).toBe(
      '12,'
    )
  })

  it('does not leave a trailing separator when precision is 0', () => {
    expect(applyNumberKeyboardInput('12', '.', { mode: 'amount', precision: 0 })).toBe('12')
  })

  it('limits amount precision', () => {
    expect(applyNumberKeyboardInput('12.34', '5', { mode: 'amount' })).toBe('12.34')
    expect(applyNumberKeyboardInput('12.34', '5', { mode: 'amount', precision: 3 })).toBe('12.345')
  })

  it('normalizes leading zeroes in amount mode', () => {
    expect(applyNumberKeyboardInput('0', '8', { mode: 'amount' })).toBe('8')
    expect(applyNumberKeyboardInput('0', '0', { mode: 'amount' })).toBe('0')
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

  it('does not append after a lowercase x already in the value', () => {
    expect(applyNumberKeyboardInput('12345678901234567x', '1', { mode: 'id-card' })).toBe(
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

  it('builds mode-specific key layouts from labels', () => {
    expect(getNumberKeyboardKeys({ mode: 'amount', labels }).map((key) => key.value)).toContain('.')
    expect(getNumberKeyboardKeys({ mode: 'id-card', labels }).map((key) => key.value)).toContain(
      'X'
    )
    expect(
      getNumberKeyboardKeys({ showConfirm: false, labels }).some((key) => key.type === 'confirm')
    ).toBe(false)
    expect(
      getNumberKeyboardKeys({ mode: 'phone', labels }).find((key) => key.type === 'empty')
        ?.ariaLabel
    ).toBe('')
  })

  it('uses locale labels for delete and confirm', () => {
    const keys = getNumberKeyboardKeys({
      labels: { ...labels, deleteText: 'Back', confirmText: 'OK' }
    })
    expect(keys.find((key) => key.type === 'delete')?.label).toBe('Back')
    expect(keys.find((key) => key.type === 'confirm')?.label).toBe('OK')
  })

  it('resolves confirm classes without the regular key fill', () => {
    const confirm = getNumberKeyboardKeys({ labels }).find((key) => key.type === 'confirm')!
    const digit = getNumberKeyboardKeys({ labels }).find((key) => key.type === 'digit')!
    expect(getNumberKeyboardAction(confirm)).toBe('confirm')
    expect(getNumberKeyboardKeyClasses(confirm)).toContain('bg-[var(--tiger-primary')
    expect(getNumberKeyboardKeyClasses(confirm)).not.toContain('bg-[var(--tiger-fill')
    expect(getNumberKeyboardKeyClasses(digit)).toContain('bg-[var(--tiger-fill')
    expect(getNumberKeyboardKeyClasses(digit)).not.toContain('bg-[var(--tiger-primary')
  })

  it('applies a key in one step', () => {
    expect(applyNumberKeyboardKey('1', { type: 'digit', value: '2' }).nextValue).toBe('12')
    expect(applyNumberKeyboardKey('12', { type: 'delete', value: 'delete' })).toMatchObject({
      nextValue: '1',
      action: 'delete',
      changed: true
    })
    expect(applyNumberKeyboardKey('12', { type: 'confirm', value: 'confirm' })).toMatchObject({
      nextValue: '12',
      action: 'confirm',
      changed: false
    })
  })

  it('maps physical keys including Enter and ignores the other decimal glyph', () => {
    expect(resolveNumberKeyboardPhysicalKey('5')).toEqual({ type: 'digit', value: '5' })
    expect(resolveNumberKeyboardPhysicalKey('Enter')).toEqual({
      type: 'confirm',
      value: 'confirm'
    })
    expect(
      resolveNumberKeyboardPhysicalKey('.', { mode: 'amount', decimalSeparator: ',' })
    ).toBeNull()
    expect(
      resolveNumberKeyboardPhysicalKey(',', { mode: 'amount', decimalSeparator: ',' })
    ).toEqual({ type: 'decimal', value: ',' })
    expect(resolveNumberKeyboardPhysicalKey('x', { mode: 'id-card' })).toEqual({
      type: 'id-card-x',
      value: 'X'
    })
  })

  it('moves the roving index through the 3-column grid and skips empty', () => {
    const keys = getNumberKeyboardKeys({ mode: 'phone', labels })
    const fromZero = keys.findIndex((key) => key.value === '0')
    const up = moveNumberKeyboardIndex(keys, fromZero, 'ArrowUp')
    expect(keys[up].value).toBe('8')
    const empty = keys.findIndex((key) => key.type === 'empty')
    expect(moveNumberKeyboardIndex(keys, empty < 0 ? 0 : empty, 'ArrowRight')).not.toBe(empty)
  })
})
