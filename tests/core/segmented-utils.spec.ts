import { describe, it, expect } from 'vitest'
import {
  getSegmentedContainerClasses,
  getSegmentedContainerStyle,
  getSegmentedIndicatorClasses,
  getSegmentedIndicatorStyle
} from '@expcat/tigercat-core'

describe('segmented-utils', () => {
  it('builds equal grid columns for all options', () => {
    expect(getSegmentedContainerStyle(3)).toEqual({
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'
    })
  })

  it('uses transform to move the active indicator', () => {
    expect(getSegmentedIndicatorStyle(2, 4, 'md')).toMatchObject({
      left: '0.25rem',
      width: 'calc((100% - (0.25rem * 2)) / 4)',
      transform: 'translateX(200%)',
      opacity: '1'
    })
  })

  it('hides the indicator when there is no selected option', () => {
    expect(getSegmentedIndicatorStyle(-1, 3, 'sm')).toMatchObject({
      transform: 'translateX(0%)',
      opacity: '0'
    })
  })

  it('falls back to registered surface-muted for the track, not fill', () => {
    const classes = getSegmentedContainerClasses('md', false)
    expect(classes).toContain('--tiger-surface-muted')
    expect(classes).toContain('--tiger-segmented-bg')
    expect(classes).not.toContain('--tiger-fill')
  })

  it('falls back to registered surface-raised for the indicator, not surface', () => {
    const classes = getSegmentedIndicatorClasses('md')
    expect(classes).toContain('--tiger-surface-raised')
    expect(classes).toContain('--tiger-segmented-active-bg')
    expect(classes).not.toMatch(/var\(--tiger-surface[,)]/)
  })
})
