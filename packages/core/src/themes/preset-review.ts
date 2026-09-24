/**
 * Checklist for a named preset. This is not a screenshot test.
 * Missing accent steps, radius base, density, or shadow steps become warnings.
 */

import type { ThemePreset } from '../types/theme'
import { ACCENT_STEP_COUNT, SHADOW_STEP_COUNT, type AccentScale } from '../utils/accent-scale'
import { defaultTheme, defaultThemeScale } from './default/theme'
import { vibrantThemeScale } from './vibrant/theme'
import { professionalThemeScale } from './professional/theme'
import { minimalThemeScale } from './minimal/theme'
import { naturalThemeScale } from './natural/theme'
import { modernThemeScale } from './modern/theme'
import { highContrastThemeScale } from './high-contrast/theme'

const presetScales: Record<string, AccentScale> = {
  default: defaultThemeScale,
  vibrant: vibrantThemeScale,
  professional: professionalThemeScale,
  minimal: minimalThemeScale,
  natural: naturalThemeScale,
  modern: modernThemeScale,
  'high-contrast': highContrastThemeScale
}

function isThemePreset(value: PresetReviewTarget | ThemePreset): value is ThemePreset {
  return 'light' in value && 'dark' in value && typeof value.name === 'string'
}

export interface PresetReviewTarget {
  name?: string
  accent?: readonly string[]
  radiusBase?: string
  density?: number
  shadow?: readonly string[]
  lightRadius?: string
}

export function reviewPreset(preset: PresetReviewTarget | ThemePreset): string[] {
  if (isThemePreset(preset)) return reviewNamedPreset(preset, presetScales[preset.name])
  const warnings: string[] = []
  if (!preset.accent || preset.accent.length < ACCENT_STEP_COUNT) {
    warnings.push('missing accent steps')
  }
  const radius = preset.radiusBase ?? preset.lightRadius
  if (!radius) warnings.push('missing radius base')
  if (preset.density === undefined || !Number.isFinite(preset.density)) {
    warnings.push('missing density')
  }
  if (!preset.shadow || preset.shadow.length < SHADOW_STEP_COUNT) {
    warnings.push('missing shadow steps')
  }
  return warnings
}

export { defaultTheme }

export function reviewNamedPreset(preset: ThemePreset, scale: AccentScale | undefined): string[] {
  return reviewPreset({
    name: preset.name,
    accent: scale?.accent,
    radiusBase: scale?.radius.base ?? preset.light.radius?.md,
    density: scale?.density,
    shadow: scale?.shadow,
    lightRadius: preset.light.radius?.md
  })
}
