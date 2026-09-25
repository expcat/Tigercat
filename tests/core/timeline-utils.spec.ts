import { describe, expect, it } from 'vitest'
import {
  EMPTY_TIMELINE_ITEMS,
  getPendingDotClasses,
  getTimelineAxisClasses,
  getTimelineContentClasses,
  getTimelineDotClasses,
  getTimelineHeadClasses,
  getTimelineItemClasses,
  getTimelineItemKey,
  getTimelineTailClasses,
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
    expect(getTimelineAxisClasses('left')).toContain('start-0')
    expect(getTimelineAxisClasses('right')).toContain('end-0')
    expect(getTimelineAxisClasses('alternate')).toContain('start-1/2')
    expect(getTimelineAxisClasses('left')).toContain('inset-y-0')
    expect(getTimelineHeadClasses('left')).not.toContain('start-0')
  })

  it('runs the connector from node edge to node edge', () => {
    const tail = getTimelineTailClasses('left', false)
    expect(tail).toContain('w-px')
    expect(tail).toContain('flex-1')
    expect(tail).not.toContain('top-')
    expect(tail).not.toContain('bottom-')
    expect(getTimelineTailClasses('left', true)).toBe('hidden')
    expect(getTimelineTailClasses('alternate', false, 'before')).toBe('hidden')
    expect(getTimelineDotClasses()).not.toContain('border-')
    expect(getTimelineDotClasses('#10b981')).not.toContain('border-')
    expect(getPendingDotClasses()).not.toContain('border-')
  })

  it('paints horizontal halves only between nodes', () => {
    expect(getTimelineTailClasses('horizontal', true, 'before')).not.toContain('bg-')
    expect(getTimelineTailClasses('horizontal', false, 'before')).toContain(
      'bg-[var(--tiger-border)]'
    )
    expect(getTimelineTailClasses('horizontal', true, 'after')).not.toContain('bg-')
    expect(getTimelineTailClasses('horizontal', false, 'after')).toContain('h-px')
    expect(getTimelineAxisClasses('horizontal')).toContain('self-stretch')
    expect(getTimelineContentClasses('horizontal')).toContain('text-center')
  })

  it('stops pending pulse under reduced motion', () => {
    expect(getPendingDotClasses()).toContain('motion-reduce:animate-none')
    expect(getPendingDotClasses()).toContain('tiger-primary')
    expect(getPendingDotClasses()).not.toContain('tiger-surface')
  })
})
