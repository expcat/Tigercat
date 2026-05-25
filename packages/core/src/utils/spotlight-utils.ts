import type { SpotlightItem, SpotlightItemFilter } from '../types/spotlight'
import { classNames } from './class-names'

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
  'relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-[var(--tiger-radius-lg,0.75rem)] border border-[var(--tiger-spotlight-border,var(--tiger-border,#d1d5db))] bg-[var(--tiger-spotlight-bg,var(--tiger-surface,#ffffff))] shadow-2xl'

export const spotlightHeaderClasses =
  'border-b border-[var(--tiger-spotlight-border,var(--tiger-border,#d1d5db))] px-4 py-3'

export const spotlightTitleClasses =
  'mb-2 text-sm font-semibold text-[var(--tiger-spotlight-title,var(--tiger-text,#111827))]'

export const spotlightInputClasses =
  'w-full rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-spotlight-input-border,var(--tiger-border,#d1d5db))] bg-[var(--tiger-spotlight-input-bg,var(--tiger-surface,#ffffff))] px-3 py-2 text-base text-[var(--tiger-spotlight-input-text,var(--tiger-text,#111827))] outline-none focus:border-[var(--tiger-spotlight-input-border-focus,var(--tiger-primary,#2563eb))] focus:ring-2 focus:ring-[var(--tiger-spotlight-ring,var(--tiger-primary,#2563eb))]/20'

export const spotlightListClasses = 'max-h-[min(28rem,60vh)] overflow-y-auto p-2'

export const spotlightGroupClasses = 'py-1'

export const spotlightGroupLabelClasses =
  'px-2 pb-1 pt-2 text-xs font-semibold uppercase text-[var(--tiger-spotlight-group-text,var(--tiger-text-muted,#6b7280))]'

export const spotlightEmptyClasses =
  'px-4 py-8 text-center text-sm text-[var(--tiger-spotlight-empty-text,var(--tiger-text-muted,#6b7280))]'

export function getSpotlightOptionClasses(active: boolean, disabled: boolean): string {
  return classNames(
    'flex w-full items-center gap-3 rounded-[var(--tiger-radius-md,0.5rem)] px-3 py-2 text-left outline-none',
    disabled
      ? 'cursor-not-allowed text-[var(--tiger-spotlight-item-disabled,var(--tiger-text-muted,#9ca3af))] opacity-60'
      : active
        ? 'cursor-pointer bg-[var(--tiger-spotlight-item-bg-active,var(--tiger-outline-bg-hover,#eff6ff))] text-[var(--tiger-spotlight-item-text-active,var(--tiger-primary,#2563eb))]'
        : 'cursor-pointer text-[var(--tiger-spotlight-item-text,var(--tiger-text,#111827))] hover:bg-[var(--tiger-spotlight-item-bg-hover,var(--tiger-outline-bg-hover,#eff6ff))]'
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

    const matches = options.filterItem ? options.filterItem(query, item) : Number.isFinite(score)

    if (!matches) return

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
