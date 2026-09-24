import { describe, expect, it } from 'vitest'
import { resolveNotificationDuration } from '@expcat/tigercat-core'

describe('notification-utils', () => {
  it('uses 4500ms unless a finite non-negative duration is passed', () => {
    expect(resolveNotificationDuration(undefined)).toBe(4500)
    expect(resolveNotificationDuration(0)).toBe(0)
    expect(resolveNotificationDuration(1200)).toBe(1200)
    expect(resolveNotificationDuration(Number.NaN)).toBe(0)
    expect(resolveNotificationDuration(-1)).toBe(0)
  })
})
