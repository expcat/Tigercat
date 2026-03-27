/**
 * CodeEditor component types and interfaces
 */

/**
 * Supported programming languages for syntax highlighting
 */
export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'python'
  | 'plain'

/**
 * Code editor theme
 */
export type CodeEditorTheme = 'light' | 'dark'

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
}
