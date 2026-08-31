/**
 * Breadcrumb utility functions
 */

import { classNames } from './class-names'
import type { BreadcrumbSeparator } from '../types/breadcrumb'

/**
 * Base breadcrumb container classes
 */
export const breadcrumbContainerClasses = 'flex w-full items-center gap-2 text-sm'
export const breadcrumbListClasses = 'flex min-w-0 flex-1 items-center flex-wrap gap-2'
export const breadcrumbExtraClasses = 'ms-auto flex items-center'

/**
 * Breadcrumb item base classes
 */
export const breadcrumbItemBaseClasses = 'inline-flex items-center gap-2'

/**
 * Breadcrumb link classes
 */
export const breadcrumbLinkClasses = classNames(
  'text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-primary,#2563eb)]',
  'transition-colors duration-200 motion-reduce:transition-none',
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1 focus:ring-offset-[var(--tiger-surface,#fff)] rounded',
  'cursor-pointer'
)

/**
 * Breadcrumb current item classes (last item, not clickable)
 */
export const breadcrumbCurrentClasses = classNames(
  'text-[var(--tiger-text,#111827)] font-medium',
  'cursor-default'
)

/**
 * Breadcrumb separator base classes
 */
export const breadcrumbSeparatorBaseClasses = 'text-[var(--tiger-text-muted,#9ca3af)] select-none'

/**
 * Get breadcrumb item classes
 */
export function getBreadcrumbItemClasses(className?: string): string {
  return classNames(breadcrumbItemBaseClasses, className)
}

/**
 * Get breadcrumb link classes
 */
export function getBreadcrumbLinkClasses(current?: boolean): string {
  return current ? breadcrumbCurrentClasses : breadcrumbLinkClasses
}

/**
 * Get separator content based on separator type
 */
export type BreadcrumbSeparatorKind = 'slash' | 'arrow' | 'chevron' | 'custom'

export function getSeparatorKind(separator?: BreadcrumbSeparator): BreadcrumbSeparatorKind {
  if (!separator || separator === 'slash') return 'slash'
  if (separator === 'arrow') return 'arrow'
  if (separator === 'chevron') return 'chevron'
  return 'custom'
}

export function getSeparatorContent(separator?: BreadcrumbSeparator): string {
  const kind = getSeparatorKind(separator)
  if (kind === 'slash') return '/'
  if (kind === 'arrow' || kind === 'chevron') return ''
  return separator as string
}

/**
 * Get breadcrumb separator classes
 */
export function getBreadcrumbSeparatorClasses(className?: string): string {
  return classNames(breadcrumbSeparatorBaseClasses, className)
}

/**
 * Breadcrumb ellipsis button classes
 * @since 0.9.0
 */
export const breadcrumbEllipsisClasses = classNames(
  'text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-primary,#2563eb)]',
  'transition-colors duration-200 motion-reduce:transition-none cursor-pointer',
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1 focus:ring-offset-[var(--tiger-surface,#fff)] rounded',
  'px-1'
)

/**
 * Calculate which items to show when maxItems is set.
 * Returns { visible: number[], collapsed: number[] } with indices.
 * Shows first item, last (maxItems - 1) items, and collapses the rest.
 * @since 0.9.0
 */
export function getBreadcrumbCollapsedItems(
  totalItems: number,
  maxItems: number
): { visible: number[]; collapsed: number[] } {
  const all = Array.from({ length: Math.max(0, totalItems) }, (_, i) => i)
  if (!Number.isFinite(maxItems) || maxItems <= 0 || maxItems >= totalItems || totalItems <= 2) {
    return { visible: all, collapsed: [] }
  }

  const tailCount = Math.max(1, Math.trunc(maxItems) - 1)
  const tailStart = totalItems - tailCount
  const visible: number[] = [0]
  const collapsed: number[] = []

  for (let i = 1; i < totalItems; i++) {
    if (i >= tailStart) visible.push(i)
    else collapsed.push(i)
  }

  if (!visible.includes(totalItems - 1)) visible.push(totalItems - 1)

  return { visible, collapsed }
}

export type BreadcrumbSlot = { type: 'item'; index: number } | { type: 'ellipsis' }

export function getBreadcrumbSlots(
  totalItems: number,
  maxItems: number | undefined,
  expanded: boolean
): BreadcrumbSlot[] {
  if (expanded || maxItems === undefined) {
    return allItemSlots(totalItems)
  }
  const { visible, collapsed } = getBreadcrumbCollapsedItems(totalItems, maxItems)
  if (collapsed.length === 0) return visible.map((index) => ({ type: 'item', index }))

  const slots: BreadcrumbSlot[] = []
  let ellipsisInserted = false
  const collapsedSet = new Set(collapsed)
  for (let i = 0; i < totalItems; i++) {
    if (collapsedSet.has(i)) {
      if (!ellipsisInserted) {
        slots.push({ type: 'ellipsis' })
        ellipsisInserted = true
      }
      continue
    }
    slots.push({ type: 'item', index: i })
  }
  return slots
}

function allItemSlots(totalItems: number): BreadcrumbSlot[] {
  return Array.from({ length: Math.max(0, totalItems) }, (_, index) => ({ type: 'item', index }))
}

export function resolveBreadcrumbItemCurrent(
  current: boolean | undefined,
  isLast: boolean
): boolean {
  if (current === false) return false
  if (current === true) return true
  return isLast
}
