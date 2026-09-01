import { describe, expect, it } from 'vitest'
import {
  getDrawerMaskClasses,
  getDrawerPanelClasses,
  isDrawerSwipeCloseGesture,
  resolveDrawerPlacement,
  type SwipeGesture
} from '@expcat/tigercat-core'

function swipe(direction: SwipeGesture['direction']): SwipeGesture {
  return {
    direction,
    distance: 80,
    velocity: 0.4,
    deltaX: 0,
    deltaY: 80,
    duration: 200
  }
}

describe('drawer-utils', () => {
  it('getDrawerMaskClasses only accepts pointer events while visible', () => {
    expect(getDrawerMaskClasses(true)).toContain('opacity-100')
    expect(getDrawerMaskClasses(true)).toContain('pointer-events-auto')
    expect(getDrawerMaskClasses(false)).toContain('opacity-0')
    expect(getDrawerMaskClasses(false)).toContain('pointer-events-none')
  })

  it('getDrawerPanelClasses keeps a closed panel off-screen', () => {
    expect(getDrawerPanelClasses('bottom', false, 'md', false)).toContain('translate-y-full')
    expect(getDrawerPanelClasses('bottom', true, 'md', false)).toContain('translate-y-0')
    expect(getDrawerPanelClasses('right', false, 'md', false)).toContain('translate-x-full')
    expect(getDrawerPanelClasses('left', false, 'md', false)).toContain('-translate-x-full')
  })

  it('isDrawerSwipeCloseGesture follows the close axis', () => {
    expect(isDrawerSwipeCloseGesture('bottom', swipe('down'))).toBe(true)
    expect(isDrawerSwipeCloseGesture('bottom', swipe('up'))).toBe(false)
    expect(isDrawerSwipeCloseGesture('right', swipe('right'))).toBe(true)
    expect(isDrawerSwipeCloseGesture('left', swipe('left'))).toBe(true)
    expect(isDrawerSwipeCloseGesture('top', swipe('up'))).toBe(true)
    expect(isDrawerSwipeCloseGesture('bottom', null)).toBe(false)
  })

  it('resolveDrawerPlacement maps start/end with direction', () => {
    expect(resolveDrawerPlacement('start', 'rtl')).toBe('right')
    expect(resolveDrawerPlacement('end', 'ltr')).toBe('right')
  })
})
