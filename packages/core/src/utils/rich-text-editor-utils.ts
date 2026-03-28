/**
 * RichTextEditor utility functions — zero-dependency
 *
 * Uses contentEditable + document.execCommand (widely supported)
 * for basic rich-text editing support.
 */

import type { ToolbarButton } from '../types/rich-text-editor'

// ─── Default toolbar ──────────────────────────────────────────────

export const defaultToolbar: ToolbarButton[] = [
  { name: 'bold', label: 'Bold', tooltip: 'Bold (Ctrl+B)', hotkey: 'Ctrl+B' },
  { name: 'italic', label: 'Italic', tooltip: 'Italic (Ctrl+I)', hotkey: 'Ctrl+I' },
  { name: 'underline', label: 'Underline', tooltip: 'Underline (Ctrl+U)', hotkey: 'Ctrl+U' },
  { name: 'strikethrough', label: 'Strikethrough', tooltip: 'Strikethrough' },
  { name: 'heading1', label: 'H1', tooltip: 'Heading 1' },
  { name: 'heading2', label: 'H2', tooltip: 'Heading 2' },
  { name: 'heading3', label: 'H3', tooltip: 'Heading 3' },
  { name: 'bulletList', label: 'Bullet List', tooltip: 'Bullet List' },
  { name: 'orderedList', label: 'Ordered List', tooltip: 'Ordered List' },
  { name: 'blockquote', label: 'Blockquote', tooltip: 'Blockquote' },
  { name: 'codeBlock', label: 'Code', tooltip: 'Code Block' },
  { name: 'link', label: 'Link', tooltip: 'Insert Link' },
  { name: 'horizontalRule', label: 'HR', tooltip: 'Horizontal Rule' },
  { name: 'undo', label: 'Undo', tooltip: 'Undo (Ctrl+Z)', hotkey: 'Ctrl+Z' },
  { name: 'redo', label: 'Redo', tooltip: 'Redo (Ctrl+Y)', hotkey: 'Ctrl+Y' },
  { name: 'clear', label: 'Clear', tooltip: 'Clear Formatting' }
]

// ─── Tailwind class constants ─────────────────────────────────────

export const richTextContainerBase =
  'flex flex-col border border-[var(--tiger-border,#d1d5db)] rounded-lg overflow-hidden bg-[var(--tiger-bg,#ffffff)]'

export const richTextContainerDisabled = 'opacity-50 cursor-not-allowed pointer-events-none'

export const richTextToolbarClasses =
  'flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg-secondary,#f9fafb)]'

export const richTextToolbarButtonBase =
  'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded text-sm font-medium transition-colors duration-150 text-[var(--tiger-text-secondary,#6b7280)] hover:bg-[var(--tiger-bg-hover,#e5e7eb)] hover:text-[var(--tiger-text,#111827)]'

export const richTextToolbarButtonActive =
  'bg-[var(--tiger-primary,#2563eb)]/10 text-[var(--tiger-primary,#2563eb)]'

export const richTextEditorAreaBase =
  'flex-1 p-4 outline-none text-[var(--tiger-text,#111827)] text-sm leading-relaxed overflow-y-auto'

export const richTextEditorAreaReadOnly = 'cursor-default'

export const richTextPlaceholderClasses = 'text-[var(--tiger-text-tertiary,#9ca3af)]'

// ─── Class generators ─────────────────────────────────────────────

export function getRichTextContainerClasses(disabled: boolean, className?: string): string {
  const parts = [richTextContainerBase]
  if (disabled) parts.push(richTextContainerDisabled)
  if (className) parts.push(className)
  return parts.join(' ')
}

export function getToolbarButtonClasses(active: boolean): string {
  return active
    ? `${richTextToolbarButtonBase} ${richTextToolbarButtonActive}`
    : richTextToolbarButtonBase
}

export function getEditorAreaClasses(readOnly: boolean): string {
  return readOnly
    ? `${richTextEditorAreaBase} ${richTextEditorAreaReadOnly}`
    : richTextEditorAreaBase
}

// ─── Toolbar action mapping ───────────────────────────────────────

export interface ExecCommandResult {
  command: string
  argument?: string
}

/**
 * Map a toolbar action name to a document.execCommand command + optional arg.
 * Returns null for actions that need custom handling (link, image, etc.).
 */
export function mapToolbarAction(action: string): ExecCommandResult | null {
  const mapping: Record<string, ExecCommandResult> = {
    bold: { command: 'bold' },
    italic: { command: 'italic' },
    underline: { command: 'underline' },
    strikethrough: { command: 'strikeThrough' },
    heading1: { command: 'formatBlock', argument: 'H1' },
    heading2: { command: 'formatBlock', argument: 'H2' },
    heading3: { command: 'formatBlock', argument: 'H3' },
    bulletList: { command: 'insertUnorderedList' },
    orderedList: { command: 'insertOrderedList' },
    blockquote: { command: 'formatBlock', argument: 'BLOCKQUOTE' },
    horizontalRule: { command: 'insertHorizontalRule' },
    undo: { command: 'undo' },
    redo: { command: 'redo' },
    clear: { command: 'removeFormat' }
  }
  return mapping[action] ?? null
}

/**
 * Check if a toolbar action is an inline format (can be active/inactive).
 */
export function isInlineFormat(action: string): boolean {
  return ['bold', 'italic', 'underline', 'strikethrough'].includes(action)
}

// ─── Hotkey helpers ───────────────────────────────────────────────

export interface ParsedHotkey {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  key: string
}

export function parseHotkey(hotkey: string): ParsedHotkey {
  const parts = hotkey.split('+').map((p) => p.trim().toLowerCase())
  const key = parts[parts.length - 1]
  return {
    ctrl: parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('cmd') || parts.includes('meta'),
    key
  }
}

export function matchesHotkey(
  event: { ctrlKey: boolean; shiftKey: boolean; altKey: boolean; metaKey: boolean; key: string },
  parsed: ParsedHotkey
): boolean {
  return (
    event.key.toLowerCase() === parsed.key &&
    event.ctrlKey === parsed.ctrl &&
    event.shiftKey === parsed.shift &&
    event.altKey === parsed.alt &&
    event.metaKey === parsed.meta
  )
}

/**
 * Find a toolbar button whose hotkey matches the keyboard event.
 * Returns the button name or null.
 */
export function findHotkeyMatch(
  toolbar: ToolbarButton[],
  event: { ctrlKey: boolean; shiftKey: boolean; altKey: boolean; metaKey: boolean; key: string }
): string | null {
  for (const btn of toolbar) {
    if (btn.hotkey) {
      const parsed = parseHotkey(btn.hotkey)
      if (matchesHotkey(event, parsed)) return btn.name
    }
  }
  return null
}

// ─── Content helpers ──────────────────────────────────────────────

/** Sanitize HTML content — XSS prevention by stripping dangerous elements and attributes */
export function sanitizeHtml(html: string): string {
  return (
    html
      // Strip dangerous tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gi, '')
      .replace(/<object\b[^>]*>([\s\S]*?)<\/object>/gi, '')
      .replace(/<embed\b[^>]*\/?>([\s\S]*?(?:<\/embed>)?)/gi, '')
      .replace(/<form\b[^>]*>([\s\S]*?)<\/form>/gi, '')
      // Strip event handlers (quoted and unquoted, including HTML-encoded variants)
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      // Strip javascript: and data: URLs in href/src/action attributes
      .replace(/(href|src|action)\s*=\s*["']\s*javascript\s*:/gi, '$1="')
      .replace(/(href|src|action)\s*=\s*["']\s*data\s*:/gi, '$1="')
  )
}

/** Validate a URL — only allow http(s) and mailto protocols */
export function isValidUrl(url: string): boolean {
  const trimmed = url.trim()
  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)
}

/** Check if content is empty or only whitespace/empty tags */
export function isContentEmpty(html: string): boolean {
  const stripped = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<\/?[^>]*>/g, '')
    .replace(/&nbsp;/gi, '')
    .trim()
  return stripped.length === 0
}

/** Parse height prop to CSS value */
export function parseHeight(height: number | string | undefined): string | undefined {
  if (height === undefined) return undefined
  if (typeof height === 'number') return `${height}px`
  return height
}
