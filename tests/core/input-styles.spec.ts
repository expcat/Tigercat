import { describe, expect, it } from 'vitest'
import {
  formatInputCountText,
  getInputChromeClasses,
  getInputClasses,
  getInputClearButtonClasses,
  getInputErrorClasses,
  getInputFieldClasses,
  getInputPasswordToggleClasses,
  getInputWrapperClasses,
  resolveInputTrailingLayout,
  resolveReadOnlyFlag
} from '@expcat/tigercat-core'

const tokens = (cls: string): string[] => cls.split(/\s+/)

describe('resolveInputTrailingLayout', () => {
  it('does not reserve a slot until a trailing node is actually shown', () => {
    const empty = resolveInputTrailingLayout({
      clearable: true,
      showPassword: true,
      type: 'password',
      valueLength: 0
    })
    expect(empty.showClear).toBe(false)
    expect(empty.showPasswordToggle).toBe(true)
    expect(empty.hasDualSuffix).toBe(false)

    const both = resolveInputTrailingLayout({
      clearable: true,
      showPassword: true,
      type: 'password',
      valueLength: 3
    })
    expect(both.showClear).toBe(true)
    expect(both.showPasswordToggle).toBe(true)
    expect(both.hasDualSuffix).toBe(true)
    expect(both.clearOffsetSlots).toBe(1)
  })

  it('keeps a custom suffix beside trailing actions', () => {
    const layout = resolveInputTrailingLayout({
      clearable: true,
      showPassword: true,
      type: 'password',
      valueLength: 2,
      hasCustomSuffix: true
    })
    expect(layout.showCustomSuffix).toBe(true)
    expect(layout.hasTripleSuffix).toBe(true)
    expect(layout.suffixOffsetSlots).toBe(2)
  })
})

describe('resolveReadOnlyFlag', () => {
  it('treats readonly and readOnly as the same flag', () => {
    expect(resolveReadOnlyFlag(undefined, true)).toBe(true)
    expect(resolveReadOnlyFlag(true, undefined)).toBe(true)
    expect(resolveReadOnlyFlag(undefined, undefined)).toBe(false)
  })
})

describe('input-styles trailing buttons', () => {
  it('keeps a single trailing button on the inline end', () => {
    expect(tokens(getInputClearButtonClasses())).toContain('end-0')
    expect(tokens(getInputClearButtonClasses('md'))).not.toContain('end-10')
    expect(tokens(getInputPasswordToggleClasses('md'))).toContain('end-0')
    expect(tokens(getInputClearButtonClasses())).not.toContain('right-0')
  })

  it('offsets the clear button one affix slot when requested', () => {
    expect(tokens(getInputClearButtonClasses('sm', { offsetSlots: 1 }))).toContain('end-8')
    expect(tokens(getInputClearButtonClasses('md', { offsetSlots: 1 }))).toContain('end-10')
    expect(tokens(getInputClearButtonClasses('lg', { offsetSlots: 1 }))).toContain('end-12')
    expect(tokens(getInputClearButtonClasses('md', { offsetSlots: 1 }))).not.toContain('end-0')
  })

  it('uses logical end padding and doubles it for two trailing slots', () => {
    expect(tokens(getInputClasses({ hasSuffix: true }))).toContain('pe-10')
    expect(tokens(getInputClasses({ hasSuffix: true }))).not.toContain('pe-20')
    expect(tokens(getInputClasses({ hasSuffix: true, hasDualSuffix: true }))).toContain('pe-20')
    expect(tokens(getInputClasses({ hasSuffix: true, hasDualSuffix: true }))).not.toContain('pe-10')
    expect(tokens(getInputClasses({ size: 'sm', hasDualSuffix: true }))).toContain('pe-16')
    expect(tokens(getInputClasses({ size: 'lg', hasDualSuffix: true }))).toContain('pe-24')
  })
})

describe('input-styles chrome vs field', () => {
  it('puts border and radius on wrapper chrome, not the field', () => {
    const wrapper = getInputWrapperClasses('default')
    const field = getInputFieldClasses()
    const chrome = getInputChromeClasses('error')

    expect(wrapper).toContain('border')
    expect(wrapper).toContain('rounded-[var(--tiger-radius-md')
    expect(chrome).toContain('--tiger-error')
    expect(field).not.toContain('rounded-[var(--tiger-radius-md')
    expect(field).not.toContain('border-[var(--tiger-error')
    expect(getInputWrapperClasses()).toBe('relative w-full')
  })

  it('uses flex-1 in a group instead of filling the group width', () => {
    expect(getInputWrapperClasses('default', { inGroup: true })).toContain('flex-1')
    expect(getInputWrapperClasses('default', { inGroup: true })).toContain('min-w-0')
    expect(getInputWrapperClasses('default', { inGroup: true })).not.toContain('w-full')
  })

  it('keeps dual-suffix padding on the field helper', () => {
    expect(tokens(getInputFieldClasses({ hasSuffix: true, hasDualSuffix: true }))).toContain(
      'pe-20'
    )
    expect(tokens(getInputFieldClasses({ hasSuffix: true }))).toContain('pe-10')
  })
})

describe('input-styles error message', () => {
  it('places error copy below the field, not as an in-field overlay', () => {
    const cls = getInputErrorClasses()
    expect(cls).toContain('--tiger-error')
    expect(cls).toContain('mt-1')
    expect(cls).not.toContain('inset-y-0')
    expect(tokens(cls)).not.toContain('absolute')
    expect(formatInputCountText(3, 10)).toBe('3 / 10')
    expect(formatInputCountText(3)).toBe('3')
  })
})
