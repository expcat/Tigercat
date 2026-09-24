/**
 * List component utilities
 */

import type { ComponentSize } from '../types/base'
import type { ListGrid, ListItemLayout } from '../types/list'
import { classNames } from './class-names'
import {
  RESPONSIVE_BREAKPOINT_FALLBACK_PX,
  type ResponsiveBreakpoint,
  resolveResponsiveValue
} from './responsive'

export const listBaseClasses = 'w-full'

export const listBorderedClasses =
  'bg-[var(--tiger-surface)] rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] overflow-hidden'

export const listWrapperClasses = 'w-full'

export const listSizeClasses: Record<ComponentSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
} as const

export const listItemSizeClasses: Record<ComponentSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4'
} as const

/** Default virtual estimate: padding plus a title line and a description line. */
export const listVirtualItemHeight: Record<ComponentSize, number> = {
  sm: 56,
  md: 72,
  lg: 88
}

export const listItemBaseClasses = 'flex w-full tiger-motion-aware transition-colors duration-200'

export const listItemHoverClasses = 'hover:bg-[var(--tiger-surface-muted)]'

export const listItemDividedClasses =
  'border-b border-[var(--tiger-border)] last:border-b-0'

export const listItemLayoutClasses: Record<ListItemLayout, string> = {
  horizontal: 'flex-row items-center',
  vertical: 'flex-col items-start'
} as const

export const listHeaderFooterBaseClasses =
  'border-b border-[var(--tiger-border)] font-medium text-[var(--tiger-text)]'

export const listFooterClasses = 'border-t border-b-0'

export const listEmptyStateClasses = 'py-8'

export const listLoadingOverlayClasses =
  'absolute inset-0 bg-[var(--tiger-surface)]/75 flex items-center justify-center z-10'

export const listItemActivateClasses =
  'flex min-w-0 flex-1 items-center border-0 bg-transparent p-0 text-start text-inherit cursor-pointer'

export const listItemMetaClasses = 'flex items-center gap-3 flex-1 min-w-0'

export const listItemAvatarClasses = 'flex-shrink-0'

export const listItemContentClasses = 'flex-1 min-w-0'

export const listItemTitleClasses = 'font-medium text-[var(--tiger-text)] truncate'

export const listItemDescriptionClasses = 'text-sm text-[var(--tiger-text-secondary)] mt-1'

export const listItemExtraHorizontalClasses = 'flex-shrink-0 ms-4'

export const listItemExtraVerticalClasses = 'flex-shrink-0 mt-2'

export const listGridContainerClasses = 'grid'

export const listDragHandleClasses =
  'inline-flex shrink-0 items-center justify-center rounded-sm p-1 text-[var(--tiger-text-secondary)] cursor-grab touch-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tiger-focus-ring)]'

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

function clampGridColumns(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined
  const n = Math.floor(value)
  if (n < 1 || n > 12) return undefined
  return n
}

export function listGridResponsiveMap(
  grid: ListGrid | undefined
): number | Partial<Record<ResponsiveBreakpoint, number>> | undefined {
  if (!grid) return undefined
  const map: Partial<Record<ResponsiveBreakpoint, number>> = {}
  if (grid.xs !== undefined) map.xs = grid.xs
  if (grid.sm !== undefined) map.sm = grid.sm
  if (grid.md !== undefined) map.md = grid.md
  if (grid.lg !== undefined) map.lg = grid.lg
  if (grid.xl !== undefined) map.xl = grid.xl
  if (grid['2xl'] !== undefined) map['2xl'] = grid['2xl']
  if (Object.keys(map).length === 0) return grid.column
  if (grid.column !== undefined && map.xs === undefined) map.xs = grid.column
  return map
}

export function resolveListGridColumnCount(
  grid: ListGrid | undefined,
  width: number,
  minWidths: Record<ResponsiveBreakpoint, number> = RESPONSIVE_BREAKPOINT_FALLBACK_PX
): number {
  const value = listGridResponsiveMap(grid)
  if (value == null) return 1
  if (typeof value === 'number') return clampGridColumns(value) ?? 1
  const resolved = resolveResponsiveValue(value, width, value.xs ?? value.sm ?? value.md ?? value.lg ?? value.xl ?? value['2xl'] ?? 1, minWidths)
  return clampGridColumns(resolved) ?? 1
}

export function resolveListRowKey(
  item: Record<string, unknown>,
  rowKey: string | ((item: Record<string, unknown>, index: number) => string | number),
  index: number
): string | number {
  const raw = typeof rowKey === 'function' ? rowKey(item, index) : item[rowKey]
  return (raw ?? index) as string | number
}

export function getListGridColumnClass(columnCount: number): string {
  return GRID_COLUMNS[clampGridColumns(columnCount) ?? 1] ?? GRID_COLUMNS[1]
}

export function getListGridGapStyle(gutter: number | undefined): { gap: string } | undefined {
  if (gutter === undefined) return undefined
  const value = Number.isFinite(gutter) && gutter >= 0 ? gutter : 0
  return { gap: `${value}px` }
}

export function getListClasses(bordered: boolean): string {
  return classNames(listBaseClasses, bordered && listBorderedClasses)
}

export function getListItemClasses(
  size: ComponentSize,
  layout: ListItemLayout,
  divided: boolean,
  hoverable = false
): string {
  return classNames(
    listItemBaseClasses,
    listItemSizeClasses[size],
    listItemLayoutClasses[layout],
    divided && listItemDividedClasses,
    hoverable && listItemHoverClasses
  )
}

export function getListItemExtraClasses(layout: ListItemLayout): string {
  return layout === 'vertical' ? listItemExtraVerticalClasses : listItemExtraHorizontalClasses
}

export function getListHeaderFooterClasses(size: ComponentSize, isFooter = false): string {
  return classNames(
    listHeaderFooterBaseClasses,
    listItemSizeClasses[size],
    isFooter && listFooterClasses
  )
}

export function resolveListVirtualItemHeight(
  size: ComponentSize,
  virtualItemHeight?: number
): number {
  if (
    virtualItemHeight !== undefined &&
    Number.isFinite(virtualItemHeight) &&
    virtualItemHeight > 0
  ) {
    return virtualItemHeight
  }
  return listVirtualItemHeight[size]
}

export function getListSourceIndex(
  pageIndex: number,
  currentPage: number,
  pageSize: number,
  remote: boolean
): number {
  if (remote) return pageIndex
  const page = currentPage > 0 ? currentPage : 1
  const size = pageSize > 0 ? pageSize : 10
  return (page - 1) * size + pageIndex
}
