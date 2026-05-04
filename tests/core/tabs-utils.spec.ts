import { describe, it, expect } from 'vitest'
import {
  getTabIndicatorClasses,
  getTabIndicatorStyle,
  getTabNavListStyle
} from '@expcat/tigercat-core'

describe('tabs-utils', () => {
  it('uses grid tracks for line tab nav lists', () => {
    expect(getTabNavListStyle('line', 'top', 3)).toEqual({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '0'
    })
  })

  it('keeps non-line tab nav list styles unchanged', () => {
    expect(getTabNavListStyle('card', 'top', 3)).toEqual({})
  })

  it('moves horizontal indicators with translateX', () => {
    expect(getTabIndicatorStyle(2, 4, 'top')).toMatchObject({
      width: 'calc(100% / 4)',
      transform: 'translateX(200%)',
      opacity: '1'
    })
  })

  it('moves vertical indicators with translateY', () => {
    expect(getTabIndicatorStyle(1, 3, 'left')).toMatchObject({
      height: 'calc(100% / 3)',
      transform: 'translateY(100%)',
      opacity: '1'
    })
  })

  it('hides the indicator when no tab is active', () => {
    expect(getTabIndicatorStyle(-1, 0, 'top')).toEqual({
      transform: 'translateX(0%)',
      opacity: '0'
    })
  })

  it('returns indicator placement classes for line tabs only', () => {
    expect(getTabIndicatorClasses('line', 'bottom')).toContain('top-0')
    expect(getTabIndicatorClasses('card', 'bottom')).toBe('hidden')
  })
})
