/**
 * RichTextEditor shared types
 */

import type { TigerLocale, TigerLocaleRichTextEditor } from './locale'

/** Editing mode */
export type RichTextEditorMode = 'html' | 'markdown' | 'plain'

/** Toolbar button definition */
export interface ToolbarButton {
  name: string
  label: string
  /**
   * Optional icon HTML. TRUSTED — injected with innerHTML; escape or
   * sanitise untrusted strings before passing.
   */
  icon?: string
  tooltip?: string
  hotkey?: string
  /**
   * Custom action handler. When provided, clicking this button calls
   * `action(element)` instead of the built-in execCommand mapping.
   * `element` is the contentEditable host element.
   */
  action?: (element: HTMLElement) => void
}

/** Toolbar separator — renders a visual divider between button groups */
export interface ToolbarSeparator {
  type: 'separator'
}

/** Union type for toolbar items: buttons or separators */
export type ToolbarItem = ToolbarButton | ToolbarSeparator

/** Built-in toolbar action names */
export type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'horizontalRule'
  | 'undo'
  | 'redo'
  | 'clear'

/** Props shared across Vue and React */
export interface RichTextEditorProps {
  /** Current HTML content (controlled) */
  value?: string
  /** Default content (uncontrolled) */
  defaultValue?: string
  /** Placeholder text */
  placeholder?: string
  /** Editing mode */
  mode?: RichTextEditorMode
  /** Toolbar items configuration (buttons and separators) */
  toolbar?: ToolbarItem[]
  /** Editor height */
  height?: number | string
  /** Read-only mode */
  readOnly?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /**
   * Pluggable editor engine. Default is builtin contenteditable.
   * Custom engines are TRUSTED and must sanitise untrusted HTML.
   */
  engine?: unknown
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleRichTextEditor>
  /** Accessible name; falls back to locale then FormItem */
  ariaLabel?: string
  /** Called instead of window.prompt for link / image URLs */
  onRequestUrl?: (kind: 'link' | 'image') => string | null
}
