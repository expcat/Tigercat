import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type { MentionOption, MentionsFilterOption } from '../types/mentions'
import {
  autoCompleteDropdownClasses,
  autoCompleteEmptyStateClasses,
  autoCompleteListboxClasses,
  getAutoCompleteOptionClasses,
  getAutoCompletePanelStyle
} from './auto-complete-utils'
import { classNames } from './class-names'
import { getInputClasses } from './input-styles'
import { findFirstEnabledIndex, getPickerNavigationIndex } from './picker-utils'

export const mentionsDropdownClasses = autoCompleteDropdownClasses
export const mentionsListboxClasses = autoCompleteListboxClasses
export const mentionsEmptyStateClasses = autoCompleteEmptyStateClasses

export function getMentionsPanelStyle(listHeight: number): { maxHeight: string } {
  return getAutoCompletePanelStyle(listHeight)
}

export function getMentionsTextareaClasses(options: {
  size?: ComponentSize
  status?: InputStatus
  inGroup?: boolean
}): string {
  return classNames(
    'block resize-none',
    getInputClasses({
      size: options.size,
      status: options.status,
      inGroup: options.inGroup
    })
  )
}

export function getMentionsOptionClasses(options: {
  isActive?: boolean
  isDisabled?: boolean
  size?: ComponentSize
}): string {
  return getAutoCompleteOptionClasses({
    isActive: options.isActive,
    isDisabled: options.isDisabled,
    size: options.size
  })
}

export function getMentionOptionKey(option: MentionOption, index: number): string {
  return option.id ?? `${index}-${option.value}`
}

export function normalizeMentionPrefixes(prefix: string | string[] = '@'): string[] {
  const list = Array.isArray(prefix) ? prefix : [prefix]
  return list.filter((item) => item.length > 0)
}

export interface MentionQuery {
  query: string
  startPos: number
  prefix: string
}

/** Characters that end a mention token. Shared by parse and insert. */
const MENTION_SEPARATORS = new Set([' ', '\n', '\t', '\r', '\f'])

/** True at the start of the text and on separator characters. */
export function isMentionSeparator(char: string | undefined): boolean {
  if (char == null || char === '') return true
  return MENTION_SEPARATORS.has(char)
}

/** The separator insert writes after a token. It is in {@link isMentionSeparator}. */
export function mentionInsertSeparator(): string {
  return ' '
}

/**
 * Mention query at the cursor. Scans backward to the nearest legal prefix:
 * the current token must start with that prefix, and the character before
 * it must be a separator (or the start of the text).
 */
export function extractMentionQuery(
  text: string,
  cursorPos: number,
  prefix: string | string[] = '@'
): MentionQuery | null {
  const prefixes = normalizeMentionPrefixes(prefix)
    .slice()
    .sort((a, b) => b.length - a.length)
  if (prefixes.length === 0) return null
  const end = Math.max(0, Math.min(cursorPos, text.length))
  let start = end
  while (start > 0 && !isMentionSeparator(text[start - 1])) start -= 1
  const token = text.slice(start, end)
  for (const item of prefixes) {
    if (!token.startsWith(item)) continue
    return { query: token.slice(item.length), startPos: start, prefix: item }
  }
  return null
}

/** Live textarea value and selection. Insert must use this snapshot only. */
export function readMentionSnapshot(
  text: string,
  cursor: number,
  prefix: string | string[] = '@'
): (MentionQuery & { text: string; cursor: number }) | null {
  const query = extractMentionQuery(text, cursor, prefix)
  if (!query) return null
  return { ...query, text, cursor }
}

export function defaultMentionFilter(query: string, option: MentionOption): boolean {
  if (!query) return true
  const needle = query.toLowerCase()
  return option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle)
}

/**
 * Filter mention options. Disabled options stay in the list; keyboard
 * navigation skips them. Empty query and non-empty query use the same rule.
 */
export function filterMentionOptions(
  options: readonly MentionOption[],
  query: string,
  filterOption: MentionsFilterOption = true
): MentionOption[] {
  if (filterOption === false) return [...options]
  const filterFn = typeof filterOption === 'function' ? filterOption : defaultMentionFilter
  return options.filter((option) => filterFn(query, option))
}

export function shouldOpenMentions(input: {
  query: MentionQuery | null
  filteredCount?: number
  loading?: boolean
}): boolean {
  return Boolean(input.query)
}

/**
 * Insert `prefix + optionValue + space` over `[mentionStart, cursor)`.
 * Uses the live textarea string, not a possibly stale controlled prop.
 */
export function insertMention(input: {
  text: string
  mentionStart: number
  cursor: number
  prefix: string
  value: string
}): { value: string; caret: number } {
  const start = Math.max(0, input.mentionStart)
  const cursor = Math.max(start, input.cursor)
  const before = input.text.slice(0, start)
  const after = input.text.slice(cursor)
  const inserted = `${input.prefix}${input.value}${mentionInsertSeparator()}`
  return { value: `${before}${inserted}${after}`, caret: before.length + inserted.length }
}

export interface ParsedMention {
  prefix: string
  value: string
  start: number
  end: number
}

/**
 * Parse inserted tokens of the form `prefix + value` followed by a
 * {@link isMentionSeparator} character. Round-trips with {@link insertMention}.
 */
export function parseMentions(text: string, prefix: string | string[] = '@'): ParsedMention[] {
  const prefixes = normalizeMentionPrefixes(prefix)
    .slice()
    .sort((a, b) => b.length - a.length)
  if (prefixes.length === 0) return []
  const result: ParsedMention[] = []
  let index = 0
  while (index < text.length) {
    const boundary = index === 0 ? undefined : text[index - 1]
    if (!isMentionSeparator(boundary)) {
      index += 1
      continue
    }
    const matched = prefixes.find((item) => text.startsWith(item, index))
    if (!matched) {
      index += 1
      continue
    }
    const valueStart = index + matched.length
    let valueEnd = valueStart
    while (valueEnd < text.length && !isMentionSeparator(text[valueEnd])) valueEnd += 1
    const value = text.slice(valueStart, valueEnd)
    if (value.length > 0) {
      result.push({ prefix: matched, value, start: index, end: valueEnd })
    }
    index = Math.max(valueEnd, index + 1)
  }
  return result
}

export type MentionsKeyIntent =
  | { type: 'none' }
  | { type: 'navigate'; key: string }
  | { type: 'select-active' }
  | { type: 'close' }

export function getMentionsKeyIntent(key: string, isOpen: boolean): MentionsKeyIntent {
  if (!isOpen) return { type: 'none' }
  if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
    return { type: 'navigate', key }
  }
  if (key === 'Enter') return { type: 'select-active' }
  if (key === 'Escape') return { type: 'close' }
  return { type: 'none' }
}

export function getMentionsActiveIndex(
  options: readonly MentionOption[],
  current: number,
  key: string
): number {
  return getPickerNavigationIndex(options, current, key)
}

export function getInitialMentionsActiveIndex(options: readonly MentionOption[]): number {
  return findFirstEnabledIndex(options)
}
