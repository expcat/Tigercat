import { describe, expect, it } from 'vitest'
import {
  EMPTY_TIMELINE_ITEMS,
  getPendingDotClasses,
  getTimelineAxisClasses,
  getTimelineContainerClasses,
  getTimelineContentClasses,
  getTimelineDotClasses,
  getTimelineHeadClasses,
  getTimelineItemClasses,
  getTimelineItemKey,
  getTimelineTailClasses,
  processTimelineItems,
  timelineBaseStyles
} from '@expcat/tigercat-core'
import tigercatPlugin from '../../packages/core/src/tailwind-plugin'

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
    expect(getTimelineAxisClasses('left')).not.toContain('w-0')
    expect(getTimelineAxisClasses('left')).toContain('tiger-timeline-axis')
    expect(getTimelineContainerClasses('left')).toContain('tiger-timeline')
    expect(getTimelineHeadClasses('left')).toContain('tiger-timeline-node')
    expect(getTimelineHeadClasses('left')).not.toContain('start-0')
  })

  it('centers an even stroke on the node column', () => {
    const tail = getTimelineTailClasses('left', false)
    expect(tail).toContain('tiger-timeline-tail')
    expect(tail).not.toContain('w-px')
    expect(tail).not.toContain('w-0')
    expect(getTimelineTailClasses('left', true)).toBe('hidden')
    expect(getTimelineTailClasses('alternate', false, 'before')).toBe('hidden')
    expect(getTimelineDotClasses()).not.toContain('border-')
    expect(getTimelineDotClasses('#10b981')).not.toContain('border-')
    expect(getPendingDotClasses()).not.toContain('border-')

    const tailSelector = Object.keys(timelineBaseStyles).find((selector) =>
      selector.includes('> .tiger-timeline-tail')
    )
    expect(tailSelector).toBe(
      ':is(.tiger-timeline-axis[data-timeline-axis="left"], .tiger-timeline-axis[data-timeline-axis="right"], .tiger-timeline-axis[data-timeline-axis="alternate"]) > .tiger-timeline-tail'
    )
    const tailRule = tailSelector
      ? (timelineBaseStyles[tailSelector as keyof typeof timelineBaseStyles] as Record<
          string,
          string
        >)
      : undefined
    expect(tailRule).toMatchObject({
      inlineSize: 'var(--tiger-timeline-stroke)',
      insetInlineStart: '50%',
      marginInlineStart: 'calc(var(--tiger-timeline-stroke) / -2)',
      insetBlockStart: 'var(--tiger-timeline-anchor-center)',
      insetBlockEnd: 'calc(var(--tiger-timeline-anchor-center) * -1)'
    })
    expect(timelineBaseStyles['.tiger-timeline']).toMatchObject({
      '--tiger-timeline-node-size': '0.625rem',
      '--tiger-timeline-stroke': '0.125rem'
    })
  })

  it('ships rail geometry through the tailwind plugin', () => {
    const rules: Record<string, unknown> = {}
    type PluginInstance = {
      handler: (api: { addBase: (rule: Record<string, unknown>) => void }) => void
    }
    const plugin = tigercatPlugin as unknown as PluginInstance
    plugin.handler({ addBase: (rule) => Object.assign(rules, rule) })
    const tailRule = Object.entries(rules).find(([selector]) =>
      selector.includes('> .tiger-timeline-tail')
    )?.[1]
    expect(tailRule).toMatchObject({
      inlineSize: 'var(--tiger-timeline-stroke)',
      marginInlineStart: 'calc(var(--tiger-timeline-stroke) / -2)'
    })
    expect(
      rules['.tiger-workflow-detail-shell__tabs [role="tabpanel"]:has(.tiger-timeline)']
    ).toMatchObject({
      paddingTop: '1rem'
    })
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
