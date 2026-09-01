/**
 * CodeEditor component types and interfaces
 */

import type { TigerLocale, TigerLocaleCodeEditor } from './locale'

/**
 * Supported programming languages for syntax highlighting
 */
export type CodeLanguage =
  'javascript' | 'typescript' | 'html' | 'css' | 'json' | 'markdown' | 'python' | 'plain'

/**
 * Code editor theme
 */
export type CodeEditorTheme = 'light' | 'dark'

/**
 * Pluggable highlighter. Returned HTML is TRUSTED and injected as-is —
 * callers must escape untrusted source themselves (or use
 * `escapeHighlightHtml`).
 */
export interface CodeHighlighter {
  /** Optional identifier used by tests / devtools. */
  name?: string
  /**
   * Render a single line of source to HTML. Returned string is injected
   * verbatim — engines must escape any untrusted text themselves.
   */
  highlightLine?(line: string, language: CodeLanguage, theme: CodeEditorTheme): string
  /**
   * Render the whole code block to HTML. Used when `highlightLine` is
   * not provided. Engines that emit one `<pre><code>` envelope per call
   * should prefer this hook.
   */
  highlightCode?(code: string, language: CodeLanguage, theme: CodeEditorTheme): string
}

/**
 * Base CodeEditor props interface
 */
export interface CodeEditorProps {
  /**
   * The code content
   */
  value?: string
  /**
   * Default code content (uncontrolled mode)
   */
  defaultValue?: string
  /**
   * Programming language for syntax highlighting
   * @default 'plain'
   */
  language?: CodeLanguage
  /**
   * Editor theme
   * @default 'light'
   */
  theme?: CodeEditorTheme
  /**
   * Whether the editor is read-only
   * @default false
   */
  readOnly?: boolean
  /**
   * Whether to show line numbers
   * @default true
   */
  lineNumbers?: boolean
  /**
   * Whether to highlight the current line
   * @default true
   */
  highlightActiveLine?: boolean
  /**
   * Tab size in spaces
   * @default 2
   */
  tabSize?: number
  /**
   * Placeholder text when empty
   */
  placeholder?: string
  /**
   * Whether to wrap long lines
   * @default false
   */
  wordWrap?: boolean
  /**
   * Minimum number of visible lines
   * @default 3
   */
  minLines?: number
  /**
   * Maximum number of visible lines (0 = no limit)
   * @default 0
   */
  maxLines?: number
  /**
   * Whether the editor is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, string | number>
  /**
   * Optional pluggable highlighter. Output is TRUSTED HTML.
   */
  highlighter?: CodeHighlighter
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleCodeEditor>
  /** Accessible name; falls back to locale then FormItem */
  ariaLabel?: string
}
