/**
 * List component utilities
 * Shared styles and helpers for List components
 */

import type { ListSize, ListBorderStyle, ListItemLayout } from '../types/list'

/**
 * Base classes for list container
 */
export const listBaseClasses = 'bg-[var(--tiger-surface,#ffffff)] rounded-lg overflow-hidden'

/**
 * List wrapper classes
 */
export const listWrapperClasses = 'w-full'

/**
 * Size classes for list padding and spacing
 */
export const listSizeClasses: Record<ListSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
} as const

/**
 * List item size classes
 */
export const listItemSizeClasses: Record<ListSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4'
} as const

/**
 * Border style classes
 */
export const listBorderClasses: Record<ListBorderStyle, string> = {
  none: '',
  divided: '',
  bordered: 'border border-[var(--tiger-border,#e5e7eb)]'
} as const

/**
 * List item base classes
 */
export const listItemBaseClasses = 'flex w-full transition-colors duration-200'

/**
 * List item hover classes
 */
export const listItemHoverClasses = 'hover:bg-[var(--tiger-surface-muted,#f9fafb)]'

/**
 * List item divided classes (border between items)
 */
export const listItemDividedClasses =
  'border-b border-[var(--tiger-border,#e5e7eb)] last:border-b-0'

/**
 * List item layout classes
 */
export const listItemLayoutClasses: Record<ListItemLayout, string> = {
  horizontal: 'flex-row items-center',
  vertical: 'flex-col items-start'
} as const

/**
 * List header/footer base classes
 */
export const listHeaderFooterBaseClasses =
  'border-b border-[var(--tiger-border,#e5e7eb)] font-medium text-[var(--tiger-text,#111827)]'

/**
 * List footer specific classes
 */
export const listFooterClasses = 'border-t border-b-0'

/**
 * List empty state classes
 */
export const listEmptyStateClasses = 'py-8 text-center text-[var(--tiger-text-muted,#6b7280)]'

/**
 * List loading overlay classes
 */
export const listLoadingOverlayClasses =
  'absolute inset-0 bg-[var(--tiger-surface,#ffffff)]/75 flex items-center justify-center z-10'

/**
 * List item meta classes (for avatar + content)
 */
export const listItemMetaClasses = 'flex items-center gap-3 flex-1'

/**
 * List item avatar classes
 */
export const listItemAvatarClasses = 'flex-shrink-0'

/**
 * List item content classes
 */
export const listItemContentClasses = 'flex-1 min-w-0'

/**
 * List item title classes
 */
export const listItemTitleClasses = 'font-medium text-[var(--tiger-text,#111827)] truncate'

/**
 * List item description classes
 */
export const listItemDescriptionClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)] mt-1'

/**
 * List item extra classes
 */
export const listItemExtraClasses = 'flex-shrink-0 ml-4'

/**
 * Grid container classes
 */
export const listGridContainerClasses = 'grid gap-4'

/**
 * Get list container classes
 * @param bordered - Border style
 * @returns Combined class string for list container
 */
export function getListClasses(bordered: ListBorderStyle): string {
  const classes = [listBaseClasses, listBorderClasses[bordered]]
  return classes.filter(Boolean).join(' ')
}

/**
 * Get list item classes
 * @param size - List size
 * @param layout - Item layout
 * @param divided - Whether to show divider
 * @param hoverable - Whether item is hoverable
 * @returns Combined class string for list item
 */
export function getListItemClasses(
  size: ListSize,
  layout: ListItemLayout,
  divided: boolean,
  hoverable = false
): string {
  const classes = [listItemBaseClasses, listItemSizeClasses[size], listItemLayoutClasses[layout]]

  if (divided) {
    classes.push(listItemDividedClasses)
  }

  if (hoverable) {
    classes.push(listItemHoverClasses)
  }

  return classes.join(' ')
}

/**
 * Get list header/footer classes
 * @param size - List size
 * @param isFooter - Whether it's a footer (instead of header)
 * @returns Combined class string for header/footer
 */
export function getListHeaderFooterClasses(size: ListSize, isFooter = false): string {
  const classes = [listHeaderFooterBaseClasses, listItemSizeClasses[size]]

  if (isFooter) {
    classes.push(listFooterClasses)
  }

  return classes.join(' ')
}

/**
 * Get grid column classes based on breakpoint
 * @param column - Default column count
 * @param xs - Extra small breakpoint columns
 * @param sm - Small breakpoint columns
 * @param md - Medium breakpoint columns
 * @param lg - Large breakpoint columns
 * @param xl - Extra large breakpoint columns
 * @param xxl - 2x Extra large breakpoint columns
 * @returns Combined grid column classes
 */
export function getGridColumnClasses(
  column?: number,
  xs?: number,
  sm?: number,
  md?: number,
  lg?: number,
  xl?: number,
  xxl?: number
): string {
  const classes: string[] = []

  if (column) {
    classes.push(`grid-cols-${column}`)
  }
  if (xs) {
    classes.push(`grid-cols-${xs}`)
  }
  if (sm) {
    classes.push(`sm:grid-cols-${sm}`)
  }
  if (md) {
    classes.push(`md:grid-cols-${md}`)
  }
  if (lg) {
    classes.push(`lg:grid-cols-${lg}`)
  }
  if (xl) {
    classes.push(`xl:grid-cols-${xl}`)
  }
  if (xxl) {
    classes.push(`2xl:grid-cols-${xxl}`)
  }

  return classes.join(' ')
}
