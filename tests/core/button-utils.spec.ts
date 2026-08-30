import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  buttonBaseClasses,
  buttonDangerClasses,
  getButtonVariantClasses,
  resolveButtonClasses,
  resolveButtonHtmlType,
  resolveButtonIconPlacement,
  resetDevWarnCache
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

describe('resolveButtonHtmlType', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetDevWarnCache()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('uses htmlType, then native type, then button', () => {
    expect(resolveButtonHtmlType('submit')).toBe('submit')
    expect(resolveButtonHtmlType(undefined, 'reset')).toBe('reset')
    expect(resolveButtonHtmlType(undefined, undefined)).toBe('button')
  })

  it('lets htmlType win and warns when the two differ', () => {
    expect(resolveButtonHtmlType('submit', 'reset')).toBe('submit')
    expect(warnSpy).toHaveBeenCalledWith(
      '[Tigercat] Button htmlType and type differ; htmlType wins.'
    )
  })
})

describe('resolveButtonIconPlacement', () => {
  it('maps left/right aliases onto start/end', () => {
    expect(resolveButtonIconPlacement()).toBe('start')
    expect(resolveButtonIconPlacement('left')).toBe('start')
    expect(resolveButtonIconPlacement('start')).toBe('start')
    expect(resolveButtonIconPlacement('right')).toBe('end')
    expect(resolveButtonIconPlacement('end')).toBe('end')
  })
})
