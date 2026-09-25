import { describe, expect, it } from 'vitest'
import {
  clampPercentage,
  getCircleSize,
  progressLineBaseClasses,
  progressLineSizeClasses,
  progressMetricVars,
  resolveProgressView
} from '@expcat/tigercat-core'
import { tigercatPlugin } from '../../packages/core/src/tailwind-plugin'

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

  it('gives the line track a real height when the metric variable is unset', () => {
    expect(progressLineSizeClasses.sm).toBe('h-[var(--tiger-component-progress-height-sm,4px)]')
    expect(progressLineSizeClasses.md).toBe('h-[var(--tiger-component-progress-height-md,8px)]')
    expect(progressLineSizeClasses.lg).toBe('h-[var(--tiger-component-progress-height-lg,12px)]')
    expect(progressLineBaseClasses).toContain(
      'rounded-[var(--tiger-component-progress-border-radius,9999px)]'
    )

    type AddBaseFn = (rules: Record<string, Record<string, string>>) => void
    type PluginInstance = { handler: (api: { addBase: AddBaseFn }) => void }
    const rules: Record<string, Record<string, string>> = {}
    ;(tigercatPlugin as unknown as PluginInstance).handler({
      addBase: (rule) => Object.assign(rules, rule)
    })
    const root = rules[':root']
    for (const [name, value] of Object.entries(progressMetricVars)) {
      expect(root?.[name]).toBe(value)
      expect(value).toMatch(/^\d+(\.\d+)?(px|rem)$/)
    }
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
