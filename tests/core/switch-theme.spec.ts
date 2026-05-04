import { describe, it, expect } from 'vitest'
import { getSwitchClasses, getSwitchThumbClasses } from '@expcat/tigercat-core'

describe('switch theme helpers', () => {
  it('composes size, checked, disabled, and custom classes', () => {
    const classes = getSwitchClasses('lg', true, true, 'custom-switch')

    expect(classes).toContain('h-7')
    expect(classes).toContain('w-14')
    expect(classes).toContain('bg-[var(--tiger-primary,#2563eb)]')
    expect(classes).toContain('cursor-not-allowed')
    expect(classes).toContain('custom-switch')
  })

  it('normalizes Vue-style object and array class inputs', () => {
    const classes = getSwitchClasses('md', false, false, ['array-class'], {
      active: true,
      inactive: false
    })

    expect(classes).toContain('array-class')
    expect(classes).toContain('active')
    expect(classes).not.toContain('inactive')
  })

  it('composes thumb size and translate classes', () => {
    expect(getSwitchThumbClasses('sm', false)).toContain('translate-x-0.5')
    expect(getSwitchThumbClasses('sm', true)).toContain('translate-x-4')
  })
})
