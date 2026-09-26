import { describe, expect, it } from 'vitest'
import {
  buttonBaseClasses,
  buttonDangerClasses,
  getButtonIconSlotClasses,
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

describe('icon-only buttons', () => {
  it('uses a square box and clears text padding', () => {
    const classes = resolveButtonClasses({ size: 'sm', iconOnly: true, className: 'px-2' })
    expect(classes).toContain('h-8')
    expect(classes).toContain('w-8')
    expect(classes).toContain('!p-0')
    expect(classes).toContain('items-center')
    expect(classes).toContain('justify-center')
  })

  it('keeps text padding when the button has a label', () => {
    const classes = resolveButtonClasses({ size: 'sm' })
    expect(classes).not.toContain('!p-0')
    expect(classes).not.toMatch(/(?:^|\s)w-8(?:\s|$)/)
    expect(classes).toContain('px-3')
    expect(classes).toContain('py-1.5')
  })

  it('stays full width when an icon-only button is also block', () => {
    const classes = resolveButtonClasses({ size: 'sm', iconOnly: true, block: true })
    expect(classes).toContain('h-8')
    expect(classes).toContain('!p-0')
    expect(classes).toContain('w-full')
    expect(classes).not.toMatch(/(?:^|\s)w-8(?:\s|$)/)
  })

  it('centers the icon slot when there is no label', () => {
    expect(getButtonIconSlotClasses('start', false)).toContain('items-center')
    expect(getButtonIconSlotClasses('start', false)).toContain('justify-center')
    expect(getButtonIconSlotClasses('end', true)).toBe('ms-2')
    expect(getButtonIconSlotClasses('start', true)).toBe('me-2')
  })
})

describe('resolveButtonIconPlacement', () => {
  it('uses start unless the icon sits at the end', () => {
    expect(resolveButtonIconPlacement()).toBe('start')
    expect(resolveButtonIconPlacement('start')).toBe('start')
    expect(resolveButtonIconPlacement('end')).toBe('end')
  })
})
