/**
 * Badge component utilities
 */

import { devWarn } from './dev-warn'
import type { BadgePosition, BadgeSize, BadgeType } from '../types/badge'

/** Base classes for all badge variants */
export const badgeBaseClasses =
  'inline-flex items-center justify-center font-medium transition-colors'

/** Size classes for badge content (number/text) */
export const badgeSizeClasses: Record<BadgeSize, string> = {
  sm: 'min-w-4 h-4 px-[var(--tiger-component-badge-padding-x,8px)] text-[length:var(--tiger-component-badge-font-size,12px)] font-[number:var(--tiger-component-badge-font-weight,500)]',
  md: 'min-w-5 h-5 px-[var(--tiger-component-badge-padding-x,8px)] text-[length:var(--tiger-component-badge-font-size,12px)] font-[number:var(--tiger-component-badge-font-weight,500)]',
  lg: 'min-w-6 h-6 px-[var(--tiger-component-badge-padding-x,8px)] text-[length:var(--tiger-component-badge-font-size,12px)] font-[number:var(--tiger-component-badge-font-weight,500)]'
} as const

/** Size classes for dot badges */
export const dotSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3'
} as const

/** Shape classes per badge type */
export const badgeTypeClasses: Record<BadgeType, string> = {
  dot: 'rounded-[var(--tiger-component-badge-border-radius,9999px)]',
  number: 'rounded-[var(--tiger-component-badge-border-radius,9999px)]',
  text: 'rounded-[var(--tiger-radius-md,0.5rem)]'
} as const

/** Wrapper classes for non-standalone badge */
export const badgeWrapperClasses = 'relative inline-flex'

/** Position classes for non-standalone badge. `right`/`left` follow the reading direction. */
export const badgePositionClasses: Record<BadgePosition, string> = {
  'top-right': 'absolute -top-1 -end-1',
  'top-left': 'absolute -top-1 -start-1',
  'bottom-right': 'absolute -bottom-1 -end-1',
  'bottom-left': 'absolute -bottom-1 -start-1'
} as const

export type BadgeContentResult =
  { kind: 'hidden' } | { kind: 'dot' } | { kind: 'text'; value: string }

function parseBadgeNumber(content: number | string | undefined): number | undefined {
  if (typeof content === 'number') {
    return Number.isFinite(content) ? content : undefined
  }
  if (typeof content !== 'string') return undefined
  const trimmed = content.trim()
  if (trimmed === '') return undefined
  if (!/^[+-]?(?:\d+|\d*\.\d+)$/.test(trimmed)) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeBadgeMax(max: number | undefined): number {
  if (typeof max !== 'number' || !Number.isFinite(max) || max < 0) return 99
  return Math.floor(max)
}

/**
 * Resolve badge display from `type` + `content`.
 *
 * - `dot`: always shown, content ignored
 * - `number`: finite numbers (or decimal strings) honor `showZero` / `max`;
 *   `0` / `'0'` hide unless `showZero`; empty / NaN / Infinity hide
 * - `text`: stringifies content as-is, never applies `max+`; empty string hides
 */
export function resolveBadgeContent(input: {
  type?: BadgeType
  content?: number | string
  max?: number
  showZero?: boolean
}): BadgeContentResult {
  const type = input.type ?? 'number'
  if (type === 'dot') return { kind: 'dot' }

  if (type === 'text') {
    if (input.content === undefined || input.content === null) return { kind: 'hidden' }
    const value = String(input.content)
    return value === '' ? { kind: 'hidden' } : { kind: 'text', value }
  }

  const numeric = parseBadgeNumber(input.content)
  if (numeric === undefined) return { kind: 'hidden' }
  if (numeric === 0 && !input.showZero) return { kind: 'hidden' }
  const max = normalizeBadgeMax(input.max)
  if (numeric > max) return { kind: 'text', value: `${max}+` }
  return { kind: 'text', value: String(numeric) }
}

export function warnStandaloneBadgeChildren(hasChildren: boolean, standalone: boolean): void {
  if (standalone && hasChildren) {
    devWarn(
      'Badge.standalone.children',
      '[Tigercat] Badge received children while standalone. Pass standalone={false} to overlay the badge on the host.'
    )
  }
}
