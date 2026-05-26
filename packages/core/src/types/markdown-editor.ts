/**
 * MarkdownEditor shared types
 */

/** Editor display mode */
export type MarkdownEditorMode = 'edit' | 'split' | 'preview'

/** Built-in toolbar action names */
export type MarkdownToolbarAction =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'heading'
  | 'blockquote'
  | 'unorderedList'
  | 'orderedList'
  | 'inlineCode'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'table'
  | 'horizontalRule'

/** Current textarea selection passed to custom toolbar actions */
export interface MarkdownSelection {
  value: string
  selectionStart: number
  selectionEnd: number
}

/** Result returned by toolbar insertion helpers */
export interface MarkdownInsertResult {
  value: string
  selectionStart: number
  selectionEnd: number
}

/** Toolbar button definition */
export interface MarkdownToolbarButton {
  name: MarkdownToolbarAction | string
  label: string
  icon?: string
  tooltip?: string
  hotkey?: string
  action?: (selection: MarkdownSelection) => MarkdownInsertResult
}

/** Toolbar separator — renders a visual divider between button groups */
export interface MarkdownToolbarSeparator {
  type: 'separator'
}

/** Union type for toolbar items: buttons or separators */
export type MarkdownToolbarItem = MarkdownToolbarButton | MarkdownToolbarSeparator

/** Pluggable markdown preview renderer */
export interface MarkdownRenderer {
  render: (markdown: string) => string
}

/** Props shared across Vue and React */
export interface MarkdownEditorProps {
  /** Current markdown content (controlled) */
  value?: string
  /** Default markdown content (uncontrolled) */
  defaultValue?: string
  /** Placeholder text */
  placeholder?: string
  /** Editor display mode */
  mode?: MarkdownEditorMode
  /** Default display mode (uncontrolled) */
  defaultMode?: MarkdownEditorMode
  /** Toolbar items configuration, or false to hide formatting toolbar */
  toolbar?: MarkdownToolbarItem[] | false
  /** Whether to render the edit/split/preview mode switch */
  showModeSwitch?: boolean
  /** Editor height */
  height?: number | string
  /** Read-only mode */
  readOnly?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Optional markdown preview renderer */
  renderer?: MarkdownRenderer
  /** Additional CSS class */
  className?: string
  /** Custom styles */
  style?: Record<string, string | number>
}
