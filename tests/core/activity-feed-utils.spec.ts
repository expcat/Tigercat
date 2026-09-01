/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  buildActivityGroups,
  toActivityTimelineItems,
  type ActivityItem
} from '@expcat/tigercat-core'

const items: ActivityItem[] = [
  { id: 1, title: 'One' },
  { id: 0, title: 'Zero' },
  { id: 2, title: 'Two' }
]

describe('activity-feed-utils groups', () => {
  it('does not fall back to items when groups is an empty array', () => {
    expect(buildActivityGroups(items, [])).toEqual([])
  })

  it('uses explicit groups including a group with missing items', () => {
    const result = buildActivityGroups(items, [{ key: 'day', title: 'Today' } as never])
    expect(result).toEqual([{ key: 'day', title: 'Today', items: [] }])
  })

  it('buckets empty groupBy keys with the locale other title, not a CJK literal', () => {
    const result = buildActivityGroups(items, undefined, () => '', undefined, 'Other')
    expect(result).toHaveLength(1)
    expect(result[0]?.title).toBe('Other')
    expect(result[0]?.title).not.toBe('其他')
  })

  it('keeps id 0 as the timeline key', () => {
    expect(toActivityTimelineItems([{ id: 0, title: 'Zero' }])[0]?.key).toBe(0)
  })
})
