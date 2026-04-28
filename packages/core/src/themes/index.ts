/**
 * Tigercat Theme System
 *
 * Provides 5 built-in preset themes, a ThemeManager singleton for runtime
 * switching, and type definitions for custom themes.
 *
 * @module themes
 * @since 0.7.0
 *
 * @example
 * ```ts
 * import { ThemeManager } from '@expcat/tigercat-core'
 *
 * // Switch to a built-in preset
 * ThemeManager.setTheme('vibrant')
 *
 * // Enable automatic dark mode
 * ThemeManager.setColorScheme('auto')
 *
 * // Define a custom theme
 * ThemeManager.defineTheme({
 *   name: 'brand',
 *   label: 'Brand',
 *   light: { colors: { primary: '#ff6600' } },
 *   dark:  { colors: { primary: '#ff9933' } }
 * })
 * ```
 */

// Re-export manager
export { ThemeManager } from './manager'
export type { ThemeChangeEvent, ThemeChangeListener } from './manager'

// Re-export preset themes
export { defaultTheme } from './default/theme'
export { vibrantTheme } from './vibrant/theme'
export { professionalTheme } from './professional/theme'
export { minimalTheme } from './minimal/theme'
export { naturalTheme } from './natural/theme'
export { modernTheme } from './modern/theme'

// Re-export modern token layer (opt-in extended design tokens)
export {
  MODERN_BASE_TOKENS_LIGHT,
  MODERN_BASE_TOKENS_DARK,
  MODERN_OVERRIDE_TOKENS_LIGHT,
  MODERN_OVERRIDE_TOKENS_DARK,
  MODERN_REDUCED_MOTION_TOKENS
} from './modern/tokens'

// Re-export types (also available from types/theme)
export type {
  ThemeConfig,
  ThemePreset,
  ThemePresetName,
  ThemeSemanticColors,
  ThemeColorScale,
  ColorScheme
} from '../types/theme'

// ---------------------------------------------------------------------------
// Auto-register built-in presets
// ---------------------------------------------------------------------------
import { ThemeManager } from './manager'
import { defaultTheme } from './default/theme'
import { vibrantTheme } from './vibrant/theme'
import { professionalTheme } from './professional/theme'
import { minimalTheme } from './minimal/theme'
import { naturalTheme } from './natural/theme'
import { modernTheme } from './modern/theme'

const builtInPresets = [
  defaultTheme,
  vibrantTheme,
  professionalTheme,
  minimalTheme,
  naturalTheme,
  modernTheme
]

for (const preset of builtInPresets) {
  ThemeManager.registerTheme(preset)
}
