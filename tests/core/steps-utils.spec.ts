/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { calculateStepStatus, clampStepCurrent } from '@expcat/tigercat-core'

describe('steps-utils', () => {
  it('clamps non-finite and out-of-range current indices', () => {
    expect(clampStepCurrent(Number.NaN, 3)).toBe(0)
    expect(clampStepCurrent(99, 3)).toBe(2)
    expect(clampStepCurrent(-1, 3)).toBe(0)
    expect(clampStepCurrent(1.8, 3)).toBe(1)
  })

  it('falls back from illegal custom status', () => {
    expect(calculateStepStatus(1, 1, 'process', 'foo' as never)).toBe('process')
    expect(calculateStepStatus(0, Number.NaN, 'process')).toBe('process')
    expect(calculateStepStatus(0, 2, 'process')).toBe('finish')
    expect(calculateStepStatus(2, 1, 'error')).toBe('wait')
  })
})
