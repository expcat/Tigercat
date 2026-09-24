/**
 * Theme presets and a per-root theme scope.
 * The Tailwind plugin lives at `@expcat/tigercat-core/tailwind`.
 */

export {
  createTigerThemeScope,
  nearestThemeRoot,
  readTigerDocumentTheme,
  THEME_CONFIG_CSS_VARS,
  THEME_ROOT_ATTRIBUTE,
  THEME_TRANSITION_PROPERTIES,
  themeConfigOwnCssVars,
  themeConfigToCssVars,
  themeTransitionValue,
  mergeThemeConfig,
  resolvePresetThemeConfig
} from './manager'
export type {
  TigerThemeScope,
  TigerThemeScopeOptions,
  ThemeChangeEvent,
  ThemeChangeListener
} from './manager'

export { defaultTheme } from './default/theme'
export { vibrantTheme } from './vibrant/theme'
export { professionalTheme } from './professional/theme'
export { minimalTheme } from './minimal/theme'
export { naturalTheme } from './natural/theme'
export { modernTheme } from './modern/theme'
export { highContrastTheme } from './high-contrast/theme'
export { forcedColorsCss } from './forced-colors'
export { reviewPreset, reviewNamedPreset } from './preset-review'

export type {
  ThemeConfig,
  ThemePreset,
  ThemePresetName,
  ThemeSemanticColors,
  ThemeColorScale,
  ColorScheme
} from '../types/theme'
