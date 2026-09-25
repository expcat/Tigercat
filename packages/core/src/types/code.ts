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
   * Optional pluggable highlighter. Returns tokens drawn as text.
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
  /**
   * Gutter of line numbers beside the code. Numbers are not part of the copy.
   * @default false
   */
  lineNumbers?: boolean
  /**
   * Reserve a header row above the code for the `language` string.
   * Copy and wrap controls move into that row so they do not cover the lines.
   * @default false
   */
  showLanguage?: boolean
  /**
   * Show a control that toggles soft wrapping. Copy stays the raw string.
   * @default false
   */
  wrapToggle?: boolean
}
