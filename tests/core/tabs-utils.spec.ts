/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest'
import {
  isKeyActive,
  findTabIndex,
  getDefaultActiveKey,
  resolveDisplayedActiveKey,
  getNextActiveKey,
  getAdjacentEnabledKey,
  getTabKeyboardDelta,
  getTabSwipeDelta,
  formatTabKey,
  parseTabKey,
  getTabNavListClasses,
  getTabNavListStyle,
  getTabIndicatorStyleFromBox,
  resolveTabListOverflow,
  isTabPaneChildProps,
  type TabRecord
} from '@expcat/tigercat-core'

const tabs: TabRecord[] = [
  { key: 1, disabled: true },
  { key: '2', disabled: false },
  { key: '3', disabled: false }
]

describe('tabs-utils', () => {
  it('keeps number and string keys distinct', () => {
    expect(isKeyActive(1, '1')).toBe(false)
    expect(isKeyActive('2', 2)).toBe(false)
    expect(isKeyActive(2, 2)).toBe(true)
    expect(findTabIndex([1, 2, 3], '2')).toBe(-1)
    expect(findTabIndex([1, 2, 3], 2)).toBe(1)
    expect(formatTabKey(1)).toBe('n:1')
    expect(parseTabKey('n:1')).toBe(1)
    expect(parseTabKey('s:home')).toBe('home')
  })

  it('defaults to the first enabled tab', () => {
    expect(getDefaultActiveKey(tabs)).toBe('2')
    expect(resolveDisplayedActiveKey(undefined, tabs)).toBe('2')
    expect(resolveDisplayedActiveKey(1, tabs)).toBe(1)
    expect(resolveDisplayedActiveKey('missing', tabs)).toBe('missing')
  })

  it('skips disabled tabs when the active tab is removed', () => {
    expect(getNextActiveKey('2', '2', tabs)).toBe('3')
    expect(getNextActiveKey(1, 1, tabs)).toBe('2')
    expect(getNextActiveKey('3', '2', tabs)).toBe('2')
    expect(getNextActiveKey('only', 'only', [{ key: 'only', disabled: false }])).toBeUndefined()
  })

  it('walks enabled keys for keyboard and swipe with dir', () => {
    expect(getAdjacentEnabledKey(tabs, '2', 1)).toBe('3')
    expect(getAdjacentEnabledKey(tabs, '3', 1)).toBe('2')
    expect(getTabKeyboardDelta('ArrowRight', 'top', 'ltr')).toBe(1)
    expect(getTabKeyboardDelta('ArrowRight', 'top', 'rtl')).toBe(-1)
    expect(getTabKeyboardDelta('ArrowDown', 'left', 'ltr')).toBe(1)
    expect(getTabKeyboardDelta('Home', 'top', 'ltr')).toBe('home')
    expect(getTabSwipeDelta('left', 'top', 'ltr')).toBe(1)
    expect(getTabSwipeDelta('left', 'top', 'rtl')).toBe(-1)
    expect(getTabSwipeDelta('down', 'left', 'ltr')).toBe(1)
    expect(getTabSwipeDelta('left', 'left', 'ltr')).toBeNull()
  })

  it('does not force equal-width grid tracks', () => {
    expect(getTabNavListStyle('line', 'top', 3)).toEqual({})
  })

  it('places the indicator from a measured box', () => {
    expect(getTabIndicatorStyleFromBox(null, 'top')).toEqual({ opacity: '0' })
    expect(
      getTabIndicatorStyleFromBox(
        { inlineStart: 40, blockStart: 0, inlineSize: 80, blockSize: 32 },
        'top'
      )
    ).toMatchObject({
      width: '80px',
      insetInlineStart: '40px',
      opacity: '1'
    })
  })

  it('scrolls only on the tab axis so the cross axis cannot grow a scrollbar', () => {
    const horizontal = getTabNavListClasses('top', false, 'editable-card')
    expect(horizontal).toContain('overflow-x-auto')
    expect(horizontal).toContain('overflow-y-clip')
    expect(horizontal).toContain('min-w-0')
    expect(horizontal).toContain('pb-px')
    expect(horizontal.split(/\s+/)).not.toContain('overflow-auto')

    const vertical = getTabNavListClasses('left', false, 'line')
    expect(vertical).toContain('overflow-y-auto')
    expect(vertical).toContain('overflow-x-clip')
    expect(vertical).toContain('shrink-0')
    expect(vertical.split(/\s+/)).not.toContain('overflow-auto')
  })

  it('measures vertical overflow on the block axis', () => {
    const stacked = resolveTabListOverflow({
      position: 'left',
      keys: ['a', 'b', 'c'],
      inlineSizes: [96, 96, 96],
      blockSizes: [40, 40, 40],
      clientWidth: 96,
      clientHeight: 128,
      activeKey: 'b',
      gap: 4
    })
    expect(stacked.overflow).toEqual([])
    expect(stacked.visible).toEqual(['a', 'b', 'c'])

    const crowded = resolveTabListOverflow({
      position: 'top',
      keys: ['a', 'b', 'c'],
      inlineSizes: [80, 80, 80],
      blockSizes: [40, 40, 40],
      clientWidth: 100,
      clientHeight: 40,
      gap: 4
    })
    expect(crowded.overflow.length).toBeGreaterThan(0)
    expect(crowded.visible.length).toBeGreaterThan(0)
  })

  it('recognizes tab pane children by tabKey and label', () => {
    expect(isTabPaneChildProps({ tabKey: 1, label: 'One' })).toBe(true)
    expect(isTabPaneChildProps({ 'tab-key': 'a', label: 'A' })).toBe(true)
    expect(isTabPaneChildProps({ label: 'A' })).toBe(false)
  })
})
