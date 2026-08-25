import { describe, it, expect } from 'vitest'
import {
  floatButtonBaseClasses,
  floatButtonShapeClasses,
  floatButtonSizeClasses,
  floatButtonTypeClasses,
  floatButtonDisabledClasses,
  floatButtonGroupClasses,
  floatButtonIconSizeClasses,
  floatButtonPlusIconPath,
  getFloatButtonGroupClasses
} from '@expcat/tigercat-core'

describe('float-button-utils', () => {
  it('base classes include focus ring', () => {
    expect(floatButtonBaseClasses).toContain('focus:ring')
  })

  it('shape classes cover circle and square', () => {
    expect(floatButtonShapeClasses.circle).toContain('rounded-full')
    expect(floatButtonShapeClasses.square).toContain('rounded')
  })

  it('size classes cover sm, md, lg with increasing dimensions', () => {
    expect(floatButtonSizeClasses.sm).toContain('h-10')
    expect(floatButtonSizeClasses.md).toContain('h-12')
    expect(floatButtonSizeClasses.lg).toContain('h-14')
  })

  it('type classes cover primary and default', () => {
    expect(floatButtonTypeClasses.primary).toContain('bg-')
    expect(floatButtonTypeClasses.default).toContain('border')
  })

  it('disabled classes include opacity and pointer-events-none', () => {
    expect(floatButtonDisabledClasses).toContain('opacity-50')
    expect(floatButtonDisabledClasses).toContain('pointer-events-none')
  })

  it('group stack chrome does not hardcode a viewport corner', () => {
    expect(floatButtonGroupClasses).toContain('flex')
    expect(floatButtonGroupClasses).toContain('flex-col-reverse')
    expect(floatButtonGroupClasses).toContain('gap')
    expect(floatButtonGroupClasses).not.toContain('fixed')
    expect(floatButtonGroupClasses).not.toContain('right-6')
    expect(floatButtonGroupClasses).not.toContain('bottom-6')
  })

  it('portal-on group classes are fixed to a corner', () => {
    const classes = getFloatButtonGroupClasses({ placement: 'bottom-right', portal: true })
    expect(classes).toContain('fixed')
    expect(classes).toContain('bottom-0')
    expect(classes).toContain('right-0')
    expect(classes).not.toContain('absolute')
  })

  it('portal-off group classes are absolute to a corner', () => {
    const classes = getFloatButtonGroupClasses({ placement: 'bottom-left', portal: false })
    expect(classes).toContain('absolute')
    expect(classes).toContain('bottom-0')
    expect(classes).toContain('left-0')
    expect(classes).not.toContain('fixed')
  })

  it('plus icon path is a non-empty M path', () => {
    expect(floatButtonPlusIconPath.startsWith('M')).toBe(true)
    expect(floatButtonPlusIconPath.length).toBeGreaterThan(1)
  })

  it('icon size classes match button sizes', () => {
    expect(Object.keys(floatButtonIconSizeClasses)).toEqual(['sm', 'md', 'lg'])
    expect(floatButtonIconSizeClasses.sm).toContain('h-4')
    expect(floatButtonIconSizeClasses.md).toContain('h-5')
    expect(floatButtonIconSizeClasses.lg).toContain('h-6')
  })
})
