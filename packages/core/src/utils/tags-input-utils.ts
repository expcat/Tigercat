import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import { classNames } from './class-names'

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

export interface AddTagsResult {
  /** The resulting tag list */
  tags: string[]
  /** Candidates that were actually added */
  added: string[]
  /** Candidates rejected by deduplication or the max limit */
  rejected: string[]
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
  for (const candidate of candidates) {
    const tag = candidate.trim()
    if (!tag) continue
    if (max !== undefined && tags.length >= max) {
      rejected.push(tag)
      continue
    }
    if (!allowDuplicates && tags.includes(tag)) {
      rejected.push(tag)
      continue
    }
    tags.push(tag)
    added.push(tag)
  }
  return { tags, added, rejected }
}

export function removeTagAt(tags: string[], index: number): string[] {
  if (index < 0 || index >= tags.length) return tags
  return [...tags.slice(0, index), ...tags.slice(index + 1)]
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
    'border-[var(--tiger-border,#e5e7eb)] focus-within:ring-[var(--tiger-primary,#2563eb)]/40 focus-within:border-transparent',
  error: 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500',
  success: 'border-green-500 focus-within:ring-green-500 focus-within:border-green-500',
  warning: 'border-yellow-500 focus-within:ring-yellow-500 focus-within:border-yellow-500'
}

export interface GetTagsInputContainerClassesOptions {
  disabled?: boolean
}

export function getTagsInputContainerClasses(
  size: ComponentSize = 'md',
  status: InputStatus = 'default',
  options: GetTagsInputContainerClassesOptions = {}
): string {
  return classNames(
    'flex w-full flex-wrap items-center border rounded-[var(--tiger-radius-md,0.5rem)]',
    'bg-[var(--tiger-surface,#ffffff)] transition-colors focus-within:ring-2',
    TAGS_INPUT_SIZE_CLASSES[size],
    TAGS_INPUT_STATUS_CLASSES[status],
    options.disabled &&
      'cursor-not-allowed bg-[var(--tiger-surface-muted,#f3f4f6)] text-[var(--tiger-text-muted,#6b7280)]'
  )
}

export function getTagsInputInnerInputClasses(): string {
  return classNames(
    'min-w-16 flex-1 border-none bg-transparent p-0 outline-none',
    'text-[var(--tiger-text,#111827)] placeholder:text-[var(--tiger-text-muted,#6b7280)]',
    'disabled:cursor-not-allowed'
  )
}

/** Extra classes marking the tag highlighted for two-step backspace removal */
export function getTagsInputHighlightClasses(): string {
  return 'ring-2 ring-[var(--tiger-primary,#2563eb)]/60'
}

export function getTagsInputClearButtonClasses(): string {
  return classNames(
    'shrink-0 cursor-pointer border-none bg-transparent p-0',
    'text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-text,#111827)]'
  )
}

export function getTagsInputErrorClasses(): string {
  return 'mt-1 text-sm text-[var(--tiger-error,#dc2626)]'
}
