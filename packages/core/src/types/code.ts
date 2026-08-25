import type { TigerLocale, TigerLocaleCode } from './locale'

export interface CodeProps {
  code: string
  copyable?: boolean
  copyLabel?: string
  copiedLabel?: string
  copyFailedLabel?: string
  /**
   * Locale overrides for Code UI text
   */
  locale?: Partial<TigerLocale>
  /**
   * Flat custom-text overrides for single-language use (no i18n needed).
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<TigerLocaleCode>
}
