import type { ThemePreset, ThemeSemanticColors } from '../../types/theme'
import { runtimeThemeDark, runtimeThemeLight } from '../../tokens/tokens'
import { deriveAccentScale } from '../../utils/accent-scale'

export const defaultThemeKnobs = {
  accent: '#2563eb',
  neutral: '#737373',
  radius: '6px',
  density: 1
} as const

export const defaultThemeScale = deriveAccentScale(defaultThemeKnobs.accent, {
  neutral: defaultThemeKnobs.neutral,
  radius: defaultThemeKnobs.radius,
  density: defaultThemeKnobs.density
})

export const defaultThemeLightColors: ThemeSemanticColors = {
  ...runtimeThemeLight.colors
}

export const defaultThemeDarkColors: ThemeSemanticColors = {
  ...runtimeThemeDark.colors
}

/**
 * Default theme — generated from `tokens.json` `runtime.light` / `runtime.dark`.
 * Suitable for enterprise apps, SaaS dashboards, and admin panels.
 */
export const defaultTheme: ThemePreset = {
  name: 'default',
  label: 'Default',
  light: {
    colors: defaultThemeLightColors,
    typography: { ...runtimeThemeLight.typography },
    radius: { ...runtimeThemeLight.radius },
    shadows: { ...runtimeThemeLight.shadows },
    spacing: { ...runtimeThemeLight.spacing },
    motion: { ...runtimeThemeLight.motion }
  },
  dark: {
    colors: defaultThemeDarkColors,
    typography: { ...runtimeThemeDark.typography },
    radius: { ...runtimeThemeDark.radius },
    shadows: { ...runtimeThemeDark.shadows },
    spacing: { ...runtimeThemeDark.spacing },
    motion: { ...runtimeThemeDark.motion }
  }
}
