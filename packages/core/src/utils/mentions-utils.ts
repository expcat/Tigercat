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

/**
 * Extract the mention query immediately before `cursorPos`. The trigger
 * must be at the start of the string or after whitespace.
 */
export function extractMentionQuery(
  text: string,
  cursorPos: number,
  prefix: string | string[] = '@'
): MentionQuery | null {
  const prefixes = normalizeMentionPrefixes(prefix)
    .slice()
    .sort((a, b) => b.length - a.length)
  const before = text.slice(0, cursorPos)
  let best: MentionQuery | null = null
  for (const item of prefixes) {
    const lastPrefixIdx = before.lastIndexOf(item)
    if (lastPrefixIdx === -1) continue
    if (lastPrefixIdx > 0 && !/\s/.test(before[lastPrefixIdx - 1] ?? '')) continue
    const query = before.slice(lastPrefixIdx + item.length)
    if (/\s/.test(query)) continue
    if (
      !best ||
      lastPrefixIdx > best.startPos ||
      (lastPrefixIdx === best.startPos && item.length > best.prefix.length)
    ) {
      best = { query, startPos: lastPrefixIdx, prefix: item }
    }
  }
  return best
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
  filteredCount: number
  loading?: boolean
}): boolean {
  if (!input.query) return false
  return input.filteredCount > 0 || Boolean(input.loading)
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
  const inserted = `${input.prefix}${input.value} `
  return { value: `${before}${inserted}${after}`, caret: before.length + inserted.length }
}

export interface ParsedMention {
  prefix: string
  value: string
  start: number
  end: number
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Parse inserted tokens of the form `prefix + value` (optionally followed
 * by a space). Round-trips with {@link insertMention}.
 */
export function parseMentions(text: string, prefix: string | string[] = '@'): ParsedMention[] {
  const prefixes = normalizeMentionPrefixes(prefix)
    .slice()
    .sort((a, b) => b.length - a.length)
  if (prefixes.length === 0) return []
  const source = prefixes.map(escapeRegExp).join('|')
  const pattern = new RegExp(`(?:^|\\s)(${source})(\\S+)`, 'g')
  const result: ParsedMention[] = []
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const prefixToken = match[1] ?? ''
    const value = match[2] ?? ''
    const consumed = match[0] ?? ''
    const leadingWs = consumed.startsWith(prefixToken) ? 0 : 1
    const start = match.index + leadingWs
    const end = start + prefixToken.length + value.length
    result.push({ prefix: prefixToken, value, start, end })
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
