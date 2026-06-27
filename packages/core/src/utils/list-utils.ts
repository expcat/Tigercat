/**
 * List component utilities
 * Shared styles and helpers for List components
 */

import type { ListSize, ListBorderStyle, ListItemLayout } from '../types/list'

/**
 * Base classes for list container
 */
export const listBaseClasses =
  'bg-[var(--tiger-surface,#ffffff)] rounded-[var(--tiger-radius-md,0.5rem)] overflow-hidden'

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

const GRID_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12'
}

const SM_GRID_COLUMNS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
  7: 'sm:grid-cols-7',
  8: 'sm:grid-cols-8',
  9: 'sm:grid-cols-9',
  10: 'sm:grid-cols-10',
  11: 'sm:grid-cols-11',
  12: 'sm:grid-cols-12'
}

const MD_GRID_COLUMNS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12'
}

const LG_GRID_COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
  7: 'lg:grid-cols-7',
  8: 'lg:grid-cols-8',
  9: 'lg:grid-cols-9',
  10: 'lg:grid-cols-10',
  11: 'lg:grid-cols-11',
  12: 'lg:grid-cols-12'
}

const XL_GRID_COLUMNS: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
  7: 'xl:grid-cols-7',
  8: 'xl:grid-cols-8',
  9: 'xl:grid-cols-9',
  10: 'xl:grid-cols-10',
  11: 'xl:grid-cols-11',
  12: 'xl:grid-cols-12'
}

const XXL_GRID_COLUMNS: Record<number, string> = {
  1: '2xl:grid-cols-1',
  2: '2xl:grid-cols-2',
  3: '2xl:grid-cols-3',
  4: '2xl:grid-cols-4',
  5: '2xl:grid-cols-5',
  6: '2xl:grid-cols-6',
  7: '2xl:grid-cols-7',
  8: '2xl:grid-cols-8',
  9: '2xl:grid-cols-9',
  10: '2xl:grid-cols-10',
  11: '2xl:grid-cols-11',
  12: '2xl:grid-cols-12'
}

function getColumnClass(map: Record<number, string>, value?: number): string | undefined {
  if (!value || !Number.isFinite(value)) return undefined
  return map[Math.floor(value)]
}

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

  const baseClass = getColumnClass(GRID_COLUMNS, xs ?? column)
  if (baseClass) classes.push(baseClass)

  const smClass = getColumnClass(SM_GRID_COLUMNS, sm)
  if (smClass) classes.push(smClass)

  const mdClass = getColumnClass(MD_GRID_COLUMNS, md)
  if (mdClass) classes.push(mdClass)

  const lgClass = getColumnClass(LG_GRID_COLUMNS, lg)
  if (lgClass) classes.push(lgClass)

  const xlClass = getColumnClass(XL_GRID_COLUMNS, xl)
  if (xlClass) classes.push(xlClass)

  const xxlClass = getColumnClass(XXL_GRID_COLUMNS, xxl)
  if (xxlClass) classes.push(xxlClass)

  return classes.join(' ')
}
