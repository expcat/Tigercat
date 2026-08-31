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
    expect(getAvatarGroupItemClasses()).toContain('-ms-2')
    expect(getAvatarGroupItemClasses()).not.toContain('-ml-2')
    expect(getAvatarGroupOverflowClasses('lg')).toContain('--tiger-component-avatar-size-lg')
    expect(getAvatarGroupOverflowClasses('md', 'square', false)).not.toContain('-ms-2')
    expect(getAvatarGroupOverflowClasses('md', 'square', true)).toContain('-ms-2')
    expect(getAvatarGroupOverflowLabel(3)).toBe('3 more')
    expect(getAvatarGroupOverflowText(3)).toBe('+3')
  })

  it('composes button group classes by orientation', () => {
    expect(getButtonGroupClasses(false, 'custom')).toContain('flex-row')
    expect(getButtonGroupClasses(false, 'custom')).toContain('custom')
    expect(getButtonGroupClasses(true)).toContain('flex-col')
    expect(getButtonGroupClasses(true)).toContain('-mt-px')
  })

  it('merges image group classes instead of replacing the base class', () => {
    expect(getImageGroupClasses()).toBe(imageGroupBaseClasses)
    expect(getImageGroupClasses('custom-image-group')).toContain(imageGroupBaseClasses)
    expect(getImageGroupClasses('custom-image-group')).toContain('custom-image-group')
  })

  it('registers image group items by instance id so duplicate src stays distinct', () => {
    const initial = [{ id: 'a', src: 'one.jpg' }]
    const registered = registerImageGroupItem(initial, { id: 'b', src: 'one.jpg' })

    expect(initial).toEqual([{ id: 'a', src: 'one.jpg' }])
    expect(registered.index).toBe(1)
    expect(registered.items).toEqual([
      { id: 'a', src: 'one.jpg' },
      { id: 'b', src: 'one.jpg' }
    ])

    const updated = registerImageGroupItem(registered.items, { id: 'b', src: 'two.jpg' })
    expect(updated.index).toBe(1)
    expect(updated.items).toEqual([
      { id: 'a', src: 'one.jpg' },
      { id: 'b', src: 'two.jpg' }
    ])

    const unregistered = unregisterImageGroupItem(updated.items, 'a')
    expect(unregistered).toEqual([{ id: 'b', src: 'two.jpg' }])
  })
})
