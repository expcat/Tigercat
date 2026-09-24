import { describe, expect, it } from 'vitest'
import {
  buttonBaseClasses,
  buttonDangerClasses,
  getButtonVariantClasses,
  resolveButtonClasses,
  resolveButtonType,
  resolveButtonIconPlacement
} from '@expcat/tigercat-core'

describe('resolveButtonClasses', () => {
  it('falls back to primary for an unknown variant and does not throw', () => {
    expect(resolveButtonClasses({ variant: 'not-a-variant' })).toBe(
      resolveButtonClasses({ variant: 'primary' })
    )
    expect(() => getButtonVariantClasses('not-a-variant')).not.toThrow()
    expect(getButtonVariantClasses('not-a-variant')).toBe(getButtonVariantClasses('primary'))
  })

  it('uses on-color tokens for solid primary text', () => {
    const classes = resolveButtonClasses({ variant: 'primary' })
    expect(classes).toContain('--tiger-primary-foreground')
    expect(classes).not.toContain('text-white')
  })

  it('keeps keyboard rings on focus-visible, not focus', () => {
    expect(buttonBaseClasses).toContain('focus-visible:ring-2')
    expect(buttonBaseClasses).not.toMatch(/(?:^|\s)focus:ring-/)
    expect(getButtonVariantClasses('primary')).not.toMatch(/(?:^|\s)focus:ring-/)
    expect(buttonDangerClasses.primary).toContain('focus-visible:ring-[var(--tiger-error')
    expect(buttonDangerClasses.primary).not.toMatch(/(?:^|\s)focus:ring-/)
    expect(buttonDangerClasses.primary).toBe(buttonDangerClasses.secondary)
  })

  it('applies danger skin instead of the variant fill', () => {
    const classes = resolveButtonClasses({ variant: 'outline', danger: true })
    expect(classes).toContain('--tiger-error')
    expect(classes).toContain('border-2')
    expect(classes).not.toContain('--tiger-primary-foreground')
  })
})

describe('resolveButtonType', () => {
  it('accepts native button types and falls back to button', () => {
    expect(resolveButtonType('submit')).toBe('submit')
    expect(resolveButtonType('reset')).toBe('reset')
    expect(resolveButtonType(undefined)).toBe('button')
    expect(resolveButtonType('nope')).toBe('button')
  })
})

describe('resolveButtonIconPlacement', () => {
  it('uses start unless the icon sits at the end', () => {
    expect(resolveButtonIconPlacement()).toBe('start')
    expect(resolveButtonIconPlacement('start')).toBe('start')
    expect(resolveButtonIconPlacement('end')).toBe('end')
  })
})
