import { describe, expect, it } from 'vitest'
import {
  EMPTY_TIMELINE_ITEMS,
  getPendingDotClasses,
  getTimelineContentClasses,
  getTimelineHeadClasses,
  getTimelineItemClasses,
  getTimelineItemKey,
  processTimelineItems
} from '@expcat/tigercat-core'

describe('timeline-utils', () => {
  it('keeps key 0 instead of falling back to the index', () => {
    expect(getTimelineItemKey({ key: 0 }, 4)).toBe(0)
    expect(getTimelineItemKey({ key: '' }, 4)).toBe('')
    expect(getTimelineItemKey({}, 4)).toBe(4)
  })

  it('reverses items without moving pending (pending is appended by the renderer)', () => {
    const items = processTimelineItems(
      [
        { key: 1, content: 'a' },
        { key: 2, content: 'b' }
      ],
      { reverse: true }
    )
    expect(items.map((item) => item.key)).toEqual([2, 1])
  })

  it('fills alternate positions from the left', () => {
    const items = processTimelineItems([{ content: 'a' }, { content: 'b' }], {
      mode: 'alternate'
    })
    expect(items[0].position).toBe('left')
    expect(items[1].position).toBe('right')
  })

  it('uses a shared empty items constant', () => {
    expect(processTimelineItems(undefined)).toBe(EMPTY_TIMELINE_ITEMS)
  })

  it('places alternate content on one half of the axis', () => {
    expect(getTimelineContentClasses('alternate', 'left')).toContain('col-start-1')
    expect(getTimelineContentClasses('alternate', 'right')).toContain('col-start-2')
    expect(getTimelineItemClasses('alternate', 'left')).toContain('grid-cols-2')
  })

  it('uses logical inset for the axis', () => {
    expect(getTimelineHeadClasses('left')).toContain('start-0')
    expect(getTimelineHeadClasses('right')).toContain('end-0')
    expect(getTimelineHeadClasses('alternate')).toContain('start-1/2')
  })

  it('stops pending pulse under reduced motion', () => {
    expect(getPendingDotClasses()).toContain('motion-reduce:animate-none')
    expect(getPendingDotClasses()).toContain('tiger-surface')
  })
})
