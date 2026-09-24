/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { resolveAlertLive } from '@expcat/tigercat-core'

describe('Alert live role', () => {
  it('keeps error as alert and announces inserted non-error status', () => {
    expect(resolveAlertLive('error', true, false)).toEqual({ role: 'alert' })
    expect(resolveAlertLive('error', false, true)).toEqual({})
    expect(resolveAlertLive('info', true, false)).toEqual({})
    expect(resolveAlertLive('success', true, true)).toEqual({ role: 'status', ariaLive: 'polite' })
    expect(resolveAlertLive('warning', true, true)).toEqual({ role: 'status', ariaLive: 'polite' })
  })
})
