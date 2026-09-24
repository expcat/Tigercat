import type { SpotlightItem, SpotlightItemFilter } from '../types/spotlight'
import { classNames } from './class-names'
import { getIconDefinition } from './icons/registry'

export interface SpotlightSearchResult {
  item: SpotlightItem
  itemIndex: number
  flatIndex: number
  score: number
}

export interface SpotlightSearchGroup {
  label?: string
  items: SpotlightSearchResult[]
}

export interface SpotlightSearchState {
  groups: SpotlightSearchGroup[]
  flatResults: SpotlightSearchResult[]
}

export interface SpotlightSearchOptions {
  filterItem?: SpotlightItemFilter
  limit?: number
}

interface PendingSpotlightResult {
  item: SpotlightItem
  itemIndex: number
  score: number
}

export const spotlightRootClasses =
  'fixed inset-0 flex items-start justify-center px-4 py-6 sm:py-10'

export const spotlightMaskClasses = 'absolute inset-0 bg-black/35'

export const spotlightPanelClasses =
  'relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-[var(--tiger-radius-lg)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] shadow-2xl'

export const spotlightHeaderClasses = 'border-b border-[var(--tiger-border)] px-4 py-3'

export const spotlightTitleClasses = 'mb-2 text-sm font-semibold text-[var(--tiger-text)]'

export const spotlightInputClasses =
  'w-full rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-3 py-2 text-base text-[var(--tiger-text)] outline-none focus:border-[var(--tiger-primary)] focus:ring-2 focus:ring-[var(--tiger-primary)]/20'

export const spotlightListClasses = 'max-h-[min(28rem,60vh)] overflow-y-auto p-2'

export const spotlightGroupClasses = 'py-1'

export const spotlightGroupLabelClasses =
  'px-2 pb-1 pt-2 text-xs font-semibold uppercase text-[var(--tiger-text-secondary)]'

export const spotlightEmptyClasses =
  'px-4 py-8 text-center text-sm text-[var(--tiger-text-secondary)]'

export const spotlightItemDescriptionClasses =
  'block truncate text-xs text-[var(--tiger-text-secondary)]'

export const spotlightShortcutClasses =
  'shrink-0 rounded border border-[var(--tiger-border)] px-1.5 py-0.5 text-xs text-[var(--tiger-text-secondary)]'

export type SpotlightIconKind = 'name' | 'text' | 'node' | 'none'

/** Same icon contract on Vue and React: registered name, text, framework node, or nothing. */
export function resolveSpotlightIconKind(icon: unknown): SpotlightIconKind {
  if (icon == null || icon === false) return 'none'
  if (typeof icon === 'number') return 'text'
  if (typeof icon === 'string') return getIconDefinition(icon) ? 'name' : 'text'
  if (typeof icon === 'object') {
    const record = icon as { $$typeof?: unknown; __v_isVNode?: boolean; type?: unknown; props?: unknown }
    if (record.$$typeof != null || record.__v_isVNode) return 'node'
    if ('type' in record && 'props' in record) return 'node'
  }
  return 'none'
}

export function getSpotlightOptionClasses(active: boolean, disabled: boolean): string {
  return classNames(
    'flex w-full items-center gap-3 rounded-[var(--tiger-radius-md)] px-3 py-2 text-start outline-none',
    disabled
      ? 'cursor-not-allowed text-[var(--tiger-text-secondary)] opacity-60'
      : active
        ? 'cursor-pointer bg-[var(--tiger-outline-bg-hover)] text-[var(--tiger-primary)]'
        : 'cursor-pointer text-[var(--tiger-text)] hover:bg-[var(--tiger-outline-bg-hover)]'
  )
}

export function normalizeSpotlightText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim()
}

export function getSpotlightSearchText(item: SpotlightItem): string {
  return [item.label, item.description, item.group, ...(item.keywords ?? [])]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ')
}

export function getSpotlightFuzzyScore(query: string, target: string): number {
  const normalizedQuery = normalizeSpotlightText(query)
  const normalizedTarget = normalizeSpotlightText(target)

  if (!normalizedQuery) return 0
  if (!normalizedTarget) return Number.POSITIVE_INFINITY
  if (normalizedTarget === normalizedQuery) return 1
  if (normalizedTarget.startsWith(normalizedQuery)) return 2

  const containsIndex = normalizedTarget.indexOf(normalizedQuery)
  if (containsIndex >= 0) return 3 + containsIndex / 1000

  let queryIndex = 0
  let firstMatch = -1
  let previousMatch = -1
  let gapScore = 0

  for (let targetIndex = 0; targetIndex < normalizedTarget.length; targetIndex++) {
    if (normalizedTarget[targetIndex] !== normalizedQuery[queryIndex]) continue

    if (firstMatch < 0) firstMatch = targetIndex
    if (previousMatch >= 0) gapScore += targetIndex - previousMatch - 1
    previousMatch = targetIndex
    queryIndex += 1

    if (queryIndex === normalizedQuery.length) {
      return 4 + firstMatch / 1000 + gapScore / 100
    }
  }

  return Number.POSITIVE_INFINITY
}

export function getSpotlightSearchState(
  items: readonly SpotlightItem[] = [],
  query: string = '',
  options: SpotlightSearchOptions = {}
): SpotlightSearchState {
  const normalizedQuery = normalizeSpotlightText(query)
  const pendingResults: PendingSpotlightResult[] = []

  items.forEach((item, itemIndex) => {
    const score = normalizedQuery
      ? getSpotlightFuzzyScore(normalizedQuery, getSpotlightSearchText(item))
      : itemIndex

    const fuzzyHit = !normalizedQuery || Number.isFinite(score)
    const predicateHit = options.filterItem ? options.filterItem(query, item) : true
    if (!fuzzyHit || !predicateHit) return

    pendingResults.push({ item, itemIndex, score })
  })

  const sortedResults = normalizedQuery
    ? pendingResults.sort((a, b) => a.score - b.score || a.itemIndex - b.itemIndex)
    : pendingResults

  const limitedResults =
    typeof options.limit === 'number' && options.limit >= 0
      ? sortedResults.slice(0, options.limit)
      : sortedResults

  const groups: SpotlightSearchGroup[] = []
  const flatResults: SpotlightSearchResult[] = []

  limitedResults.forEach((result, flatIndex) => {
    const searchResult: SpotlightSearchResult = {
      ...result,
      flatIndex
    }
    flatResults.push(searchResult)

    let group = groups.find((candidate) => candidate.label === result.item.group)
    if (!group) {
      group = { label: result.item.group, items: [] }
      groups.push(group)
    }
    group.items.push(searchResult)
  })

  return { groups, flatResults }
}

export function getSpotlightShortcutLabel(shortcut: string | string[] | undefined): string {
  if (!shortcut) return ''
  return Array.isArray(shortcut) ? shortcut.join(' ') : shortcut
}

const MODIFIER_ALIASES: Record<string, 'meta' | 'ctrl' | 'alt' | 'shift'> = {
  '⌘': 'meta',
  cmd: 'meta',
  command: 'meta',
  meta: 'meta',
  ctrl: 'ctrl',
  control: 'ctrl',
  '^': 'ctrl',
  alt: 'alt',
  option: 'alt',
  '⌥': 'alt',
  shift: 'shift',
  '⇧': 'shift'
}

export interface SpotlightShortcutChord {
  key: string
  meta: boolean
  ctrl: boolean
  alt: boolean
  shift: boolean
}

export function parseSpotlightShortcut(
  shortcut: string | string[] | undefined
): SpotlightShortcutChord | null {
  if (!shortcut) return null
  const tokens = (Array.isArray(shortcut) ? shortcut : shortcut.split(/[\s+]+/))
    .map((token) => token.trim())
    .filter(Boolean)
  if (tokens.length === 0) return null

  const chord: SpotlightShortcutChord = {
    key: '',
    meta: false,
    ctrl: false,
    alt: false,
    shift: false
  }

  for (const token of tokens) {
    const alias = MODIFIER_ALIASES[token.toLowerCase()] ?? MODIFIER_ALIASES[token]
    if (alias) {
      chord[alias] = true
      continue
    }
    chord.key = token
  }

  return chord.key ? chord : null
}

function shortcutKeyMatches(event: KeyboardEvent, key: string): boolean {
  const want = key.length === 1 ? key.toLowerCase() : key.toLowerCase()
  const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase()
  if (want === eventKey) return true
  if (want === ',' && event.key === ',') return true
  return false
}

export function matchesSpotlightShortcut(
  event: KeyboardEvent,
  shortcut: string | string[] | undefined
): boolean {
  const chord = parseSpotlightShortcut(shortcut)
  if (!chord) return false
  if (!shortcutKeyMatches(event, chord.key)) return false
  return (
    event.metaKey === chord.meta &&
    event.ctrlKey === chord.ctrl &&
    event.altKey === chord.alt &&
    event.shiftKey === chord.shift
  )
}

/** Global toggle is off unless the caller opts in. */
export function isSpotlightHotkeyEnabled(hotkey: boolean | string | undefined): boolean {
  return hotkey !== undefined && hotkey !== false
}

const EDITABLE_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
  'date',
  'time',
  'datetime-local'
])

export function isSpotlightEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false
  const element = target as {
    tagName?: string
    isContentEditable?: boolean
    getAttribute?: (name: string) => string | null
  }
  if (element.isContentEditable) return true
  const tag = element.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag !== 'INPUT') return false
  const type = (element.getAttribute?.('type') ?? 'text').toLowerCase()
  return EDITABLE_INPUT_TYPES.has(type)
}

let spotlightHotkeyOwner: object | null = null

/** The same chord belongs to one mounted instance. */
export function claimSpotlightHotkey(owner: object): boolean {
  if (spotlightHotkeyOwner != null && spotlightHotkeyOwner !== owner) return false
  spotlightHotkeyOwner = owner
  return true
}

export function releaseSpotlightHotkey(owner: object): void {
  if (spotlightHotkeyOwner === owner) spotlightHotkeyOwner = null
}

export function isSpotlightToggleHotkey(
  event: KeyboardEvent,
  hotkey: boolean | string | undefined
): boolean {
  if (!isSpotlightHotkeyEnabled(hotkey)) return false
  if (event.defaultPrevented) return false
  if (event.repeat) return false
  if (isSpotlightEditableTarget(event.target)) return false
  if (hotkey === true) {
    return (
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === 'k'
    )
  }
  if (typeof hotkey !== 'string') return false
  return matchesSpotlightShortcut(event, hotkey)
}

export function findSpotlightShortcutItem(
  event: KeyboardEvent,
  items: readonly SpotlightItem[]
): SpotlightItem | undefined {
  if (event.defaultPrevented) return undefined
  if (!event.metaKey && !event.ctrlKey && !event.altKey) return undefined
  return items.find(
    (item) =>
      !item.disabled && Boolean(item.shortcut) && matchesSpotlightShortcut(event, item.shortcut)
  )
}
