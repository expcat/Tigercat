import { describe, expect, it } from 'vitest'
import {
  clampPercentage,
  getCircleSize,
  resolveProgressView
} from '@expcat/tigercat-core'

describe('progress-utils', () => {
  it('clamps non-finite percentages to 0', () => {
    expect(clampPercentage(Number.NaN)).toBe(0)
    expect(clampPercentage(Number.POSITIVE_INFINITY)).toBe(0)
    expect(clampPercentage(-20)).toBe(0)
    expect(clampPercentage(150)).toBe(100)
  })

  it('keeps circle stroke inside the size', () => {
    expect(getCircleSize('sm', 400).radius).toBeGreaterThan(0)
    expect(getCircleSize('md', Number.NaN).strokeWidth).toBe(6)
  })

  it('rounds visible value, bar, and valuenow together', () => {
    const view = resolveProgressView({
      percentage: 49.6,
      widgetName: 'Progress'
    })
    expect(view.percentage).toBe(50)
    expect(view.valueNow).toBe(50)
    expect(view.displayText).toBe('50%')
    expect(view.ariaLabel).toBe('Progress')
  })

  it('puts custom text in valuetext, not the name', () => {
    const view = resolveProgressView({
      percentage: 50,
      text: '进行中',
      widgetName: 'Progress'
    })
    expect(view.ariaLabel).toBe('Progress')
    expect(view.valueText).toBe('进行中')
  })

  it('pauses striped animation when status is paused', () => {
    const view = resolveProgressView({
      percentage: 40,
      striped: true,
      stripedAnimation: true,
      status: 'paused',
      widgetName: 'Progress'
    })
    expect(view.paused).toBe(true)
    expect(view.stripedAnimated).toBe(false)
  })
})
