import { sanitizeHtml, isValidUrl, parseHeight } from './rich-text-editor-utils'
import type {
  MarkdownEditorMode,
  MarkdownInsertResult,
  MarkdownRenderer,
  MarkdownSelection,
  MarkdownToolbarButton,
  MarkdownToolbarItem,
  MarkdownToolbarSeparator
} from '../types/markdown-editor'

export { parseHeight as parseMarkdownHeight }

export const markdownEditorContainerBase =
  'flex flex-col border border-[var(--tiger-border,#d1d5db)] rounded-[var(--tiger-radius-md,0.5rem)] overflow-hidden bg-[var(--tiger-bg,#ffffff)] text-[var(--tiger-text,#111827)]'

export const markdownEditorContainerDisabled = 'opacity-50 cursor-not-allowed'

export const markdownEditorToolbarClasses =
  'flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 border-b border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg-secondary,#f9fafb)]'

export const markdownEditorToolbarGroupClasses = 'flex flex-wrap items-center gap-1'

export const markdownEditorToolbarButtonBase =
  'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded text-sm font-medium transition-colors duration-150 text-[var(--tiger-text-secondary,#6b7280)] hover:bg-[var(--tiger-bg-hover,#e5e7eb)] hover:text-[var(--tiger-text,#111827)] disabled:cursor-not-allowed disabled:opacity-50'

export const markdownEditorToolbarButtonActive =
  'bg-[var(--tiger-primary,#2563eb)]/10 text-[var(--tiger-primary,#2563eb)]'

export const markdownEditorToolbarSeparatorClasses =
  'w-px h-5 mx-1 bg-[var(--tiger-border,#d1d5db)]'

export const markdownEditorBodyClasses = 'grid flex-1 min-h-0 bg-[var(--tiger-bg,#ffffff)]'

export const markdownEditorTextareaClasses =
  'w-full h-full min-h-0 resize-none border-0 outline-none bg-transparent p-4 font-mono text-sm leading-7 text-[var(--tiger-text,#111827)] placeholder:text-[var(--tiger-text-tertiary,#9ca3af)] disabled:cursor-not-allowed'

export const markdownEditorPreviewClasses =
  'h-full min-h-0 overflow-auto p-4 text-sm leading-7 text-[var(--tiger-text,#111827)] [&_a]:text-[var(--tiger-primary,#2563eb)] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--tiger-border,#d1d5db)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--tiger-text-secondary,#6b7280)] [&_code]:rounded [&_code]:bg-[var(--tiger-bg-secondary,#f3f4f6)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-4 [&_hr]:border-[var(--tiger-border,#d1d5db)] [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-[var(--tiger-bg-secondary,#f3f4f6)] [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[var(--tiger-border,#d1d5db)] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[var(--tiger-border,#d1d5db)] [&_th]:bg-[var(--tiger-bg-secondary,#f9fafb)] [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6'

export const markdownEditorEmptyPreviewClasses = 'text-[var(--tiger-text-tertiary,#9ca3af)]'

export const markdownEditorSplitDividerClasses = 'border-l border-[var(--tiger-border,#d1d5db)]'

export const defaultMarkdownToolbar: MarkdownToolbarItem[] = [
  { name: 'bold', label: 'B', tooltip: 'Bold (Ctrl+B)', hotkey: 'Ctrl+B' },
  { name: 'italic', label: 'I', tooltip: 'Italic (Ctrl+I)', hotkey: 'Ctrl+I' },
  { name: 'strikethrough', label: 'S', tooltip: 'Strikethrough' },
  { type: 'separator' },
  { name: 'heading', label: 'H', tooltip: 'Heading' },
  { name: 'blockquote', label: 'Quote', tooltip: 'Blockquote' },
  { name: 'unorderedList', label: 'List', tooltip: 'Bulleted list' },
  { name: 'orderedList', label: '1.', tooltip: 'Numbered list' },
  { type: 'separator' },
  { name: 'inlineCode', label: '`', tooltip: 'Inline code' },
  { name: 'codeBlock', label: '{}', tooltip: 'Code block' },
  { name: 'link', label: 'Link', tooltip: 'Link (Ctrl+K)', hotkey: 'Ctrl+K' },
  { name: 'image', label: 'Img', tooltip: 'Image' },
  { name: 'table', label: 'Table', tooltip: 'Table' },
  { name: 'horizontalRule', label: 'HR', tooltip: 'Horizontal rule' }
]

export const markdownModeLabels: Record<MarkdownEditorMode, string> = {
  edit: 'Edit',
  split: 'Split',
  preview: 'Preview'
}

export function isMarkdownToolbarSeparator(
  item: MarkdownToolbarItem
): item is MarkdownToolbarSeparator {
  return (item as MarkdownToolbarSeparator).type === 'separator'
}

export function getMarkdownToolbarButtons(items: MarkdownToolbarItem[]): MarkdownToolbarButton[] {
  return items.filter((item): item is MarkdownToolbarButton => !isMarkdownToolbarSeparator(item))
}

export function getMarkdownContainerClasses(disabled: boolean, className?: string): string {
  const parts = [markdownEditorContainerBase]
  if (disabled) parts.push(markdownEditorContainerDisabled)
  if (className) parts.push(className)
  return parts.join(' ')
}

export function getMarkdownToolbarButtonClasses(active: boolean): string {
  return active
    ? `${markdownEditorToolbarButtonBase} ${markdownEditorToolbarButtonActive}`
    : markdownEditorToolbarButtonBase
}

export function getMarkdownBodyClasses(mode: MarkdownEditorMode): string {
  return mode === 'split'
    ? `${markdownEditorBodyClasses} grid-cols-1 md:grid-cols-2`
    : `${markdownEditorBodyClasses} grid-cols-1`
}

export function escapeMarkdownHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value: string): string {
  return escapeMarkdownHtml(value).replace(/`/g, '&#96;')
}

function normalizeMarkdown(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}

function isBlockStart(line: string): boolean {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line) ||
    /^>\s?/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    /^```/.test(line)
  )
}

export function renderMarkdownInline(value: string): string {
  let html = escapeMarkdownHtml(value)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_m, alt, src, title) => {
      if (!isValidUrl(src)) return _m
      const titleAttr = title ? ` title="${escapeAttribute(title)}"` : ''
      return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}"${titleAttr} />`
    }
  )
  html = html.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_m, text, href, title) => {
      if (!isValidUrl(href)) return text
      const titleAttr = title ? ` title="${escapeAttribute(title)}"` : ''
      return `<a href="${escapeAttribute(href)}"${titleAttr} target="_blank" rel="noreferrer">${text}</a>`
    }
  )
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  html = html.replace(/(^|\W)\*([^*]+)\*/g, '$1<em>$2</em>')
  html = html.replace(/(^|\W)_([^_]+)_/g, '$1<em>$2</em>')
  return html.replace(/\n/g, '<br />')
}

function renderList(
  lines: string[],
  startIndex: number,
  ordered: boolean
): { html: string; next: number } {
  const tag = ordered ? 'ol' : 'ul'
  const matcher = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/
  const items: string[] = []
  let index = startIndex
  while (index < lines.length) {
    const match = lines[index].match(matcher)
    if (!match) break
    items.push(`<li>${renderMarkdownInline(match[1])}</li>`)
    index++
  }
  return { html: `<${tag}>${items.join('')}</${tag}>`, next: index }
}

function renderTable(lines: string[], startIndex: number): { html: string; next: number } | null {
  if (startIndex + 1 >= lines.length) return null
  const header = lines[startIndex]
  const divider = lines[startIndex + 1]
  if (!header.includes('|') || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(divider)) {
    return null
  }

  const splitRow = (row: string) =>
    row
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim())

  const headers = splitRow(header)
  const rows: string[][] = []
  let index = startIndex + 2
  while (index < lines.length && lines[index].includes('|') && lines[index].trim() !== '') {
    rows.push(splitRow(lines[index]))
    index++
  }

  const thead = `<thead><tr>${headers.map((cell) => `<th>${renderMarkdownInline(cell)}</th>`).join('')}</tr></thead>`
  const tbody = rows.length
    ? `<tbody>${rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${renderMarkdownInline(cell)}</td>`).join('')}</tr>`
        )
        .join('')}</tbody>`
    : ''
  return { html: `<table>${thead}${tbody}</table>`, next: index }
}

function renderMarkdownBlocks(markdown: string): string {
  const lines = normalizeMarkdown(markdown).split('\n')
  const blocks: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (line.trim() === '') {
      index++
      continue
    }

    const table = renderTable(lines, index)
    if (table) {
      blocks.push(table.html)
      index = table.next
      continue
    }

    const fence = line.match(/^```\s*([\w-]+)?\s*$/)
    if (fence) {
      const language = fence[1]
      const code: string[] = []
      index++
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index])
        index++
      }
      if (index < lines.length) index++
      const languageClass = language ? ` class="language-${escapeAttribute(language)}"` : ''
      blocks.push(`<pre><code${languageClass}>${escapeMarkdownHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      const level = heading[1].length
      blocks.push(`<h${level}>${renderMarkdownInline(heading[2].trim())}</h${level}>`)
      index++
      continue
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push('<hr />')
      index++
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''))
        index++
      }
      blocks.push(`<blockquote>${renderMarkdownBlocks(quote.join('\n'))}</blockquote>`)
      continue
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const list = renderList(lines, index, false)
      blocks.push(list.html)
      index = list.next
      continue
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const list = renderList(lines, index, true)
      blocks.push(list.html)
      index = list.next
      continue
    }

    const paragraph: string[] = [line]
    index++
    while (index < lines.length && lines[index].trim() !== '' && !isBlockStart(lines[index])) {
      paragraph.push(lines[index])
      index++
    }
    blocks.push(`<p>${renderMarkdownInline(paragraph.join('\n'))}</p>`)
  }

  return blocks.join('\n')
}

export function renderMarkdownToHtml(markdown: string, renderer?: MarkdownRenderer): string {
  const rendered = renderer ? renderer.render(markdown) : renderMarkdownBlocks(markdown)
  return sanitizeHtml(rendered)
}

function wrapSelection(
  selection: MarkdownSelection,
  before: string,
  after: string,
  placeholder: string
): MarkdownInsertResult {
  const selected = selection.value.slice(selection.selectionStart, selection.selectionEnd)
  const body = selected || placeholder
  const value =
    selection.value.slice(0, selection.selectionStart) +
    before +
    body +
    after +
    selection.value.slice(selection.selectionEnd)
  const selectionStart = selection.selectionStart + before.length
  return {
    value,
    selectionStart,
    selectionEnd: selectionStart + body.length
  }
}

function prefixLines(
  selection: MarkdownSelection,
  prefixFactory: (index: number) => string,
  placeholder: string
): MarkdownInsertResult {
  const selected =
    selection.value.slice(selection.selectionStart, selection.selectionEnd) || placeholder
  const lines = selected.split('\n')
  const body = lines.map((line, index) => `${prefixFactory(index)}${line}`).join('\n')
  const value =
    selection.value.slice(0, selection.selectionStart) +
    body +
    selection.value.slice(selection.selectionEnd)
  return {
    value,
    selectionStart: selection.selectionStart,
    selectionEnd: selection.selectionStart + body.length
  }
}

function insertBlock(selection: MarkdownSelection, block: string): MarkdownInsertResult {
  const before = selection.value.slice(0, selection.selectionStart)
  const after = selection.value.slice(selection.selectionEnd)
  const prefix = before && !before.endsWith('\n') ? '\n\n' : ''
  const suffix = after && !after.startsWith('\n') ? '\n\n' : ''
  const value = `${before}${prefix}${block}${suffix}${after}`
  const selectionStart = before.length + prefix.length
  return { value, selectionStart, selectionEnd: selectionStart + block.length }
}

export function applyMarkdownToolbarAction(
  action: MarkdownToolbarButton | string,
  selection: MarkdownSelection
): MarkdownInsertResult {
  const name = typeof action === 'string' ? action : action.name
  if (typeof action !== 'string' && action.action) return action.action(selection)

  switch (name) {
    case 'bold':
      return wrapSelection(selection, '**', '**', 'strong text')
    case 'italic':
      return wrapSelection(selection, '*', '*', 'emphasis')
    case 'strikethrough':
      return wrapSelection(selection, '~~', '~~', 'deleted text')
    case 'inlineCode':
      return wrapSelection(selection, '`', '`', 'code')
    case 'heading':
      return prefixLines(selection, () => '## ', 'Heading')
    case 'blockquote':
      return prefixLines(selection, () => '> ', 'Quote')
    case 'unorderedList':
      return prefixLines(selection, () => '- ', 'List item')
    case 'orderedList':
      return prefixLines(selection, (index) => `${index + 1}. `, 'List item')
    case 'codeBlock':
      return wrapSelection(selection, '```\n', '\n```', 'code')
    case 'link':
      return wrapSelection(selection, '[', '](https://example.com)', 'link text')
    case 'image':
      return wrapSelection(selection, '![', '](https://example.com/image.png)', 'alt text')
    case 'table':
      return insertBlock(selection, '| Column | Value |\n| --- | --- |\n| Name | Tigercat |')
    case 'horizontalRule':
      return insertBlock(selection, '---')
    default:
      return selection
  }
}

export function markdownHotkeyMatches(
  event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean; key: string },
  hotkey: string
): boolean {
  const parts = hotkey.split('+').map((part) => part.trim().toLowerCase())
  const key = parts[parts.length - 1]
  const wantsMeta = parts.includes('cmd') || parts.includes('meta')
  return (
    event.key.toLowerCase() === key &&
    event.ctrlKey === parts.includes('ctrl') &&
    event.metaKey === wantsMeta &&
    event.shiftKey === parts.includes('shift') &&
    event.altKey === parts.includes('alt')
  )
}

export function findMarkdownHotkeyMatch(
  toolbar: MarkdownToolbarItem[],
  event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean; key: string }
): MarkdownToolbarButton | null {
  for (const item of toolbar) {
    if (isMarkdownToolbarSeparator(item) || !item.hotkey) continue
    if (markdownHotkeyMatches(event, item.hotkey)) return item
  }
  return null
}
