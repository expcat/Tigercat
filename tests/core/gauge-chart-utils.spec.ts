import { describe, it, expect, vi } from 'vitest'
import {
  createGaugeArcPath,
  createGaugeNeedlePath,
  valueToGaugeAngle,
  computeGaugeTicks,
  createGaugeAnimation,
  GAUGE_ANIMATION_DURATION_MS
} from '@expcat/tigercat-core'

// ─── createGaugeArcPath ───────────────────────────────────────────

describe('createGaugeArcPath', () => {
  it('returns a valid SVG path string', () => {
    const path = createGaugeArcPath(100, 100, 80, 0, 180, 20)
    expect(path).toContain('M')
    expect(path).toContain('A')
    expect(path).toContain('Z')
  })

  it('handles small arc (< 180°)', () => {
    const path = createGaugeArcPath(100, 100, 80, 0, 90, 20)
    // large arc flag should be 0
    expect(path).toContain(' 0 1 ')
  })

  it('handles large arc (> 180°)', () => {
    const path = createGaugeArcPath(100, 100, 80, 0, 270, 20)
    // large arc flag should be 1
    expect(path).toContain(' 1 1 ')
  })

  it('produces different paths for different arc widths', () => {
    const narrow = createGaugeArcPath(100, 100, 80, 0, 180, 10)
    const wide = createGaugeArcPath(100, 100, 80, 0, 180, 30)
    expect(narrow).not.toBe(wide)
  })

  it('handles zero-degree arc', () => {
    const path = createGaugeArcPath(100, 100, 80, 45, 45, 20)
    // Should still return a valid path string (degenerate arc)
    expect(typeof path).toBe('string')
  })
})

// ─── createGaugeNeedlePath ────────────────────────────────────────

describe('createGaugeNeedlePath', () => {
  it('returns a triangle path', () => {
    const path = createGaugeNeedlePath(100, 100, 60, 90)
    expect(path).toMatch(/^M[\d.,-]+\sL[\d.,-]+\sL[\d.,-]+\sZ$/)
  })

  it('different angles produce different paths', () => {
    const p0 = createGaugeNeedlePath(100, 100, 60, 0)
    const p90 = createGaugeNeedlePath(100, 100, 60, 90)
    expect(p0).not.toBe(p90)
  })

  it('custom needle width changes base spread', () => {
    const narrow = createGaugeNeedlePath(100, 100, 60, 90, 2)
    const wide = createGaugeNeedlePath(100, 100, 60, 90, 10)
    expect(narrow).not.toBe(wide)
  })
})

// ─── valueToGaugeAngle ───────────────────────────────────────────

describe('valueToGaugeAngle', () => {
  it('maps minimum value to start angle', () => {
    expect(valueToGaugeAngle(0, 0, 100, -135, 135)).toBe(-135)
  })

  it('maps maximum value to end angle', () => {
    expect(valueToGaugeAngle(100, 0, 100, -135, 135)).toBe(135)
  })

  it('maps midpoint value to midpoint angle', () => {
    expect(valueToGaugeAngle(50, 0, 100, -135, 135)).toBe(0)
  })

  it('clamps value below min to start angle', () => {
    expect(valueToGaugeAngle(-10, 0, 100, -135, 135)).toBe(-135)
  })

  it('clamps value above max to end angle', () => {
    expect(valueToGaugeAngle(200, 0, 100, -135, 135)).toBe(135)
  })

  it('handles min === max (returns NaN due to division by zero)', () => {
    // ratio = (v - min) / (max - min) → 0/0 → NaN
    const result = valueToGaugeAngle(50, 50, 50, -135, 135)
    expect(result).toBeNaN()
  })
})

// ─── computeGaugeTicks ───────────────────────────────────────────

describe('computeGaugeTicks', () => {
  it('returns tickCount + 1 ticks (inclusive)', () => {
    const ticks = computeGaugeTicks(100, 100, 80, 0, 100, -135, 135, 5)
    expect(ticks).toHaveLength(6) // 0,1,2,3,4,5 = 6
  })

  it('first tick has min value, last has max value', () => {
    const ticks = computeGaugeTicks(100, 100, 80, 0, 100, -135, 135, 4)
    expect(ticks[0].value).toBe(0)
    expect(ticks[ticks.length - 1].value).toBe(100)
  })

  it('labels are rounded values', () => {
    const ticks = computeGaugeTicks(100, 100, 80, 0, 100, -135, 135, 4)
    expect(ticks[0].label).toBe('0')
    expect(ticks[ticks.length - 1].label).toBe('100')
  })

  it('tick positions are on the arc perimeter', () => {
    const ticks = computeGaugeTicks(100, 100, 80, 0, 100, -135, 135, 4)
    for (const tick of ticks) {
      // x2, y2 = outer (radius), x1, y1 = inner (radius - 8)
      const outerDist = Math.sqrt((tick.x2 - 100) ** 2 + (tick.y2 - 100) ** 2)
      expect(outerDist).toBeCloseTo(80, 5)
    }
  })

  it('returns single tick when tickCount is 0', () => {
    const ticks = computeGaugeTicks(100, 100, 80, 0, 100, -135, 135, 0)
    expect(ticks).toHaveLength(1)
  })
})

// ─── createGaugeAnimation ────────────────────────────────────────

describe('createGaugeAnimation', () => {
  it('immediately completes when from === to', () => {
    const onUpdate = vi.fn()
    const onComplete = vi.fn()
    createGaugeAnimation({ from: 45, to: 45, onUpdate, onComplete })
    expect(onUpdate).toHaveBeenCalledWith(45)
    expect(onComplete).toHaveBeenCalled()
  })

  it('immediately completes when duration <= 0', () => {
    const onUpdate = vi.fn()
    const onComplete = vi.fn()
    createGaugeAnimation({ from: 0, to: 90, duration: 0, onUpdate, onComplete })
    expect(onUpdate).toHaveBeenCalledWith(90)
    expect(onComplete).toHaveBeenCalled()
  })

  it('uses custom rAF and calls onUpdate during animation', () => {
    const onUpdate = vi.fn()
    const onComplete = vi.fn()
    let callback: FrameRequestCallback | null = null
    const rAF = vi.fn((cb: FrameRequestCallback) => {
      callback = cb
      return 1
    })
    const cAF = vi.fn()

    createGaugeAnimation({
      from: 0,
      to: 100,
      duration: 600,
      onUpdate,
      onComplete,
      requestAnimationFrame: rAF,
      cancelAnimationFrame: cAF
    })

    expect(rAF).toHaveBeenCalled()

    // Simulate first frame
    callback!(0)
    expect(onUpdate).toHaveBeenCalled()

    // Simulate end frame
    callback!(600)
    expect(onComplete).toHaveBeenCalled()
  })

  it('stop() cancels the animation', () => {
    const onUpdate = vi.fn()
    let callback: FrameRequestCallback | null = null
    const rAF = vi.fn((cb: FrameRequestCallback) => {
      callback = cb
      return 42
    })
    const cAF = vi.fn()

    const ctrl = createGaugeAnimation({
      from: 0,
      to: 100,
      duration: 600,
      onUpdate,
      requestAnimationFrame: rAF,
      cancelAnimationFrame: cAF
    })

    ctrl.stop()
    expect(cAF).toHaveBeenCalledWith(42)

    // Further stop calls are no-ops
    ctrl.stop()
    expect(cAF).toHaveBeenCalledTimes(1)
  })

  it('exports default duration constant', () => {
    expect(GAUGE_ANIMATION_DURATION_MS).toBe(600)
  })
})
