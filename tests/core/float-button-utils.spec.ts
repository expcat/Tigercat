import { describe, it, expect } from 'vitest'
import {
  floatButtonPlusIconPath,
  getFloatButtonClasses,
  getFloatButtonGroupClasses,
  getFloatButtonOffsetStyle,
  resolveFloatButtonAriaLabel,
  resolveFloatButtonShape,
  VIEWPORT_FLOATING_FAB_OFFSET
} from '@expcat/tigercat-core'

describe('float-button-utils', () => {
  it('resolves shape with child winning over group', () => {
    expect(resolveFloatButtonShape(undefined, undefined)).toBe('circle')
    expect(resolveFloatButtonShape(undefined, 'square')).toBe('square')
    expect(resolveFloatButtonShape('circle', 'square')).toBe('circle')
  })

  it('uses visible text as the name and locale for icon-only', () => {
    expect(
      resolveFloatButtonAriaLabel({
        ariaLabel: undefined,
        tooltip: 'Help',
        hasVisibleText: true,
        localeLabel: 'Add'
      })
    ).toBeUndefined()
    expect(
      resolveFloatButtonAriaLabel({
        ariaLabel: undefined,
        tooltip: undefined,
        hasVisibleText: false,
        localeLabel: 'Add'
      })
    ).toBe('Add')
    expect(
      resolveFloatButtonAriaLabel({
        ariaLabel: 'Custom',
        tooltip: 'Help',
        hasVisibleText: false,
        localeLabel: 'Add'
      })
    ).toBe('Custom')
  })

  it('places FAB offset on logical inset so it sits above default BackTop', () => {
    const style = getFloatButtonOffsetStyle('bottom-right')
    expect(style?.insetInlineEnd).toBe(`${VIEWPORT_FLOATING_FAB_OFFSET.x}px`)
    expect(style?.insetBlockEnd).toBe(`${VIEWPORT_FLOATING_FAB_OFFSET.y}px`)
    expect(style).not.toHaveProperty('left')
    expect(style).not.toHaveProperty('right')
  })

  it('grows the group away from the anchored corner', () => {
    const bottom = getFloatButtonGroupClasses({ placement: 'bottom-right', portal: true })
    const top = getFloatButtonGroupClasses({ placement: 'top-left', portal: false })
    expect(bottom).toContain('flex-col-reverse')
    expect(bottom).toContain('end-0')
    expect(bottom).not.toContain('right-0')
    expect(top).toMatch(/flex-col(?!-reverse)/)
    expect(top).toContain('start-0')
    expect(top).toContain('absolute')
  })

  it('ignores floating when the button is inside a group', () => {
    const standalone = getFloatButtonClasses({ floating: true, placement: 'bottom-left' })
    const grouped = getFloatButtonClasses({
      floating: true,
      inGroup: true,
      placement: 'bottom-left'
    })
    expect(standalone).toContain('fixed')
    expect(grouped).not.toContain('fixed')
  })

  it('plus icon path is a stroke plus', () => {
    expect(floatButtonPlusIconPath.startsWith('M')).toBe(true)
  })
})
