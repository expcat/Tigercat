/**
 * Breadcrumb utility functions
 */

import { classNames } from './class-names'
import type { BreadcrumbSeparator } from '../types/breadcrumb'

/**
 * Base breadcrumb container classes
 */
export const breadcrumbContainerClasses = 'flex items-center flex-wrap gap-2 text-sm'

/**
 * Breadcrumb item base classes
 */
export const breadcrumbItemBaseClasses = 'inline-flex items-center gap-2'

/**
 * Breadcrumb link classes
 */
export const breadcrumbLinkClasses = classNames(
  'text-gray-600 hover:text-[var(--tiger-primary,#2563eb)]',
  'transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1 rounded',
  'cursor-pointer'
)

/**
 * Breadcrumb current item classes (last item, not clickable)
 */
export const breadcrumbCurrentClasses = classNames('text-gray-900 font-medium', 'cursor-default')

/**
 * Breadcrumb separator base classes
 */
export const breadcrumbSeparatorBaseClasses = 'text-gray-400 select-none'

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
export function getSeparatorContent(separator?: BreadcrumbSeparator): string {
  if (!separator) return '/'

  switch (separator) {
    case 'slash':
      return '/'
    case 'arrow':
      return '→'
    case 'chevron':
      return '›'
    default:
      return separator
  }
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
  'text-gray-600 hover:text-[var(--tiger-primary,#2563eb)]',
  'transition-colors duration-200 cursor-pointer',
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1 rounded',
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
  if (maxItems <= 0 || maxItems >= totalItems) {
    return {
      visible: Array.from({ length: totalItems }, (_, i) => i),
      collapsed: []
    }
  }

  const visible: number[] = [0]
  const collapsed: number[] = []

  const tailCount = maxItems - 1
  const tailStart = totalItems - tailCount

  for (let i = 1; i < totalItems; i++) {
    if (i >= tailStart) {
      visible.push(i)
    } else {
      collapsed.push(i)
    }
  }

  return { visible, collapsed }
}
