import { describe, it, expect } from 'vitest'
import {
  modernTheme,
  MODERN_BASE_TOKENS_LIGHT,
  MODERN_BASE_TOKENS_DARK,
  MODERN_OVERRIDE_TOKENS_LIGHT,
  MODERN_OVERRIDE_TOKENS_DARK,
  MODERN_REDUCED_MOTION_TOKENS,
  createTigercatPlugin,
  tigercatPlugin
} from '@expcat/tigercat-core'

describe('Modern theme tokens', () => {
  it('exposes all required radius / shadow / motion / blur / gradient tokens in base layer', () => {
    const requiredKeys = [
      '--tiger-radius-sm',
      '--tiger-radius-md',
      '--tiger-radius-lg',
      '--tiger-radius-xl',
      '--tiger-radius-pill',
      '--tiger-shadow-sm',
      '--tiger-shadow-md',
      '--tiger-shadow-lg',
      '--tiger-shadow-xl',
      '--tiger-shadow-glass',
      '--tiger-shadow-glass-strong',
      '--tiger-blur-glass',
      '--tiger-blur-glass-strong',
      '--tiger-gradient-primary',
      '--tiger-gradient-surface',
      '--tiger-gradient-danger',
      '--tiger-motion-duration-instant',
      '--tiger-motion-duration-quick',
      '--tiger-motion-duration-base',
      '--tiger-motion-duration-relaxed',
      '--tiger-motion-duration-slow',
      '--tiger-motion-ease-standard',
      '--tiger-motion-ease-decelerate',
      '--tiger-motion-ease-accelerate',
      '--tiger-motion-ease-emphasized',
      '--tiger-motion-ease-spring',
      '--tiger-transition-base',
      '--tiger-transition-quick',
      '--tiger-transition-emphasized'
    ]

    for (const key of requiredKeys) {
      expect(MODERN_BASE_TOKENS_LIGHT[key]).toBeDefined()
    }
  })

  it('base layer fallback values keep current visual (no glass blur, base radius 0.5rem)', () => {
    expect(MODERN_BASE_TOKENS_LIGHT['--tiger-radius-md']).toBe('0.5rem')
    expect(MODERN_BASE_TOKENS_LIGHT['--tiger-blur-glass']).toBe('0px')
    expect(MODERN_BASE_TOKENS_LIGHT['--tiger-blur-glass-strong']).toBe('0px')
  })

  it('override layer applies modern values (rounder corners, real glass blur)', () => {
    expect(MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-radius-md']).toBe('12px')
    expect(MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-radius-lg']).toBe('16px')
    expect(MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-blur-glass']).toBe('16px')
    expect(MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-shadow-glass']).toContain('inset 0 1px 0')
  })

  it('dark base/override only redefines shadows (colors stay opt-in)', () => {
    expect(MODERN_BASE_TOKENS_DARK['--tiger-shadow-sm']).toContain('rgb(0 0 0 / 0.2)')
    expect(MODERN_OVERRIDE_TOKENS_DARK['--tiger-shadow-glass']).toContain('rgb(0 0 0 / 0.4)')
  })

  it('reduced-motion overrides collapse all durations to 0ms', () => {
    expect(MODERN_REDUCED_MOTION_TOKENS['--tiger-motion-duration-base']).toBe('0ms')
    expect(MODERN_REDUCED_MOTION_TOKENS['--tiger-motion-duration-slow']).toBe('0ms')
  })

  it('modernTheme preset exposes name + label + radius + shadows + motion', () => {
    expect(modernTheme.name).toBe('modern')
    expect(modernTheme.label).toBe('Modern')
    expect(modernTheme.light.radius?.md).toBe('12px')
    expect(modernTheme.light.shadows?.lg).toContain('rgb(0 0 0 / 0.08)')
    expect(modernTheme.light.motion?.easing).toBe('cubic-bezier(0.2, 0, 0, 1)')
    expect(modernTheme.dark.colors?.surface).toBe('#0f172a')
  })
})

describe('createTigercatPlugin modern option', () => {
  type AddBaseFn = (rules: Record<string, Record<string, string>>) => void
  type PluginCallback = (api: { addBase: AddBaseFn }) => void
  type PluginInstance = { handler: PluginCallback }

  function captureRules(p: { handler?: PluginCallback } | PluginInstance) {
    const rules: Record<string, Record<string, string>> = {}
    const addBase: AddBaseFn = (rule) => Object.assign(rules, rule)
    const handler = (p as PluginInstance).handler ?? (p as { handler?: PluginCallback }).handler
    if (typeof handler === 'function') {
      handler({ addBase })
    }
    return rules
  }

  it('default tigercatPlugin always emits MODERN_BASE_TOKENS in :root', () => {
    const rules = captureRules(tigercatPlugin as PluginInstance)
    expect(rules[':root']?.['--tiger-radius-md']).toBe('0.5rem')
    expect(rules[':root']?.['--tiger-shadow-glass']).toBeDefined()
    expect(rules['.dark']?.['--tiger-shadow-md']).toBeDefined()
  })

  it('createTigercatPlugin without modern flag does NOT emit override block', () => {
    const rules = captureRules(createTigercatPlugin())
    expect(rules['[data-tiger-style="modern"]']).toBeUndefined()
  })

  it('createTigercatPlugin({ modern: true }) emits override + reduced-motion block', () => {
    const rules = captureRules(createTigercatPlugin({ modern: true }))
    expect(rules['[data-tiger-style="modern"]']?.['--tiger-radius-md']).toBe('12px')
    expect(
      rules['.dark[data-tiger-style="modern"], [data-tiger-style="modern"].dark']?.[
        '--tiger-shadow-glass'
      ]
    ).toContain('rgb(0 0 0 / 0.4)')
    expect(rules['@media (prefers-reduced-motion: reduce)']).toBeDefined()
  })

  it('createTigercatPlugin({ preset: modernTheme }) maps preset colors into :root', () => {
    const rules = captureRules(createTigercatPlugin({ preset: modernTheme }))
    expect(rules[':root']?.['--tiger-primary']).toBe('#2563eb')
    expect(rules[':root']?.['--tiger-radius-md']).toBe('0.5rem')
    expect(rules['.dark']?.['--tiger-surface']).toBe('#0f172a')
  })
})
