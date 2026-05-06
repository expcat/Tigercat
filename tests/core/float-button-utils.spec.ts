import { describe, it, expect } from 'vitest'
import {
  floatButtonBaseClasses,
  floatButtonShapeClasses,
  floatButtonSizeClasses,
  floatButtonTypeClasses,
  floatButtonDisabledClasses,
  floatButtonGroupClasses,
  floatButtonIconSizeClasses
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

  it('group classes include fixed positioning', () => {
    expect(floatButtonGroupClasses).toContain('fixed')
  })

  it('icon size classes match button sizes', () => {
    expect(Object.keys(floatButtonIconSizeClasses)).toEqual(['sm', 'md', 'lg'])
    expect(floatButtonIconSizeClasses.sm).toContain('h-4')
    expect(floatButtonIconSizeClasses.md).toContain('h-5')
    expect(floatButtonIconSizeClasses.lg).toContain('h-6')
  })
})
