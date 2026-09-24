import { describe, it, expect } from 'vitest'
import { modernTheme, defaultTheme, themeTransitionValue } from '@expcat/tigercat-core'
import {
  createTigercatPlugin,
  tigercatPlugin,
  tigercatTheme,
  tigercatDarkTheme
} from '../../packages/core/src/tailwind-plugin'

describe('Modern theme preset', () => {
  it('is one preset on the shared token shape', () => {
    expect(modernTheme.name).toBe('modern')
    expect(modernTheme.label).toBe('Modern')
    expect(modernTheme.light.radius?.md).toBe('12px')
    expect(modernTheme.light.radius?.lg).toBe('16px')
    expect(modernTheme.light.shadows?.lg).toContain('rgb(0 0 0 / 0.08)')
    expect(modernTheme.light.motion?.easing).toBe('cubic-bezier(0.2, 0, 0, 1)')
    expect(modernTheme.light.motion?.durationSlow).toBe('300ms')
    expect(modernTheme.dark.colors?.surface).toBe('#0f172a')
  })

  it('keeps Tailwind plugin defaults derived from the default preset', () => {
    expect(tigercatTheme['--tiger-primary']).toBe(defaultTheme.light.colors?.primary)
    expect(tigercatTheme['--tiger-surface']).toBe(defaultTheme.light.colors?.surface)
    expect(tigercatTheme['--tiger-radius-md']).toBe(defaultTheme.light.radius?.md)
    expect(tigercatDarkTheme['--tiger-primary']).toBe(defaultTheme.dark.colors?.primary)
    expect(tigercatDarkTheme['--tiger-surface']).toBe(defaultTheme.dark.colors?.surface)
    expect(tigercatDarkTheme['--tiger-radius-md']).toBe(defaultTheme.dark.radius?.md)
  })
})

describe('createTigercatPlugin presets', () => {
  type AddBaseFn = (rules: Record<string, Record<string, string>>) => void
  type PluginCallback = (api: { addBase: AddBaseFn }) => void
  type PluginInstance = { handler: PluginCallback }

  function captureRules(p: PluginInstance) {
    const rules: Record<string, Record<string, string>> = {}
    p.handler({
      addBase: (rule) => Object.assign(rules, rule)
    })
    return rules
  }

  it('default plugin writes the default preset and no second style layer', () => {
    const rules = captureRules(tigercatPlugin as PluginInstance)
    expect(rules[':root']?.['--tiger-radius-md']).toBe(defaultTheme.light.radius?.md)
    expect(rules[':root']?.['--tiger-primary']).toBe(defaultTheme.light.colors?.primary)
    expect(rules['.dark']?.['--tiger-radius-md']).toBe(defaultTheme.dark.radius?.md)
    expect(rules['[data-tiger-style="modern"]']).toBeUndefined()
    expect(rules['@media (prefers-reduced-motion: reduce)']).toBeDefined()
  })

  it('createTigercatPlugin({ preset: modernTheme }) writes that preset at :root and .dark', () => {
    const rules = captureRules(createTigercatPlugin({ preset: modernTheme }) as PluginInstance)
    expect(rules[':root']?.['--tiger-primary']).toBe(modernTheme.light.colors?.primary)
    expect(rules[':root']?.['--tiger-radius-md']).toBe(modernTheme.light.radius?.md)
    expect(rules[':root']?.['--tiger-transition-base']).toBe(
      themeTransitionValue('200ms', 'cubic-bezier(0.2, 0, 0, 1)')
    )
    expect(rules[':root']?.['--tiger-transition-base']).not.toContain('all ')
    expect(rules['.dark']?.['--tiger-surface']).toBe(modernTheme.dark.colors?.surface)
    expect(rules['.dark']?.['--tiger-radius-md']).toBe(modernTheme.dark.radius?.md)
    expect(rules['[data-tiger-style="modern"]']).toBeUndefined()
  })
})
