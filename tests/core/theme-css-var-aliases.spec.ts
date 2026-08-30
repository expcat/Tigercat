/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  THEME_CSS_VARS,
  themeConfigToCssVars,
  tigercatTheme,
  tigercatDarkTheme,
  tigercatPlugin,
  ThemeManager,
  defaultTheme
} from '@expcat/tigercat-core'

const lightColors = defaultTheme.light.colors
const darkColors = defaultTheme.dark.colors

const ALIAS_VARS = {
  textMuted: '--tiger-text-muted',
  fill: '--tiger-fill',
  bg: '--tiger-bg'
} as const

function resolveThemeVar(vars: Record<string, string>, name: string): string | undefined {
  let current = vars[name]
  const seen = new Set<string>()
  while (current) {
    const match = /^var\((--[a-z0-9-]+)\)$/i.exec(current.trim())
    if (!match) return current
    if (seen.has(match[1])) return current
    seen.add(match[1])
    current = vars[match[1]]
  }
  return current
}

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

describe('theme CSS var aliases (T1 A0)', () => {
  it('registers --tiger-text-muted / --tiger-fill / --tiger-bg on THEME_CSS_VARS', () => {
    expect(THEME_CSS_VARS.textMuted).toBe(ALIAS_VARS.textMuted)
    expect(THEME_CSS_VARS.fill).toBe(ALIAS_VARS.fill)
    expect(THEME_CSS_VARS.bg).toBe(ALIAS_VARS.bg)
    expect(Object.values(THEME_CSS_VARS)).toEqual(
      expect.arrayContaining([ALIAS_VARS.textMuted, ALIAS_VARS.fill, ALIAS_VARS.bg])
    )
  })

  it('themeConfigToCssVars emits var() aliases for default light and dark configs', () => {
    const light = themeConfigToCssVars(defaultTheme.light)
    const dark = themeConfigToCssVars(defaultTheme.dark)

    for (const vars of [light, dark]) {
      expect(vars[ALIAS_VARS.textMuted]).toBe(`var(${THEME_CSS_VARS.textSecondary})`)
      expect(vars[ALIAS_VARS.fill]).toBe(`var(${THEME_CSS_VARS.surfaceMuted})`)
      expect(vars[ALIAS_VARS.bg]).toBe(`var(${THEME_CSS_VARS.surface})`)
    }

    expect(light[THEME_CSS_VARS.textSecondary]).toBe(lightColors?.textSecondary)
    expect(light[THEME_CSS_VARS.surfaceMuted]).toBe(lightColors?.surfaceMuted)
    expect(light[THEME_CSS_VARS.surface]).toBe(lightColors?.surface)

    expect(dark[THEME_CSS_VARS.textSecondary]).toBe(darkColors?.textSecondary)
    expect(dark[THEME_CSS_VARS.surfaceMuted]).toBe(darkColors?.surfaceMuted)
    expect(dark[THEME_CSS_VARS.surface]).toBe(darkColors?.surface)

    expect(resolveThemeVar(dark, ALIAS_VARS.bg)).toBe(dark[THEME_CSS_VARS.surface])
    expect(resolveThemeVar(dark, ALIAS_VARS.bg)).not.toMatch(/^(#fff(?:fff)?|white)$/i)
    expect(resolveThemeVar(dark, ALIAS_VARS.bg)).toBe('#111827')
  })

  it('tigercatTheme and tigercatDarkTheme include the three aliases', () => {
    for (const vars of [tigercatTheme, tigercatDarkTheme]) {
      expect(vars[ALIAS_VARS.textMuted]).toBe(`var(${THEME_CSS_VARS.textSecondary})`)
      expect(vars[ALIAS_VARS.fill]).toBe(`var(${THEME_CSS_VARS.surfaceMuted})`)
      expect(vars[ALIAS_VARS.bg]).toBe(`var(${THEME_CSS_VARS.surface})`)
    }

    expect(resolveThemeVar(tigercatTheme, ALIAS_VARS.textMuted)).toBe(lightColors?.textSecondary)
    expect(resolveThemeVar(tigercatTheme, ALIAS_VARS.fill)).toBe(lightColors?.surfaceMuted)
    expect(resolveThemeVar(tigercatTheme, ALIAS_VARS.bg)).toBe(lightColors?.surface)

    expect(resolveThemeVar(tigercatDarkTheme, ALIAS_VARS.textMuted)).toBe(darkColors?.textSecondary)
    expect(resolveThemeVar(tigercatDarkTheme, ALIAS_VARS.fill)).toBe(darkColors?.surfaceMuted)
    expect(resolveThemeVar(tigercatDarkTheme, ALIAS_VARS.bg)).toBe(darkColors?.surface)
    expect(resolveThemeVar(tigercatDarkTheme, ALIAS_VARS.bg)).toBe(
      tigercatDarkTheme[THEME_CSS_VARS.surface]
    )
    expect(tigercatDarkTheme[THEME_CSS_VARS.surface]).not.toBe('#ffffff')
    expect(tigercatDarkTheme[THEME_CSS_VARS.surface]).toBe('#111827')
  })

  it('Tailwind plugin writes the aliases on :root and .dark', () => {
    const rules = capturePluginBase()
    const root = rules[':root']
    const dark = rules['.dark']
    expect(root).toBeDefined()
    expect(dark).toBeDefined()

    expect(root?.[ALIAS_VARS.bg]).toBe(`var(${THEME_CSS_VARS.surface})`)
    expect(root?.[ALIAS_VARS.fill]).toBe(`var(${THEME_CSS_VARS.surfaceMuted})`)
    expect(root?.[ALIAS_VARS.textMuted]).toBe(`var(${THEME_CSS_VARS.textSecondary})`)
    expect(root?.[THEME_CSS_VARS.surface]).toBe(lightColors?.surface)

    expect(dark?.[ALIAS_VARS.bg]).toBe(`var(${THEME_CSS_VARS.surface})`)
    expect(dark?.[ALIAS_VARS.fill]).toBe(`var(${THEME_CSS_VARS.surfaceMuted})`)
    expect(dark?.[ALIAS_VARS.textMuted]).toBe(`var(${THEME_CSS_VARS.textSecondary})`)
    expect(dark?.[THEME_CSS_VARS.surface]).toBe(darkColors?.surface)
    expect(resolveThemeVar(dark ?? {}, ALIAS_VARS.bg)).toBe(dark?.[THEME_CSS_VARS.surface])
    expect(resolveThemeVar(dark ?? {}, ALIAS_VARS.bg)).not.toBe('#ffffff')
  })

  it('writes on-color, error interaction, and breakpoint tokens', () => {
    const rules = capturePluginBase()
    const root = rules[':root']
    expect(root?.[THEME_CSS_VARS.primaryForeground]).toBe(
      lightColors?.primaryForeground
    )
    expect(root?.[THEME_CSS_VARS.errorHover]).toBe(lightColors?.errorHover)
    expect(root?.[THEME_CSS_VARS.breakpointMd]).toBe('768px')
    expect(rules['.dark']?.[THEME_CSS_VARS.primaryForeground]).toBe(
      darkColors?.primaryForeground
    )
  })
})

describe('ThemeManager.apply emits alias vars', () => {
  beforeEach(() => {
    ThemeManager.setColorScheme('light')
    ThemeManager.setTheme('default')
  })

  afterEach(() => {
    ThemeManager.setColorScheme('light')
    ThemeManager.setTheme('default')
    const root = document.documentElement
    for (const name of Object.values(THEME_CSS_VARS)) {
      root.style.removeProperty(name)
    }
    root.classList.remove('dark')
  })

  it('applies light aliases and dark --tiger-bg equal to dark --tiger-surface', () => {
    const root = document.documentElement
    expect(root.style.getPropertyValue(ALIAS_VARS.bg)).toBe(`var(${THEME_CSS_VARS.surface})`)
    expect(root.style.getPropertyValue(THEME_CSS_VARS.surface)).toBe(lightColors?.surface)

    ThemeManager.setColorScheme('dark')
    expect(root.style.getPropertyValue(ALIAS_VARS.bg)).toBe(`var(${THEME_CSS_VARS.surface})`)
    expect(root.style.getPropertyValue(THEME_CSS_VARS.surface)).toBe(darkColors?.surface)
    expect(root.style.getPropertyValue(THEME_CSS_VARS.surface)).not.toBe('#ffffff')
    expect(root.style.getPropertyValue(ALIAS_VARS.fill)).toBe(`var(${THEME_CSS_VARS.surfaceMuted})`)
    expect(root.style.getPropertyValue(ALIAS_VARS.textMuted)).toBe(
      `var(${THEME_CSS_VARS.textSecondary})`
    )
  })
})
