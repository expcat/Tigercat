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

/** One highlighted span. `text` is drawn as a text node. */
export interface HighlightToken {
  text: string
  className?: string
}

/**
 * Pluggable highlighter. Returns tokens. The framework draws them as text.
 */
export interface CodeHighlighter {
  /** Optional identifier used by tests / devtools. */
  name?: string
  /** Tokens for one source line. Drawn as text nodes, never as HTML. */
  highlightLine?(line: string, language: CodeLanguage, theme: CodeEditorTheme): HighlightToken[]
  /**
   * Tokens for the whole block, one array per line. Used when
   * `highlightLine` is not provided. Strings are not HTML.
   */
  highlightCode?(
    code: string,
    language: CodeLanguage,
    theme: CodeEditorTheme
  ): HighlightToken[][]
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
   * Editor theme. Omit to follow the document color scheme.
   */
  theme?: CodeEditorTheme | 'auto'
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
  /** Optional pluggable highlighter. Returns tokens drawn as text. */
  highlighter?: CodeHighlighter
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleCodeEditor>
  /** Accessible name; falls back to locale then FormItem */
  ariaLabel?: string
}
