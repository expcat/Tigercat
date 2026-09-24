import type { SignaturePoint, SignatureStroke } from '../types/signature'
import { parseMentions, type ParsedMention } from './mentions-utils'
import { moveTransferItems, type TransferMoveResult } from './transfer-utils'

export interface TextFragment {
  text: string
  match: boolean
}

/** Split `text` on case-insensitive occurrences of `query`. */
export function highlightMatchFragments(text: string, query: string): TextFragment[] {
  const needle = query.trim()
  if (!needle) return [{ text, match: false }]
  const lower = text.toLowerCase()
  const target = needle.toLowerCase()
  const fragments: TextFragment[] = []
  let cursor = 0
  let index = lower.indexOf(target, cursor)
  while (index !== -1) {
    if (index > cursor) fragments.push({ text: text.slice(cursor, index), match: false })
    fragments.push({ text: text.slice(index, index + needle.length), match: true })
    cursor = index + needle.length
    index = lower.indexOf(target, cursor)
  }
  if (cursor < text.length) fragments.push({ text: text.slice(cursor), match: false })
  return fragments.length > 0 ? fragments : [{ text, match: false }]
}

export function paginateItems<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const size = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : items.length
  const index = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const start = (index - 1) * size
  return items.slice(start, start + size)
}

export function pageCount(total: number, pageSize: number): number {
  const size = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 1
  return Math.max(1, Math.ceil(total / size))
}

/** One-way transfer ignores the opposite direction. */
export function moveTransferOneWay(
  direction: 'left' | 'right',
  allowed: 'left' | 'right' | 'both',
  targetKeys: (string | number)[],
  selectedKeys: Iterable<string | number>,
  dataSource: Parameters<typeof moveTransferItems>[3]
): TransferMoveResult {
  if (allowed !== 'both' && direction !== allowed) {
    return { targetKeys: targetKeys.slice(), movedKeys: [] }
  }
  return moveTransferItems(direction, targetKeys, selectedKeys, dataSource)
}

export function insertTextAtCaret(
  value: string,
  insert: string,
  start: number,
  end: number = start
): { value: string; caret: number } {
  const safeStart = Math.max(0, Math.min(start, value.length))
  const safeEnd = Math.max(safeStart, Math.min(end, value.length))
  const next = value.slice(0, safeStart) + insert + value.slice(safeEnd)
  return { value: next, caret: safeStart + insert.length }
}

export function shuffleInPlace<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const next = items.slice()
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const current = next[index]
    next[index] = next[swap]
    next[swap] = current
  }
  return next
}

export function mentionAtCaret(text: string, caret: number, prefix: string | string[] = '@'): ParsedMention | null {
  return (
    parseMentions(text, prefix).find((mention) => caret > mention.start && caret <= mention.end) ?? null
  )
}

/** Backspace on an inserted mention removes the whole token. */
export function deleteMentionBeforeCaret(
  text: string,
  caret: number,
  prefix: string | string[] = '@'
): { value: string; caret: number; deleted: boolean } {
  const mention = parseMentions(text, prefix).find((item) => item.end === caret)
  if (!mention) return { value: text, caret, deleted: false }
  return {
    value: text.slice(0, mention.start) + text.slice(mention.end),
    caret: mention.start,
    deleted: true
  }
}

export interface CaretAnchor {
  left: number
  top: number
}

/** Popup origin is the caret, not the textarea box. */
export function caretAnchorFromMirror(mirror: { left: number; top: number; lineHeight: number }): CaretAnchor {
  return { left: mirror.left, top: mirror.top + mirror.lineHeight }
}

export function readOptionRecord(
  record: Record<string, unknown>,
  fields: { label?: string; value?: string; children?: string; disabled?: string }
): { label: string; value: string | number; children?: unknown; disabled?: boolean } | null {
  const value = record[fields.value || 'value']
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const label = record[fields.label || 'label']
  const children = record[fields.children || 'children']
  const disabled = record[fields.disabled || 'disabled']
  return {
    label: label == null ? String(value) : String(label),
    value,
    children,
    disabled: disabled === true
  }
}

export type CheckedStrategy = 'all' | 'parent' | 'child'

export function filterCheckedPaths(
  paths: readonly (readonly (string | number)[])[],
  strategy: CheckedStrategy
): (string | number)[][] {
  const list = paths.map((path) => path.slice())
  if (strategy === 'all') return list
  if (strategy === 'child') {
    return list.filter(
      (path) => !list.some((other) => other.length > path.length && path.every((part, index) => other[index] === part))
    )
  }
  return list.filter(
    (path) => !list.some((other) => other.length < path.length && other.every((part, index) => path[index] === part))
  )
}

export function pushRecentColor(colors: readonly string[], next: string, limit = 8): string[] {
  const rest = colors.filter((color) => color.toLowerCase() !== next.toLowerCase())
  return [next, ...rest].slice(0, limit)
}

export function cycleColorFormat(format: 'hex' | 'rgb' | 'hsl'): 'hex' | 'rgb' | 'hsl' {
  if (format === 'hex') return 'rgb'
  if (format === 'rgb') return 'hsl'
  return 'hex'
}

export function eyeDropperAvailable(scope: { EyeDropper?: unknown } | undefined): boolean {
  return typeof scope?.EyeDropper === 'function'
}

export function reorderList<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items.slice()
  const next = items.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/** Keep real files. A placeholder named `directory` with no size is not a file. */
export function filesFromDirectoryList(files: readonly File[]): File[] {
  return files.filter((file) => {
    if (file.name === 'directory' && file.size === 0 && file.type === '') return false
    return file.size > 0 || file.type !== '' || file.name !== 'directory'
  })
}

export function filesFromClipboard(items: DataTransferItemList | null | undefined): File[] {
  if (!items) return []
  const files: File[] = []
  for (const item of Array.from(items)) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile()
    if (file) files.push(file)
  }
  return files
}

export function pressureLineWidth(base: number, pressure: number | undefined): number {
  const force = pressure === undefined || !Number.isFinite(pressure) ? 0.5 : Math.min(1, Math.max(0, pressure))
  return Math.max(0.5, base * (0.4 + force * 1.2))
}

export function limitSignatureStrokes(strokes: readonly SignatureStroke[], max?: number): SignatureStroke[] {
  if (max === undefined || max < 0 || strokes.length <= max) return strokes.slice()
  return strokes.slice(strokes.length - max)
}

export interface SignatureHistory<T> {
  past: T[]
  present: T
  future: T[]
}

export function signatureUndo<T>(history: SignatureHistory<T>): SignatureHistory<T> {
  const previous = history.past.at(-1)
  if (previous === undefined) return history
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future]
  }
}

export function signatureRedo<T>(history: SignatureHistory<T>): SignatureHistory<T> {
  const next = history.future[0]
  if (next === undefined) return history
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1)
  }
}

export function signatureInkBounds(
  strokes: readonly SignatureStroke[],
  padding = 0
): { x: number; y: number; width: number; height: number } | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const visit = (point: SignaturePoint) => {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }
  strokes.forEach((stroke) => stroke.points.forEach(visit))
  if (!Number.isFinite(minX)) return null
  return {
    x: minX - padding,
    y: minY - padding,
    width: Math.max(1, maxX - minX + padding * 2),
    height: Math.max(1, maxY - minY + padding * 2)
  }
}

export interface FormErrorSummaryItem {
  field: string
  message: string
}

export function formErrorSummary(errors: readonly { field: string; message: string }[]): FormErrorSummaryItem[] {
  const seen = new Set<string>()
  const items: FormErrorSummaryItem[] = []
  for (const error of errors) {
    if (!error.field || seen.has(error.field)) continue
    seen.add(error.field)
    items.push({ field: error.field, message: error.message })
  }
  return items
}

export function collapsedTagSummary(items: readonly { label: string }[]): string {
  return items.map((item) => item.label).join(', ')
}
