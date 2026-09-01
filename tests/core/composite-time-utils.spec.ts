/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  formatActivityTime,
  formatChatTime,
  formatCommentTime,
  formatCompositeTime,
  parseCompositeTime
} from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

describe('composite time helper', () => {
  it('treats 0 as a legal Unix epoch, not empty', () => {
    expect(formatChatTime(0, 'en-US')).not.toBe('')
    expect(formatCommentTime(0, 'en-US')).not.toBe('')
    expect(formatActivityTime(0, 'en-US')).not.toBe('')
    expect(formatCompositeTime(0, 'en-US')).not.toBe('')
  })

  it('returns empty for null, undefined, empty string, and Invalid Date', () => {
    expect(formatCompositeTime(null)).toBe('')
    expect(formatCompositeTime(undefined)).toBe('')
    expect(formatCompositeTime('')).toBe('')
    expect(formatCompositeTime(new Date(Number.NaN))).toBe('')
    expect(formatChatTime(Number.NaN)).toBe('')
  })

  it('keeps already-formatted strings and parses ISO', () => {
    expect(formatCommentTime('10:30')).toBe('10:30')
    expect(formatCommentTime('刚刚')).toBe('刚刚')
    const iso = formatCommentTime('2020-01-01T00:00:00.000Z', 'en-US')
    expect(iso).not.toBe('2020-01-01T00:00:00.000Z')
    expect(iso.length).toBeGreaterThan(0)
  })

  it('formats Date values with the component locale, not the host default', () => {
    const noon = new Date(2024, 0, 15, 14, 30, 0)
    const zh = formatCommentTime(noon, zhCN)
    const en = formatCommentTime(noon, 'en-US')
    expect(zh).not.toBe('')
    expect(en).not.toBe('')
    expect(zh).not.toMatch(/AM|PM/)
    expect(parseCompositeTime(noon)?.getTime()).toBe(noon.getTime())
  })

  it('shares one implementation across the three public names', () => {
    expect(formatActivityTime).toBe(formatCommentTime)
    expect(formatChatTime(0, 'en-US')).toBe(formatCompositeTime(0, 'en-US', { style: 'time' }))
  })
})
