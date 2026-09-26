/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  calculateStepStatus,
  clampStepCurrent,
  getStepIconClasses,
  getStepIconColumnClasses,
  getStepItemClasses,
  getStepSizeDataValue,
  getStepSizeToken,
  getStepTailClasses,
  stepConnectorBaseStyles
} from '@expcat/tigercat-core'
import { tigercatPlugin } from '../../packages/core/src/tailwind-plugin'

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
    expect(getStepSizeToken('md', false)).toBe('md')
    expect(getStepSizeToken('lg', false)).toBe('lg')
    expect(getStepSizeToken('sm', false)).toBe('sm')
    expect(getStepSizeToken('lg', true)).toBe('simple')
    expect(getStepSizeToken('sm', true)).toBe('simple')
    expect(getStepSizeDataValue('sm', false)).toBe('sm')
    expect(getStepSizeDataValue('md', true)).toBe('simple')
  })

  it('returns semantic vertical tail tokens and does not emit JIT insets', () => {
    const vertical = getStepTailClasses('vertical', 'process', false, 'sm', false)
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
    const horizontal = getStepTailClasses('horizontal', 'finish', false, 'md', false)
    expect(horizontal).toContain('tiger-step-tail--horizontal')
    expect(horizontal).toContain('tiger-step-tail--md')
    expect(horizontal).toContain('tiger-step-tail--finish')
    expect(horizontal).not.toMatch(/inset-inline-start/)
    expect(horizontal).not.toMatch(/left-1\/2/)
  })

  it('centers a dot tail on the 10px marker', () => {
    const tail = getStepTailClasses('horizontal', 'finish', false, 'md', false, true)
    expect(tail).toContain('tiger-step-tail--dot')
    expect(tail).not.toContain('tiger-step-tail--md')
    const dot = getStepIconClasses('error', 'md', false, false, true)
    expect(dot).toContain('tiger-step-icon--dot')
    expect(dot).toContain('bg-[var(--tiger-error)]')
    expect(dot).not.toContain('ring-4')
    expect(dot).not.toContain('border-2')
  })

  it('hides the last tail with a semantic modifier', () => {
    expect(getStepTailClasses('vertical', 'wait', true, 'md', false)).toBe(
      'tiger-step-tail tiger-step-tail--last'
    )
  })

  it('sizes the icon column with semantic modifiers', () => {
    expect(getStepIconColumnClasses('sm', false)).toBe(
      'tiger-step-icon-col tiger-step-icon-col--sm'
    )
    expect(getStepIconColumnClasses('lg', false)).toBe(
      'tiger-step-icon-col tiger-step-icon-col--lg'
    )
    expect(getStepIconColumnClasses('md', true)).toBe(
      'tiger-step-icon-col tiger-step-icon-col--simple'
    )
    expect(getStepTailClasses('horizontal', 'process', false, 'lg', false)).toContain(
      'tiger-step-tail--lg'
    )
    expect(getStepItemClasses('vertical', false)).toContain('tiger-step-item--gap')
    expect(getStepItemClasses('vertical', true)).not.toContain('tiger-step-item--gap')
  })
})

describe('Steps connector plugin geometry', () => {
  it('centers the vertical tail on the icon column', () => {
    expect(stepConnectorBaseStyles['.tiger-step-tail--vertical']).toMatchObject({
      insetInlineStart: '50%',
      transform: 'translateX(-50%)',
      inlineSize: '0.125rem'
    })
    expect(stepConnectorBaseStyles['.tiger-step-tail--horizontal']).toMatchObject({
      insetInlineStart: '50%',
      blockSize: '0.125rem',
      inlineSize: '100%'
    })
  })

  it('ships connector geometry through the tailwind plugin', () => {
    const rules: Record<string, unknown> = {}
    type PluginInstance = {
      handler: (api: { addBase: (rule: Record<string, unknown>) => void }) => void
    }
    const plugin = tigercatPlugin as unknown as PluginInstance
    plugin.handler({ addBase: (rule) => Object.assign(rules, rule) })
    expect(rules['.tiger-step-tail--vertical']).toMatchObject({
      insetInlineStart: '50%',
      transform: 'translateX(-50%)',
      inlineSize: '0.125rem',
      insetBlockStart: 'var(--tiger-step-icon-size)',
      insetBlockEnd: 'calc(-1 * var(--tiger-step-gap))'
    })
    expect(rules['.tiger-step-tail--horizontal']).toMatchObject({
      insetInlineStart: '50%',
      inlineSize: '100%',
      blockSize: '0.125rem',
      transform: 'translateY(-50%)'
    })
    expect(rules['.tiger-step-icon-col--lg']).toMatchObject({
      width: '3rem',
      '--tiger-step-icon-size': '3rem'
    })
    expect(rules['.tiger-step-tail--finish']).toMatchObject({
      backgroundColor: 'var(--tiger-primary)'
    })
    expect(rules['.tiger-step-tail--wait']).toMatchObject({
      backgroundColor: 'var(--tiger-border)'
    })
  })
})
