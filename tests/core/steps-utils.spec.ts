/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  calculateStepStatus,
  clampStepCurrent,
  getStepIconColumnClasses,
  getStepItemClasses,
  getStepSizeDataValue,
  getStepSizeToken,
  getStepTailClasses,
  stepConnectorBaseStyles,
  tigercatPlugin
} from '@expcat/tigercat-core'

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

describe('Steps connector class tokens', () => {
  it('maps size + simple to stable modifier tokens', () => {
    expect(getStepSizeToken('default', false)).toBe('md')
    expect(getStepSizeToken('small', false)).toBe('sm')
    expect(getStepSizeToken('small', true)).toBe('simple')
    expect(getStepSizeDataValue('small', false)).toBe('small')
    expect(getStepSizeDataValue('default', true)).toBe('simple')
  })

  it('returns semantic vertical tail tokens and does not emit JIT insets', () => {
    const vertical = getStepTailClasses('vertical', 'process', false, 'small', false)
    expect(vertical.split(' ')).toEqual(
      expect.arrayContaining([
        'tiger-step-tail',
        'tiger-step-tail--vertical',
        'tiger-step-tail--sm',
        'tiger-step-tail--wait'
      ])
    )
    expect(vertical).not.toMatch(/inset-inline-start/)
    expect(vertical).not.toMatch(/left-1\/2/)
    expect(vertical).not.toMatch(/translate-x/)
    expect(vertical).not.toMatch(/top-8/)
  })

  it('returns semantic horizontal tail tokens (purge-proof)', () => {
    const horizontal = getStepTailClasses('horizontal', 'finish', false, 'default', false)
    expect(horizontal).toContain('tiger-step-tail--horizontal')
    expect(horizontal).toContain('tiger-step-tail--md')
    expect(horizontal).toContain('tiger-step-tail--finish')
    expect(horizontal).not.toMatch(/inset-inline-start/)
    expect(horizontal).not.toMatch(/left-1\/2/)
  })

  it('hides the last tail with a semantic modifier', () => {
    expect(getStepTailClasses('vertical', 'wait', true, 'default', false)).toBe(
      'tiger-step-tail tiger-step-tail--last'
    )
  })

  it('sizes the icon column with semantic modifiers', () => {
    expect(getStepIconColumnClasses('small', false)).toBe(
      'tiger-step-icon-col tiger-step-icon-col--sm'
    )
    expect(getStepIconColumnClasses('default', true)).toBe(
      'tiger-step-icon-col tiger-step-icon-col--simple'
    )
    expect(getStepItemClasses('vertical', false)).toContain('tiger-step-item--gap')
    expect(getStepItemClasses('vertical', true)).not.toContain('tiger-step-item--gap')
  })
})

describe('Steps connector plugin geometry', () => {
  it('centers the vertical tail on the icon column', () => {
    expect(stepConnectorBaseStyles['.tiger-step-tail--vertical']).toMatchObject({
      left: '50%',
      transform: 'translateX(-50%)',
      width: '0.125rem'
    })
    expect(stepConnectorBaseStyles['.tiger-step-tail--horizontal']).toMatchObject({
      left: '50%',
      height: '0.125rem',
      width: '100%'
    })
  })

  it('is injected by the default Tailwind plugin', () => {
    const rules: Record<string, unknown> = {}
    type PluginInstance = {
      handler: (api: { addBase: (rule: Record<string, unknown>) => void }) => void
    }
    const plugin = tigercatPlugin as unknown as PluginInstance
    plugin.handler({ addBase: (rule) => Object.assign(rules, rule) })
    expect(rules['.tiger-step-tail--vertical']).toMatchObject({
      left: '50%',
      transform: 'translateX(-50%)'
    })
    expect(rules['.tiger-step-icon-col--sm']).toMatchObject({ width: '2rem' })
  })
})
