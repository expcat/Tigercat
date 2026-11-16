/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { isSwipeBlockedByNestedScroll } from '@expcat/tigercat-core'

describe('Tabs nested scroll', () => {
  it.each(['x', 'y'] as const)('blocks only scrollable ancestors on the %s swipe axis', (axis) => {
    const root = document.createElement('div')
    const scroller = document.createElement('div')
    const target = document.createElement('span')
    scroller.style[axis === 'x' ? 'overflowX' : 'overflowY'] = 'auto'
    Object.defineProperties(scroller, {
      scrollWidth: { value: axis === 'x' ? 200 : 100 },
      clientWidth: { value: 100 },
      scrollHeight: { value: axis === 'y' ? 200 : 100 },
      clientHeight: { value: 100 }
    })
    root.append(scroller)
    scroller.append(target)
    document.body.append(root)

    try {
      expect(isSwipeBlockedByNestedScroll(target, root, axis)).toBe(true)
      expect(isSwipeBlockedByNestedScroll(target, root, axis === 'x' ? 'y' : 'x')).toBe(false)
    } finally {
      root.remove()
    }
  })
})
