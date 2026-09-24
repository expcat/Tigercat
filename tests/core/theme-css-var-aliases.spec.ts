/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, afterEach } from 'vitest'
import {
  THEME_CSS_VARS,
  themeConfigToCssVars,
  createTigerThemeScope,
  defaultTheme
} from '@expcat/tigercat-core'
import { tigercatTheme, tigercatDarkTheme, tigercatPlugin } from '../../packages/core/src/tailwind-plugin'

const lightColors = defaultTheme.light.colors
const darkColors = defaultTheme.dark.colors

const REMOVED_ALIAS_KEYS = ['textMuted', 'fill', 'bg'] as const
const REMOVED_ALIAS_VARS = ['--tiger-text-muted', '--tiger-fill', '--tiger-bg'] as const

function capturePluginBase(): Record<string, Record<string, string>> {
  type AddBaseFn = (rules: Record<string, Record<string, string>>) => void
  type PluginInstance = { handler: (api: { addBase: AddBaseFn }) => void }
  const rules: Record<string, Record<string, string>> = {}
  const plugin = tigercatPlugin as unknown as PluginInstance
  plugin.handler({
    addBase: (rule) => Object.assign(rules, rule)
  })
  return rules
}

describe('theme CSS variables have one name each', () => {
  it('does not register textMuted / fill / bg aliases', () => {
    for (const key of REMOVED_ALIAS_KEYS) {
      expect(THEME_CSS_VARS).not.toHaveProperty(key)
    }
    const names = Object.values(THEME_CSS_VARS)
    for (const alias of REMOVED_ALIAS_VARS) {
      expect(names).not.toContain(alias)
    }
  })

  it('themeConfigToCssVars emits canonical surface and text tokens only', () => {
    const light = themeConfigToCssVars(defaultTheme.light)
    const dark = themeConfigToCssVars(defaultTheme.dark)

    for (const vars of [light, dark]) {
      for (const alias of REMOVED_ALIAS_VARS) {
        expect(vars).not.toHaveProperty(alias)
      }
    }

    expect(light[THEME_CSS_VARS.textSecondary]).toBe(lightColors?.textSecondary)
    expect(light[THEME_CSS_VARS.surfaceMuted]).toBe(lightColors?.surfaceMuted)
    expect(light[THEME_CSS_VARS.surface]).toBe(lightColors?.surface)
    expect(dark[THEME_CSS_VARS.textSecondary]).toBe(darkColors?.textSecondary)
    expect(dark[THEME_CSS_VARS.surfaceMuted]).toBe(darkColors?.surfaceMuted)
    expect(dark[THEME_CSS_VARS.surface]).toBe(darkColors?.surface)
    expect(dark[THEME_CSS_VARS.surface]).toBe('#111827')
  })

  it('plugin :root and .dark omit the removed aliases', () => {
    const rules = capturePluginBase()
    const root = rules[':root']
    const dark = rules['.dark']
    expect(root?.[THEME_CSS_VARS.surface]).toBe(lightColors?.surface)
    expect(dark?.[THEME_CSS_VARS.surface]).toBe(darkColors?.surface)
    for (const alias of REMOVED_ALIAS_VARS) {
      expect(root).not.toHaveProperty(alias)
      expect(dark).not.toHaveProperty(alias)
      expect(tigercatTheme).not.toHaveProperty(alias)
      expect(tigercatDarkTheme).not.toHaveProperty(alias)
    }
  })

  it('writes on-color, error interaction, and breakpoint tokens', () => {
    const rules = capturePluginBase()
    const root = rules[':root']
    expect(root?.[THEME_CSS_VARS.primaryForeground]).toBe(lightColors?.primaryForeground)
    expect(root?.[THEME_CSS_VARS.errorHover]).toBe(lightColors?.errorHover)
    expect(root?.[THEME_CSS_VARS.breakpointMd]).toBe('768px')
    expect(root?.[THEME_CSS_VARS.breakpoint2xl]).toBe('1536px')
    expect(rules['.dark']?.[THEME_CSS_VARS.primaryForeground]).toBe(darkColors?.primaryForeground)
  })
})

describe('theme scope writes canonical variables', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style')
    document.documentElement.classList.remove('dark')
  })

  it('setTheme writes --tiger-surface and not the removed aliases', () => {
    const scope = createTigerThemeScope()
    scope.setColorScheme('light')
    scope.setTheme('default')
    const root = document.documentElement
    expect(root.style.getPropertyValue(THEME_CSS_VARS.surface)).toBe(lightColors?.surface)
    for (const alias of REMOVED_ALIAS_VARS) {
      expect(root.style.getPropertyValue(alias)).toBe('')
    }

    scope.setColorScheme('dark')
    expect(root.style.getPropertyValue(THEME_CSS_VARS.surface)).toBe(darkColors?.surface)
    expect(root.style.getPropertyValue(THEME_CSS_VARS.surface)).not.toBe('#ffffff')
    scope.dispose()
  })
})
