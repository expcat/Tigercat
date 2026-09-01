/**
 * RichTextEditor utility functions — zero-dependency
 *
 * Uses contentEditable + document.execCommand (widely supported)
 * for basic rich-text editing support.
 */

import type {
  RichTextEditorMode,
  ToolbarButton,
  ToolbarItem,
  ToolbarSeparator
} from '../types/rich-text-editor'
import type { TigerLocaleRichTextEditor } from '../types/locale'
import { enUS } from './i18n/locales/en-US'

// ─── Toolbar item helpers ─────────────────────────────────────────

/** Type guard: check if a toolbar item is a separator */
export function isToolbarSeparator(item: ToolbarItem): item is ToolbarSeparator {
  return (item as ToolbarSeparator).type === 'separator'
}

/** Extract only ToolbarButton items (for hotkey matching, etc.) */
export function getToolbarButtons(items: ToolbarItem[]): ToolbarButton[] {
  return items.filter((item): item is ToolbarButton => !isToolbarSeparator(item))
}

// ─── Default toolbar ──────────────────────────────────────────────

function toolbarTooltip(label: string, hotkey?: string): string {
  return hotkey ? `${label} (${hotkey})` : label
}

/** Build the built-in toolbar from resolved locale labels. */
export function createDefaultRichTextToolbar(
  labels: Required<TigerLocaleRichTextEditor>
): ToolbarButton[] {
  return [
    {
      name: 'bold',
      label: labels.bold,
      tooltip: toolbarTooltip(labels.bold, 'Ctrl+B'),
      hotkey: 'Ctrl+B'
    },
    {
      name: 'italic',
      label: labels.italic,
      tooltip: toolbarTooltip(labels.italic, 'Ctrl+I'),
      hotkey: 'Ctrl+I'
    },
    {
      name: 'underline',
      label: labels.underline,
      tooltip: toolbarTooltip(labels.underline, 'Ctrl+U'),
      hotkey: 'Ctrl+U'
    },
    { name: 'strikethrough', label: labels.strikethrough, tooltip: labels.strikethrough },
    { name: 'heading1', label: labels.heading1, tooltip: labels.heading1 },
    { name: 'heading2', label: labels.heading2, tooltip: labels.heading2 },
    { name: 'heading3', label: labels.heading3, tooltip: labels.heading3 },
    { name: 'bulletList', label: labels.bulletList, tooltip: labels.bulletList },
    { name: 'orderedList', label: labels.orderedList, tooltip: labels.orderedList },
    { name: 'blockquote', label: labels.blockquote, tooltip: labels.blockquote },
    { name: 'codeBlock', label: labels.codeBlock, tooltip: labels.codeBlock },
    { name: 'link', label: labels.link, tooltip: labels.link },
    { name: 'horizontalRule', label: labels.horizontalRule, tooltip: labels.horizontalRule },
    {
      name: 'undo',
      label: labels.undo,
      tooltip: toolbarTooltip(labels.undo, 'Ctrl+Z'),
      hotkey: 'Ctrl+Z'
    },
    {
      name: 'redo',
      label: labels.redo,
      tooltip: toolbarTooltip(labels.redo, 'Ctrl+Y'),
      hotkey: 'Ctrl+Y'
    },
    { name: 'clear', label: labels.clear, tooltip: labels.clear }
  ]
}

export const defaultToolbar: ToolbarButton[] = createDefaultRichTextToolbar(
  enUS.richTextEditor as Required<TigerLocaleRichTextEditor>
)

// ─── Tailwind class constants ─────────────────────────────────────

/** Container fill: optional `--tiger-rte-bg`, then registered `--tiger-surface`. */
export const richTextContainerBase =
  'flex flex-col border border-[var(--tiger-border,#d1d5db)] rounded-[var(--tiger-radius-md,0.5rem)] overflow-hidden bg-[var(--tiger-rte-bg,var(--tiger-surface,#ffffff))]'

export const richTextContainerDisabled = 'opacity-50 cursor-not-allowed pointer-events-none'

/** Toolbar fill: optional `--tiger-rte-toolbar-bg`, then registered `--tiger-surface-muted`. */
export const richTextToolbarClasses =
  'flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-rte-toolbar-bg,var(--tiger-surface-muted,#f9fafb))]'

export const richTextToolbarButtonBase =
  'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded text-sm font-medium transition-colors duration-150 text-[var(--tiger-text-secondary,#6b7280)] hover:bg-[var(--tiger-bg-hover,#e5e7eb)] hover:text-[var(--tiger-text,#111827)]'

export const richTextToolbarButtonActive =
  'bg-[var(--tiger-primary,#2563eb)]/10 text-[var(--tiger-primary,#2563eb)]'

export const richTextToolbarSeparatorClasses = 'w-px h-5 mx-1 bg-[var(--tiger-border,#d1d5db)]'

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
    heading1: { command: 'formatBlock', argument: 'h1' },
    heading2: { command: 'formatBlock', argument: 'h2' },
    heading3: { command: 'formatBlock', argument: 'h3' },
    bulletList: { command: 'insertUnorderedList' },
    orderedList: { command: 'insertOrderedList' },
    blockquote: { command: 'formatBlock', argument: 'blockquote' },
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
 * Returns the button (with its action callback if any) or null.
 * Accepts ToolbarItem[] and skips separators.
 */
export function findHotkeyMatch(
  toolbar: ToolbarItem[],
  event: { ctrlKey: boolean; shiftKey: boolean; altKey: boolean; metaKey: boolean; key: string }
): ToolbarButton | null {
  for (const item of toolbar) {
    if (isToolbarSeparator(item)) continue
    if (item.hotkey) {
      const parsed = parseHotkey(item.hotkey)
      if (matchesHotkey(event, parsed)) return item
    }
  }
  return null
}

// ─── Content helpers ──────────────────────────────────────────────

const ALLOWED_HTML_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul'
])

const VOID_HTML_TAGS = new Set(['br', 'hr', 'img', 'col', 'wbr'])

const DROP_WITH_CONTENT_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'noscript',
  'template',
  'svg',
  'math',
  'link',
  'meta',
  'base',
  'head'
])

const URL_ATTR_NAMES = new Set([
  'href',
  'src',
  'action',
  'formaction',
  'xlink:href',
  'poster',
  'cite',
  'background'
])

const ALLOWED_ATTRS_BY_TAG: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'rel', 'target']),
  img: new Set(['src', 'alt', 'title']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
  code: new Set(['class']),
  pre: new Set(['class'])
}

interface ParsedOpenTag {
  name: string
  attrs: Array<[string, string]>
  selfClosing: boolean
}

function isNameStart(ch: string): boolean {
  return /[A-Za-z]/.test(ch)
}

function stripUrlNoise(value: string): string {
  return decodeHtmlEntities(value).replace(/[\u0000-\u0020\u00a0\u200b\ufeff]/g, '')
}

function protocolName(url: string): string | null {
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(url)
  return match ? match[1].toLowerCase() : null
}

/** True when the URL uses a blocked scheme or protocol-relative form. */
export function isDangerousUrl(url: string): boolean {
  const normalized = stripUrlNoise(url).replace(/\\+/g, '')
  if (!normalized) return true
  if (normalized.startsWith('//')) return true
  const protocol = protocolName(normalized)
  if (!protocol) return false
  return protocol !== 'http' && protocol !== 'https' && protocol !== 'mailto'
}

/**
 * Allow http(s), mailto, in-document hash, and same-origin relative paths.
 * Reject javascript/data/vbscript and protocol-relative `//` URLs.
 */
export function isValidUrl(url: string): boolean {
  const trimmed = url.trim()
  if (!trimmed) return false
  return !isDangerousUrl(trimmed)
}

function findRawClosingTag(html: string, from: number, name: string): number {
  const re = new RegExp(`</${name}\\s*>`, 'i')
  const slice = html.slice(from)
  const match = re.exec(slice)
  return match ? from + match.index + match[0].length : -1
}

function parseOpenTag(html: string, index: number): { tag: ParsedOpenTag; next: number } | null {
  if (html[index] !== '<' || !isNameStart(html[index + 1] ?? '')) return null
  let i = index + 1
  const nameMatch = /^[a-zA-Z][\w:-]*/.exec(html.slice(i))
  if (!nameMatch) return null
  const name = nameMatch[0].toLowerCase()
  i += nameMatch[0].length
  const attrs: Array<[string, string]> = []

  while (i < html.length) {
    while (i < html.length && /[\s\n\r\t\f]/.test(html[i])) i++
    if (i >= html.length) return null
    if (html[i] === '>') {
      return { tag: { name, attrs, selfClosing: false }, next: i + 1 }
    }
    if (html[i] === '/' && html[i + 1] === '>') {
      return { tag: { name, attrs, selfClosing: true }, next: i + 2 }
    }
    const attrNameMatch = /^[^\s/>=]+/.exec(html.slice(i))
    if (!attrNameMatch) return null
    const attrName = attrNameMatch[0].toLowerCase()
    i += attrNameMatch[0].length
    while (i < html.length && /[\s\n\r\t\f]/.test(html[i])) i++
    let attrValue = ''
    if (html[i] === '=') {
      i++
      while (i < html.length && /[\s\n\r\t\f]/.test(html[i])) i++
      if (html[i] === '"' || html[i] === "'") {
        const quote = html[i]
        i++
        const end = html.indexOf(quote, i)
        if (end === -1) {
          attrValue = html.slice(i)
          i = html.length
        } else {
          attrValue = html.slice(i, end)
          i = end + 1
        }
      } else {
        const start = i
        while (i < html.length && !/[\s>]/.test(html[i]) && html.slice(i, i + 2) !== '/>') i++
        attrValue = html.slice(start, i)
      }
    }
    attrs.push([attrName, attrValue])
  }
  return null
}

function sanitizeClassValue(value: string): string | null {
  const allowed = value
    .split(/\s+/)
    .filter((token) => /^language-[\w-]+$/.test(token) || /^hljs$/.test(token))
  return allowed.length > 0 ? allowed.join(' ') : null
}

function serializeAllowedAttrs(tag: string, attrs: Array<[string, string]>): string {
  const allowed = ALLOWED_ATTRS_BY_TAG[tag]
  if (!allowed) return ''
  let out = ''
  let relForced = false
  for (const [rawName, rawValue] of attrs) {
    if (rawName.startsWith('on')) continue
    if (!allowed.has(rawName)) continue
    if (rawName === 'style') continue
    if (rawName === 'class') {
      const safeClass = sanitizeClassValue(rawValue)
      if (safeClass) out += ` class="${escapeHtml(safeClass)}"`
      continue
    }
    if (rawName === 'target') {
      if (rawValue.trim() !== '_blank') continue
      out += ' target="_blank"'
      if (!relForced) {
        out += ' rel="noreferrer noopener"'
        relForced = true
      }
      continue
    }
    if (rawName === 'rel') {
      if (relForced) continue
      out += ` rel="${escapeHtml(rawValue)}"`
      relForced = true
      continue
    }
    if (URL_ATTR_NAMES.has(rawName)) {
      if (!isValidUrl(rawValue)) continue
      out += ` ${rawName}="${escapeHtml(rawValue.trim())}"`
      continue
    }
    out += ` ${rawName}="${escapeHtml(rawValue)}"`
  }
  return out
}

/**
 * Whitelist HTML sanitizer used by RichTextEditor (paste / initial value)
 * and MarkdownEditor preview. Not a regex stripper: unknown tags unwrap,
 * forbidden tags drop, event names / javascript: / data: / style urls
 * never survive. Custom `engine` / `renderer` / toolbar `icon` HTML is
 * still TRUSTED and must be sanitised by the caller if untrusted.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  let i = 0

  const parseUntil = (endTag?: string): string => {
    let buf = ''
    while (i < html.length) {
      if (html[i] !== '<') {
        const next = html.indexOf('<', i)
        const chunk = next === -1 ? html.slice(i) : html.slice(i, next)
        buf += chunk
        i = next === -1 ? html.length : next
        continue
      }

      if (html.startsWith('<!--', i)) {
        const end = html.indexOf('-->', i + 4)
        i = end === -1 ? html.length : end + 3
        continue
      }

      if (html.startsWith('<!', i) || html.startsWith('<?', i)) {
        const end = html.indexOf('>', i + 2)
        i = end === -1 ? html.length : end + 1
        continue
      }

      if (html.startsWith('</', i)) {
        const close = /^<\/([a-zA-Z][\w:-]*)\s*>/.exec(html.slice(i))
        if (!close) {
          buf += '&lt;'
          i++
          continue
        }
        const name = close[1].toLowerCase()
        i += close[0].length
        if (endTag && name === endTag) return buf
        continue
      }

      const parsed = parseOpenTag(html, i)
      if (!parsed) {
        buf += '&lt;'
        i++
        continue
      }
      i = parsed.next
      const { name, attrs, selfClosing } = parsed.tag

      if (DROP_WITH_CONTENT_TAGS.has(name)) {
        if (!selfClosing && !VOID_HTML_TAGS.has(name)) {
          const closeAt = findRawClosingTag(html, i, name)
          if (closeAt !== -1) i = closeAt
        }
        continue
      }

      if (!ALLOWED_HTML_TAGS.has(name)) {
        if (!selfClosing && !VOID_HTML_TAGS.has(name)) {
          buf += parseUntil(name)
        }
        continue
      }

      const attrHtml = serializeAllowedAttrs(name, attrs)
      if (VOID_HTML_TAGS.has(name) || selfClosing) {
        buf += `<${name}${attrHtml}>`
        continue
      }
      const inner = parseUntil(name)
      buf += `<${name}${attrHtml}>${inner}</${name}>`
    }
    return buf
  }

  return parseUntil()
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function codePointToChar(code: number): string {
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return ''
  try {
    return String.fromCodePoint(code)
  } catch {
    return ''
  }
}

function decodeHtmlEntities(value: string): string {
  let current = value
  for (let pass = 0; pass < 3; pass++) {
    const next = current
      .replace(/&colon;/gi, ':')
      .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => codePointToChar(parseInt(hex, 16)))
      .replace(/&#([0-9]+);?/gi, (_, dec: string) => codePointToChar(parseInt(dec, 10)))
      .replace(/&nbsp;/gi, ' ')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, '&')
    if (next === current) break
    current = next
  }
  return current
}

function inlineMarkdownToHtml(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

/** Convert external editor content into HTML for the built-in engine. */
export function richTextModeToHtml(value: string, mode: RichTextEditorMode = 'html'): string {
  if (mode === 'html') return sanitizeHtml(value)

  if (mode === 'plain') {
    return escapeHtml(value)
      .split(/\r?\n/)
      .map((line) => (line ? `<p>${line}</p>` : '<p><br></p>'))
      .join('')
  }

  const lines = value.split(/\r?\n/)
  const html: string[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return
    html.push(
      `<ul>${listItems.map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`).join('')}</ul>`
    )
    listItems = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const bullet = /^[-*]\s+(.+)$/.exec(trimmed)
    if (bullet) {
      listItems.push(bullet[1])
      continue
    }

    flushList()
    if (!trimmed) {
      html.push('<p><br></p>')
    } else if (trimmed.startsWith('### ')) {
      html.push(`<h3>${inlineMarkdownToHtml(trimmed.slice(4))}</h3>`)
    } else if (trimmed.startsWith('## ')) {
      html.push(`<h2>${inlineMarkdownToHtml(trimmed.slice(3))}</h2>`)
    } else if (trimmed.startsWith('# ')) {
      html.push(`<h1>${inlineMarkdownToHtml(trimmed.slice(2))}</h1>`)
    } else {
      html.push(`<p>${inlineMarkdownToHtml(trimmed)}</p>`)
    }
  }
  flushList()
  return sanitizeHtml(html.join(''))
}

function htmlToText(value: string): string {
  return decodeHtmlEntities(
    sanitizeHtml(value)
      .replace(/<\/(h[1-6]|p|div|li)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Convert built-in engine HTML back to the public value for the selected mode. */
export function richTextHtmlToMode(html: string, mode: RichTextEditorMode = 'html'): string {
  const sanitized = sanitizeHtml(html)
  if (mode === 'html') return sanitized
  if (mode === 'plain') return htmlToText(sanitized)

  return decodeHtmlEntities(
    sanitized
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
      .replace(/<\/(p|div)>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Parse height prop to CSS value */
export function parseHeight(height: number | string | undefined): string | undefined {
  if (height === undefined) return undefined
  if (typeof height === 'number') return `${height}px`
  return height
}
