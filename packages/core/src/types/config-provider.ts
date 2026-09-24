/**
 * Shared ConfigProvider types. Vue/React wrap these and only add
 * children / slots.
 */

import type { TigerLocale, TigerLocaleDirection, TigerLocaleInput } from './locale'
import type { ColorScheme } from './theme'
import type { IconRegistry } from '../utils/icons/registry'

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
  iconRegistry?: IconRegistry
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
  dir?: TigerLocaleDirection

  /**
   * Built-in or registered theme name. The outermost provider writes it
   * onto its document root.
   */
  theme?: string

  /**
   * `'light'` or `'dark'` sets `data-tiger-color-scheme` on the document root.
   * `'auto'` leaves the class and attribute already on `<html>` in charge.
   */
  colorScheme?: ColorScheme

  /** App-owned icon registry. Disposed with the provider when it created one. */
  iconRegistry?: IconRegistry
}
