/**
 * Tigercat Theme System
 *
 * Provides built-in preset themes, a ThemeManager singleton for runtime
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
export {
  ThemeManager,
  THEME_CONFIG_CSS_VARS,
  themeConfigToCssVars,
  mergeThemeConfig,
  resolvePresetThemeConfig,
  registerBuiltInThemes
} from './manager'
export type { ThemeChangeEvent, ThemeChangeListener } from './manager'

// Re-export preset themes
export { defaultTheme } from './default/theme'
export { vibrantTheme } from './vibrant/theme'
export { professionalTheme } from './professional/theme'
export { minimalTheme } from './minimal/theme'
export { naturalTheme } from './natural/theme'
export { modernTheme } from './modern/theme'
export { highContrastTheme } from './high-contrast/theme'

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


