/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  getAvatarGroupClasses,
  getAvatarGroupItemClasses,
  getAvatarGroupOverflowClasses,
  getAvatarGroupOverflowLabel,
  getAvatarGroupOverflowText,
  getButtonGroupClasses,
  getImageGroupClasses,
  getVisibleGroupItems,
  imageGroupBaseClasses,
  registerImageGroupItem,
  unregisterImageGroupItem
} from '@expcat/tigercat-core'

describe('group-utils', () => {
  it('calculates visible and overflow group items', () => {
    const result = getVisibleGroupItems(['a', 'b', 'c', 'd'], 2)

    expect(result.visibleItems).toEqual(['a', 'b'])
    expect(result.total).toBe(4)
    expect(result.visibleCount).toBe(2)
    expect(result.overflowCount).toBe(2)
  })

  it('clamps invalid max values for visible group items', () => {
    expect(getVisibleGroupItems(['a', 'b'], -1).visibleItems).toEqual([])
    expect(getVisibleGroupItems(['a', 'b'], 3).visibleItems).toEqual(['a', 'b'])
  })

  it('composes avatar group classes and overflow metadata', () => {
    expect(getAvatarGroupClasses('custom')).toContain('inline-flex')
    expect(getAvatarGroupClasses('custom')).toContain('custom')
    expect(getAvatarGroupItemClasses()).toContain('-ml-2')
    expect(getAvatarGroupOverflowClasses('lg')).toContain('h-12')
    expect(getAvatarGroupOverflowLabel(3)).toBe('3 more')
    expect(getAvatarGroupOverflowText(3)).toBe('+3')
  })

  it('composes button group classes by orientation', () => {
    expect(getButtonGroupClasses(false, 'custom')).toContain('flex-row')
    expect(getButtonGroupClasses(false, 'custom')).toContain('custom')
    expect(getButtonGroupClasses(true)).toContain('flex-col')
    expect(getButtonGroupClasses(true)).toContain('-mt-px')
  })

  it('returns image group classes with backward compatible custom class behavior', () => {
    expect(getImageGroupClasses()).toBe(imageGroupBaseClasses)
    expect(getImageGroupClasses('custom-image-group')).toBe('custom-image-group')
  })

  it('registers and unregisters image group items without mutating input arrays', () => {
    const initial = ['one.jpg']
    const registered = registerImageGroupItem(initial, 'two.jpg')

    expect(initial).toEqual(['one.jpg'])
    expect(registered.index).toBe(1)
    expect(registered.items).toEqual(['one.jpg', 'two.jpg'])

    const unregistered = unregisterImageGroupItem(registered.items, 'one.jpg')
    expect(registered.items).toEqual(['one.jpg', 'two.jpg'])
    expect(unregistered).toEqual(['two.jpg'])
  })
})
