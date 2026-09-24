import type {
  PaginationSize,
  PaginationAlign,
  PaginationQuickJumperValidationOptions
} from '../types/pagination'
import { classNames } from './class-names'
import { formatPaginationTotal, getPaginationLabels } from './locale-utils'


type IdleCallbackHandle = number
type IdleCallbackScheduler = (
  callback: () => void,
  options?: { timeout?: number }
) => IdleCallbackHandle
type IdleCallbackCanceller = (handle: IdleCallbackHandle) => void
type TimeoutHandle = ReturnType<typeof setTimeout>
type TimeoutScheduler = (callback: () => void, delay: number) => TimeoutHandle
type TimeoutCanceller = (handle: TimeoutHandle) => void

export interface PaginationIdleValidationSchedulerOptions extends PaginationQuickJumperValidationOptions {
  requestIdleCallback?: IdleCallbackScheduler
  cancelIdleCallback?: IdleCallbackCanceller
  setTimeout?: TimeoutScheduler
  clearTimeout?: TimeoutCanceller
}

export interface PaginationIdleValidationScheduler {
  schedule: (callback: () => void) => void
  cancel: () => void
  flush: () => void
}

const DEFAULT_JUMPER_VALIDATION_DELAY = 120
const DEFAULT_JUMPER_VALIDATION_TIMEOUT = 250
const DEFAULT_PAGE_SIZE = 10

export type PaginationPageToken = number | '...'

export function toFiniteInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.trunc(value)
}

export function normalizePaginationTotal(total: number): number {
  const value = toFiniteInteger(total, 0)
  return value < 0 ? 0 : value
}

export function normalizePaginationPageSize(pageSize: number): number {
  const value = toFiniteInteger(pageSize, DEFAULT_PAGE_SIZE)
  return value > 0 ? value : DEFAULT_PAGE_SIZE
}

function getGlobalRequestIdleCallback(): IdleCallbackScheduler | undefined {
  return typeof globalThis === 'undefined'
    ? undefined
    : (globalThis as { requestIdleCallback?: IdleCallbackScheduler }).requestIdleCallback
}

function getGlobalCancelIdleCallback(): IdleCallbackCanceller | undefined {
  return typeof globalThis === 'undefined'
    ? undefined
    : (globalThis as { cancelIdleCallback?: IdleCallbackCanceller }).cancelIdleCallback
}

export function getPaginationJumperPage(value: string, totalPages: number): number | null {
  if (totalPages <= 0) return null

  const page = parseInt(value, 10)
  if (Number.isNaN(page)) return null

  return validateCurrentPage(page, totalPages)
}

export function getValidatedPaginationJumperValue(value: string, totalPages: number): string {
  if (value.trim().length === 0) return ''

  const page = getPaginationJumperPage(value, totalPages)
  return page === null ? '' : String(page)
}

export function createPaginationIdleValidationScheduler(
  options: PaginationIdleValidationSchedulerOptions = {}
): PaginationIdleValidationScheduler {
  const delay = options.delay ?? DEFAULT_JUMPER_VALIDATION_DELAY
  const timeout = options.timeout ?? DEFAULT_JUMPER_VALIDATION_TIMEOUT
  const requestIdleCallback = options.requestIdleCallback ?? getGlobalRequestIdleCallback()
  const cancelIdleCallback = options.cancelIdleCallback ?? getGlobalCancelIdleCallback()
  const scheduleTimeout = options.setTimeout ?? setTimeout
  const cancelTimeout = options.clearTimeout ?? clearTimeout

  let pendingCallback: (() => void) | null = null
  let timeoutHandle: TimeoutHandle | null = null
  let idleHandle: IdleCallbackHandle | null = null

  const clearScheduled = () => {
    if (timeoutHandle !== null) {
      cancelTimeout(timeoutHandle)
      timeoutHandle = null
    }

    if (idleHandle !== null && cancelIdleCallback) {
      cancelIdleCallback(idleHandle)
      idleHandle = null
    }
  }

  const run = () => {
    const callback = pendingCallback
    pendingCallback = null
    timeoutHandle = null
    idleHandle = null
    callback?.()
  }

  return {
    schedule(callback) {
      pendingCallback = callback
      clearScheduled()

      timeoutHandle = scheduleTimeout(() => {
        timeoutHandle = null

        if (requestIdleCallback) {
          idleHandle = requestIdleCallback(run, { timeout })
          return
        }

        run()
      }, delay)
    },
    cancel() {
      pendingCallback = null
      clearScheduled()
    },
    flush() {
      clearScheduled()
      run()
    }
  }
}

/**
 * Calculate total number of pages
 */
export function getTotalPages(total: number, pageSize: number): number {
  const normalizedTotal = normalizePaginationTotal(total)
  const normalizedSize = normalizePaginationPageSize(pageSize)
  if (normalizedTotal === 0) return 0
  return Math.ceil(normalizedTotal / normalizedSize)
}

/**
 * Calculate the range of items shown on current page
 */
export function getPageRange(current: number, pageSize: number, total: number): [number, number] {
  const normalizedTotal = normalizePaginationTotal(total)
  const normalizedSize = normalizePaginationPageSize(pageSize)
  const pages = getTotalPages(normalizedTotal, normalizedSize)
  const page = validateCurrentPage(current, pages)
  if (normalizedTotal === 0 || pages === 0) return [0, 0]
  const start = (page - 1) * normalizedSize + 1
  const end = Math.min(page * normalizedSize, normalizedTotal)
  return [start, end]
}

/**
 * Clamp `current` to a finite page in `[1, totalPages]`.
 * Non-finite values become 1. Display always uses this value; events never emit NaN.
 */
export function formatPaginationLiveText(
  template: string,
  current: number,
  totalPages: number
): string {
  return template
    .split('{current}')
    .join(String(current))
    .split('{total}')
    .join(String(totalPages))
    .split('{page}')
    .join(String(current))
}

export function validateCurrentPage(current: number, totalPages: number): number {
  const pages = Number.isFinite(totalPages) ? Math.max(0, Math.trunc(totalPages)) : 0
  if (pages <= 0) return 1
  if (current === Infinity) return pages
  const page = toFiniteInteger(current, 1)
  if (page < 1) return 1
  if (page > pages) return pages
  return page
}

/**
 * Calculate page numbers to display
 * @param current - Current page number
 * @param totalPages - Total number of pages
 * @param showLessItems - Whether to show less items (affects range size)
 * @returns Array of page numbers and separators ('...')
 */
export function getPageNumbers(
  current: number,
  totalPages: number,
  showLessItems: boolean = false
): PaginationPageToken[] {
  const pagesCount = Number.isFinite(totalPages) ? Math.max(0, Math.trunc(totalPages)) : 0
  if (pagesCount <= 0) return []

  const page = validateCurrentPage(current, pagesCount)
  const pageRange = showLessItems ? 1 : 2
  const tokens: PaginationPageToken[] = [1]

  let rangeStart = Math.max(2, page - pageRange)
  let rangeEnd = Math.min(pagesCount - 1, page + pageRange)
  if (rangeStart === 3) rangeStart = 2
  if (rangeEnd === pagesCount - 2) rangeEnd = pagesCount - 1

  if (rangeStart > 2) tokens.push('...')

  for (let i = rangeStart; i <= rangeEnd; i++) {
    tokens.push(i)
  }

  if (rangeEnd < pagesCount - 1) tokens.push('...')
  if (pagesCount > 1) tokens.push(pagesCount)

  return tokens
}

export function defaultTotalText(total: number, range: [number, number]): string {
  return formatPaginationTotal(getPaginationLabels().totalText, total, range)
}

/**
 * Page-count threshold above which built-in pagination (Table/List) switches
 * from the simple prev/next indicator to full page-number buttons plus a
 * quick jumper.
 */
export const PAGINATION_FULL_MODE_PAGE_THRESHOLD = 3

/**
 * Resolved display mode for built-in pagination.
 */
export interface PaginationDisplayMode {
  simple: boolean
  showQuickJumper: boolean
}

/**
 * Resolve the display mode for built-in pagination (Table/List).
 *
 * By default, more than {@link PAGINATION_FULL_MODE_PAGE_THRESHOLD} pages
 * enables page-number buttons and the quick jumper; otherwise the simple
 * prev/next indicator is used. Explicit `simple` / `showQuickJumper`
 * config values override the automatic behavior.
 */
export function resolvePaginationDisplayMode(
  totalPages: number,
  config?: { simple?: boolean; showQuickJumper?: boolean }
): PaginationDisplayMode {
  const useFullMode = totalPages > PAGINATION_FULL_MODE_PAGE_THRESHOLD
  return {
    simple: config?.simple ?? !useFullMode,
    showQuickJumper: config?.showQuickJumper ?? useFullMode
  }
}

/**
 * Get container classes for pagination
 */
export function resolvePaginationAlign(
  align: PaginationAlign = 'center'
): 'start' | 'center' | 'end' {
  if (align === 'left' || align === 'start') return 'start'
  if (align === 'right' || align === 'end') return 'end'
  return 'center'
}

export function getPaginationContainerClasses(
  align: PaginationAlign = 'center',
  className?: string
): string {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end'
  }

  return classNames(
    'flex items-center gap-1 motion-reduce:transition-none',
    alignClasses[resolvePaginationAlign(align)],
    className
  )
}

/**
 * Get base button classes for pagination buttons
 */
export function getPaginationButtonBaseClasses(
  size: PaginationSize = 'md',
  active = false
): string {
  const sizeClasses = {
    sm: 'min-w-7 h-7 text-sm px-2',
    md: 'min-w-8 h-8 text-base px-2.5',
    lg: 'min-w-10 h-10 text-lg px-3'
  }

  // Active/inactive color utilities are mutually exclusive so a button never
  // emits two conflicting `bg-*`/`text-*`/`border-*` classes at once. Merging
  // both would leave the winner up to Tailwind's CSS source order, which is how
  // the active page number ended up rendering as white text on a white surface.
  const colorClasses = active
    ? getPaginationButtonActiveClasses()
    : classNames(
        'border-[var(--tiger-border)]',
        'bg-[var(--tiger-surface)] text-[var(--tiger-text)]',
        'hover:border-[var(--tiger-primary)] hover:text-[var(--tiger-primary)]',
        'disabled:hover:border-[var(--tiger-border)] disabled:hover:text-[var(--tiger-text)]'
      )

  return classNames(
    'inline-flex items-center justify-center',
    'rounded-[var(--tiger-radius-md)] border',
    'transition-colors duration-200 motion-reduce:transition-none',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary)]/40',
    'disabled:cursor-not-allowed disabled:opacity-50',
    colorClasses,
    sizeClasses[size]
  )
}

/**
 * Get active button classes
 */
export function getPaginationButtonActiveClasses(): string {
  return classNames(
    'border-[var(--tiger-primary)]',
    'bg-[var(--tiger-primary)]',
    'text-white',
    'hover:border-[var(--tiger-primary-hover)] hover:bg-[var(--tiger-primary-hover)] hover:text-white'
  )
}

/**
 * Get ellipsis classes
 */
/** Pages hidden by one ellipsis token. Same clamp as the quick jumper. */
export function paginationEllipsisPages(
  tokens: readonly PaginationPageToken[],
  ellipsisIndex: number,
  totalPages: number
): number[] {
  const previous = tokens[ellipsisIndex - 1]
  const next = tokens[ellipsisIndex + 1]
  const start = typeof previous === 'number' ? previous + 1 : 1
  const end = typeof next === 'number' ? next - 1 : totalPages
  const pages: number[] = []
  for (let page = start; page <= end; page++) {
    const clamped = validateCurrentPage(page, totalPages)
    if (!pages.includes(clamped)) pages.push(clamped)
  }
  return pages
}

export function clampPaginationJump(value: string, totalPages: number): number | null {
  return getPaginationJumperPage(value, totalPages)
}

export type PaginationItemKind = 'page' | 'prev' | 'next' | 'ellipsis'

export function getPaginationEllipsisClasses(size: PaginationSize = 'md'): string {
  const sizeClasses = {
    sm: 'min-w-7 h-7 text-sm',
    md: 'min-w-8 h-8 text-base',
    lg: 'min-w-10 h-10 text-lg'
  }

  return classNames(
    'inline-flex items-center justify-center',
    'text-[var(--tiger-text-secondary)] cursor-default',
    sizeClasses[size]
  )
}

/**
 * Get quick jumper input classes
 */
export function getQuickJumperInputClasses(size: PaginationSize = 'md'): string {
  const sizeClasses = {
    sm: 'w-12 h-7 text-sm',
    md: 'w-14 h-8 text-base',
    lg: 'w-16 h-10 text-lg'
  }

  return classNames(
    'inline-block',
    'px-2 py-1',
    'rounded border border-[var(--tiger-border)]',
    'text-center',
    'transition-colors duration-200 motion-reduce:transition-none',
    'hover:border-[var(--tiger-primary)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary)] focus:ring-opacity-50',
    'disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[size]
  )
}

/**
 * Get page size selector classes
 */
export function getPageSizeSelectorClasses(size: PaginationSize = 'md'): string {
  const sizeClasses = {
    sm: 'h-7 text-sm',
    md: 'h-8 text-base',
    lg: 'h-10 text-lg'
  }

  return classNames(
    'inline-block',
    'px-2 py-1',
    'rounded border border-[var(--tiger-border)]',
    'bg-[var(--tiger-surface)]',
    'transition-colors duration-200 motion-reduce:transition-none',
    'hover:border-[var(--tiger-primary)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary)] focus:ring-opacity-50',
    'disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[size]
  )
}

/**
 * Get text size class for a given pagination size
 */
export function getSizeTextClasses(size: PaginationSize = 'md'): string {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  return sizeClasses[size]
}

/**
 * Get total text classes
 */
export function getTotalTextClasses(size: PaginationSize = 'md'): string {
  return classNames('text-[var(--tiger-text-secondary)]', 'me-2', getSizeTextClasses(size))
}

export function getQuickJumperPrefixClasses(size: PaginationSize = 'md'): string {
  return classNames('ms-2', getSizeTextClasses(size))
}

export function resolvePageSizeOptions(
  options: Array<number | { value: number; label?: string }>,
  currentPageSize: number,
  itemsPerPageText: string
): Array<{ value: number; label: string }> {
  const normalized = options.map((option) => {
    if (typeof option === 'number') {
      return { value: option, label: `${option} ${itemsPerPageText}` }
    }
    return {
      value: option.value,
      label: option.label ?? `${option.value} ${itemsPerPageText}`
    }
  })
  if (!normalized.some((option) => option.value === currentPageSize)) {
    normalized.unshift({
      value: currentPageSize,
      label: `${currentPageSize} ${itemsPerPageText}`
    })
  }
  return normalized
}

/**
 * Get container classes for built-in pagination rendered by Table/List.
 * Wraps a Pagination component below the data area.
 */
export function getBuiltInPaginationContainerClasses(): string {
  return classNames('px-4 py-3', 'border-t border-[var(--tiger-border)]')
}
