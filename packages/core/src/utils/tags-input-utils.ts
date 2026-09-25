import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import { classNames } from './class-names'
import { getFieldMessageClasses } from './form-item-styles'

export interface ExtractTagCandidatesResult {
  /** Complete segments (trimmed, non-empty) that ended with a delimiter */
  candidates: string[]
  /** Text after the last delimiter, kept as the pending input value */
  pending: string
}

/**
 * Split a typed input value on the configured delimiters. Segments before a
 * delimiter become candidates; the remainder stays pending in the input.
 */
export function extractTagCandidates(
  inputValue: string,
  delimiters: string[] = [',']
): ExtractTagCandidatesResult {
  const separators = delimiters.filter((delimiter) => delimiter.length > 0)
  if (separators.length === 0) return { candidates: [], pending: inputValue }

  const candidates: string[] = []
  let rest = inputValue
  for (;;) {
    let earliest = -1
    let separatorLength = 0
    for (const separator of separators) {
      const index = rest.indexOf(separator)
      if (index !== -1 && (earliest === -1 || index < earliest)) {
        earliest = index
        separatorLength = separator.length
      }
    }
    if (earliest === -1) break
    const segment = rest.slice(0, earliest).trim()
    if (segment) candidates.push(segment)
    rest = rest.slice(earliest + separatorLength)
  }
  return { candidates, pending: rest }
}

/**
 * Split pasted text into tag candidates: the configured delimiters plus
 * newlines all split, every non-empty trimmed segment is a candidate.
 */
export function splitTagInput(raw: string, delimiters: string[] = [',']): string[] {
  const { candidates, pending } = extractTagCandidates(raw, [...delimiters, '\n', '\r'])
  const last = pending.trim()
  return last ? [...candidates, last] : candidates
}

export interface AddTagsOptions {
  /** @default false */
  allowDuplicates?: boolean
  max?: number
}

export type TagRejectReason = 'duplicate' | 'max'

export interface TagRejection {
  tag: string
  reason: TagRejectReason
}

export interface AddTagsResult {
  /** The resulting tag list */
  tags: string[]
  /** Candidates that were actually added */
  added: string[]
  /** Candidates rejected by deduplication or the max limit */
  rejected: string[]
  /** Why each rejected candidate was refused. */
  rejections: TagRejection[]
}

/**
 * Add candidate tags to the current list, applying deduplication and the
 * max limit. Candidates are trimmed; empty ones are dropped silently.
 */
export function addTags(
  current: string[],
  candidates: string[],
  options: AddTagsOptions = {}
): AddTagsResult {
  const { allowDuplicates = false, max } = options
  const tags = [...current]
  const added: string[] = []
  const rejected: string[] = []
  const rejections: TagRejection[] = []
  for (const candidate of candidates) {
    const tag = candidate.trim()
    if (!tag) continue
    if (max !== undefined && tags.length >= max) {
      rejected.push(tag)
      rejections.push({ tag, reason: 'max' })
      continue
    }
    if (!allowDuplicates && tags.includes(tag)) {
      rejected.push(tag)
      rejections.push({ tag, reason: 'duplicate' })
      continue
    }
    tags.push(tag)
    added.push(tag)
  }
  return { tags, added, rejected, rejections }
}

export function moveTag(tags: readonly string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= tags.length || to >= tags.length) {
    return tags.slice()
  }
  const next = tags.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function formatTagRejectAnnouncement(template: string, rejection: TagRejection): string {
  return template.replace('{tag}', rejection.tag).replace('{reason}', rejection.reason)
}

export function removeTagAt(tags: string[], index: number): string[] {
  if (index < 0 || index >= tags.length) return tags
  return [...tags.slice(0, index), ...tags.slice(index + 1)]
}

export function prepareTagCandidates(
  candidates: string[],
  beforeAdd?: (tag: string) => boolean | string
): string[] {
  const prepared: string[] = []
  for (const raw of candidates) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    if (!beforeAdd) {
      prepared.push(trimmed)
      continue
    }
    const result = beforeAdd(trimmed)
    if (result === false) continue
    prepared.push(typeof result === 'string' ? result.trim() : trimmed)
  }
  return prepared.filter(Boolean)
}

export interface CommitTagCandidatesResult extends AddTagsResult {
  /** Pending text to keep in the input. Rejected-only commits keep the last candidate. */
  pending: string
}

export function commitTagCandidates(
  current: string[],
  candidates: string[],
  options: AddTagsOptions & {
    beforeAdd?: (tag: string) => boolean | string
    pendingFallback?: string
  } = {}
): CommitTagCandidatesResult {
  const prepared = prepareTagCandidates(candidates, options.beforeAdd)
  if (prepared.length === 0) {
    return {
      tags: current,
      added: [],
      rejected: [],
      rejections: [],
      pending: options.pendingFallback ?? candidates.map((item) => item.trim()).find(Boolean) ?? ''
    }
  }
  const result = addTags(current, prepared, options)
  return {
    ...result,
    rejections: result.rejections,
    pending: result.added.length > 0 ? '' : (options.pendingFallback ?? prepared.at(-1) ?? '')
  }
}

/**
 * Insert the clipboard at the caret, then split the whole string.
 * Text after the last delimiter stays pending instead of becoming a tag.
 */
export function resolveTagsPaste(options: {
  pending: string
  clipboard: string
  delimiters?: string[]
  selectionStart?: number
  selectionEnd?: number
}): { candidates: string[]; pending: string } {
  const delimiters = options.delimiters ?? [',']
  const start = options.selectionStart ?? options.pending.length
  const end = options.selectionEnd ?? start
  const safeStart = Math.max(0, Math.min(start, options.pending.length))
  const safeEnd = Math.max(safeStart, Math.min(end, options.pending.length))
  const inserted =
    options.pending.slice(0, safeStart) + options.clipboard + options.pending.slice(safeEnd)
  return extractTagCandidates(inserted, [...delimiters, '\n', '\r'])
}

export function getTagsArrowDelta(key: string, dir: 'ltr' | 'rtl' = 'ltr'): number | null {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return null
  const inline = dir === 'rtl' ? -1 : 1
  return key === 'ArrowLeft' ? -inline : inline
}

export function moveTagsHighlight(
  current: number | null,
  tagCount: number,
  delta: number
): number | null {
  if (tagCount <= 0) return null
  if (current === null) {
    return delta < 0 ? tagCount - 1 : null
  }
  const next = current + delta
  if (next < 0) return 0
  if (next >= tagCount) return null
  return next
}

/** One hidden field per tag so values can contain the delimiter. */
export function getTagsHiddenValues(tags: string[]): string[] {
  return tags
}

/**
 * Format a remove-tag aria-label template. Supports `{tag}`.
 */
export function formatRemoveTagLabel(template: string, tag: string): string {
  return template.replace('{tag}', tag)
}

const TAGS_INPUT_SIZE_CLASSES: Record<ComponentSize, string> = {
  sm: 'min-h-8 px-2 py-1 text-sm gap-1',
  md: 'min-h-10 px-3 py-1.5 text-base gap-1.5',
  lg: 'min-h-12 px-4 py-2 text-lg gap-2'
}

const TAGS_INPUT_STATUS_CLASSES: Record<InputStatus, string> = {
  default:
    'border-[var(--tiger-border)] focus-within:has-[:focus-visible]:ring-[var(--tiger-focus-ring)]/40 focus-within:has-[:focus-visible]:border-transparent',
  error: 'border-[var(--tiger-error)]',
  success: 'border-[var(--tiger-success)]',
  warning: 'border-[var(--tiger-warning)]'
}

export interface GetTagsInputContainerClassesOptions {
  disabled?: boolean
  inGroup?: boolean
}

export function getTagsInputContainerClasses(
  size: ComponentSize = 'md',
  status: InputStatus = 'default',
  options: GetTagsInputContainerClassesOptions = {}
): string {
  return classNames(
    'flex flex-wrap items-center border rounded-[var(--tiger-radius-md)]',
    'bg-[var(--tiger-surface)] tiger-motion-aware',
    '[transition:var(--tiger-transition-base)]',
    'focus-within:has-[:focus-visible]:ring-2',
    TAGS_INPUT_SIZE_CLASSES[size],
    TAGS_INPUT_STATUS_CLASSES[status],
    options.inGroup ? 'flex-1 min-w-0' : 'w-full',
    options.disabled &&
      'cursor-not-allowed bg-[var(--tiger-surface-muted)] text-[var(--tiger-text-secondary)]'
  )
}

export function getTagsInputInnerInputClasses(): string {
  return classNames(
    'min-w-16 flex-1 border-none bg-transparent p-0 outline-none',
    'text-[var(--tiger-text)] placeholder:text-[var(--tiger-text-secondary)]',
    'disabled:cursor-not-allowed'
  )
}

/** Extra classes marking the tag highlighted for two-step backspace removal */
export function getTagsInputHighlightClasses(): string {
  return 'ring-2 ring-[var(--tiger-focus-ring)]/60'
}

export function getTagsInputClearButtonClasses(): string {
  return classNames(
    'shrink-0 cursor-pointer border-none bg-transparent p-0',
    'text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-text)]'
  )
}

export function getTagsInputErrorClasses(size: ComponentSize = 'md'): string {
  return getFieldMessageClasses(size, 'error')
}
