import type { CodeHighlighter } from './code-editor'
import type { TigerLocale, TigerLocaleCode } from './locale'

export interface CodeProps {
  code: string
  /**
   * @default true
   */
  copyable?: boolean
  /**
   * Language hint passed to {@link highlighter}. Ignored when no highlighter
   * is provided — the default remains plain text so highlight engines stay
   * out of the main bundle.
   */
  language?: string
  /**
   * Optional pluggable highlighter. Output is TRUSTED HTML injected as-is.
   * Omit to keep a plain-text `<code>` block.
   */
  highlighter?: CodeHighlighter
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
