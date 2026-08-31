import { describe, it, expect } from 'vitest'
import {
  getSegmentedContainerClasses,
  getSegmentedContainerStyle,
  getSegmentedIndicatorClasses,
  getSegmentedIndicatorStyle,
  getSegmentedKeyboardTarget
} from '@expcat/tigercat-core'

describe('segmented-utils', () => {
  it('builds equal grid columns for all options', () => {
    expect(getSegmentedContainerStyle(3)).toEqual({
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
    })
  })

  it('moves the indicator on the inline axis', () => {
    const style = getSegmentedIndicatorStyle(2, 4, 'md')
    expect(style.insetInlineStart).toContain('2 *')
    expect(style.width).toContain('/ 4')
    expect(style.opacity).toBe('1')
  })

  it('hides the indicator when there is no selected option', () => {
    expect(getSegmentedIndicatorStyle(-1, 3, 'sm').opacity).toBe('0')
  })

  it('uses surface tokens for the track and indicator', () => {
    expect(getSegmentedContainerClasses('md', false)).toContain('--tiger-surface-muted')
    expect(getSegmentedIndicatorClasses('md')).toContain('--tiger-surface-raised')
  })

  it('moves ArrowRight toward reading start in RTL', () => {
    expect(getSegmentedKeyboardTarget('ArrowRight', 1, [0, 1, 2], false)).toBe(2)
    expect(getSegmentedKeyboardTarget('ArrowRight', 1, [0, 1, 2], true)).toBe(0)
    expect(getSegmentedKeyboardTarget('Home', 2, [0, 1, 2], true)).toBe(0)
    expect(getSegmentedKeyboardTarget('End', 0, [0, 1, 2], true)).toBe(2)
  })
})
