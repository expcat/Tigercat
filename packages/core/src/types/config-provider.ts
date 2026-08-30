/**
 * Shared ConfigProvider types. Vue/React wrap these and only add
 * children / slots.
 */

import type { TigerLocale, TigerLocaleDirection, TigerLocaleInput } from './locale'
import type { ColorScheme } from './theme'

/**
 * Tree-level config consumed by `useTigerConfig()`.
 *
 * `locale` / `direction` / `theme` / `colorScheme` live in the component tree.
 * Writing `dir` / `lang` / theme CSS variables onto `document.documentElement`
 * is a separate document-ownership concern, handled only by the outermost
 * still-mounted ConfigProvider.
 */
export interface TigerConfig {
  locale?: Partial<TigerLocale>
  localeLoading?: boolean
  localeLoadError?: Error
  direction?: TigerLocaleDirection
  theme?: string
  colorScheme?: ColorScheme
}

/**
 * Framework-agnostic ConfigProvider props (no children / slots).
 */
export interface ConfigProviderProps {
  /**
   * Locale object, Promise, or loader. Nested providers merge onto the parent.
   */
  locale?: TigerLocaleInput

  /**
   * Explicit text direction. Wins over the locale object's `direction` and
   * over language-id inference.
   */
  direction?: TigerLocaleDirection

  /**
   * Built-in or registered theme name. Applied to the document by the
   * outermost provider (`ThemeManager.setTheme`).
   */
  theme?: string

  /**
   * Color scheme. `'auto'` follows `prefers-color-scheme` after hydrate;
   * first paint / SSR treat it as light unless `<html>` is already dark.
   */
  colorScheme?: ColorScheme
}
