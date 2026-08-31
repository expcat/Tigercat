import type { ComponentSize } from '../types/base'
import type { DescriptionsLayout } from '../types/descriptions'

export const descriptionsBaseClasses = 'w-full'

export const descriptionsWrapperClasses = 'w-full'

export const descriptionsBorderedWrapperClasses =
  'rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-surface,#ffffff)]'

export const descriptionsHeaderClasses = 'flex items-center justify-between mb-4'

export const descriptionsTitleClasses = 'text-lg font-semibold text-[var(--tiger-text,#111827)]'

export const descriptionsExtraClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'

export const descriptionsSizeClasses: Record<ComponentSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
} as const

export const descriptionsTableClasses = 'w-full border-collapse'

export const descriptionsTableBorderedClasses =
  'border border-[var(--tiger-border,#e5e7eb)] overflow-hidden rounded-[var(--tiger-radius-md,0.5rem)]'

export const descriptionsCellSizeClasses: Record<ComponentSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4'
} as const

export const descriptionsLabelClasses =
  'font-medium bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-muted,#6b7280)]'

export const descriptionsLabelBorderedClasses = 'border border-[var(--tiger-border,#e5e7eb)]'

export const descriptionsContentClasses = 'text-[var(--tiger-text,#111827)]'

export const descriptionsContentBorderedClasses = 'border border-[var(--tiger-border,#e5e7eb)]'

export const descriptionsVerticalGridClasses = 'grid w-full'

export const descriptionsVerticalItemClasses =
  'border-b border-[var(--tiger-border,#e5e7eb)] last:border-b-0 min-w-0'

export const descriptionsVerticalLabelClasses =
  'font-medium mb-1 text-[var(--tiger-text-muted,#6b7280)]'

export const descriptionsVerticalContentClasses = 'text-[var(--tiger-text,#111827)]'

export const descriptionsCaptionClasses = 'text-start text-lg font-semibold mb-4'

export function getDescriptionsClasses(size: ComponentSize, bordered: boolean): string {
  return [
    descriptionsBaseClasses,
    descriptionsWrapperClasses,
    bordered ? descriptionsBorderedWrapperClasses : '',
    descriptionsSizeClasses[size]
  ]
    .filter(Boolean)
    .join(' ')
}

export function getDescriptionsTableClasses(bordered: boolean): string {
  const classes = [descriptionsTableClasses]
  if (bordered) {
    classes.push(descriptionsTableBorderedClasses)
  }
  return classes.join(' ')
}

export function getDescriptionsLabelClasses(
  bordered: boolean,
  size: ComponentSize,
  layout: DescriptionsLayout
): string {
  if (layout === 'vertical' && !bordered) {
    return descriptionsVerticalLabelClasses
  }

  const classes = [
    layout === 'vertical' ? descriptionsVerticalLabelClasses : descriptionsLabelClasses,
    descriptionsCellSizeClasses[size]
  ]
  if (bordered) {
    classes.push(descriptionsLabelBorderedClasses)
  }
  return classes.join(' ')
}

export function getDescriptionsContentClasses(
  bordered: boolean,
  size: ComponentSize,
  layout: DescriptionsLayout
): string {
  if (layout === 'vertical' && !bordered) {
    return descriptionsVerticalContentClasses
  }

  const classes = [
    layout === 'vertical' ? descriptionsVerticalContentClasses : descriptionsContentClasses,
    descriptionsCellSizeClasses[size]
  ]
  if (bordered) {
    classes.push(descriptionsContentBorderedClasses)
  }
  return classes.join(' ')
}

export function getDescriptionsVerticalItemClasses(size: ComponentSize, bordered: boolean): string {
  if (bordered) return descriptionsCellSizeClasses[size]
  return `${descriptionsCellSizeClasses[size]} ${descriptionsVerticalItemClasses}`
}

export function getDescriptionsVerticalGridStyle(column: number): {
  gridTemplateColumns: string
} {
  const count = column > 0 && Number.isFinite(column) ? Math.floor(column) : 1
  return { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }
}

function clampColumn(column: number): number {
  if (!Number.isFinite(column) || column <= 0) return 1
  return Math.floor(column)
}

function clampSpan(span: number | undefined, column: number): number {
  const value = span ?? 1
  if (!Number.isFinite(value) || value < 1) return 1
  return Math.min(Math.floor(value), column)
}

function fillRow<T extends { span?: number }>(row: T[], column: number, used: number): T[] {
  if (used >= column || row.length === 0) return row
  const last = row[row.length - 1]
  const next = [...row]
  next[next.length - 1] = { ...last, span: (last.span ?? 1) + (column - used) }
  return next
}

/**
 * Group items into rows of `column` slots. Spans larger than `column` are
 * clamped. When the last item in a row cannot fill the row, that item's span
 * is stretched so the row occupies every slot.
 */
export function groupItemsIntoRows<T extends { span?: number }>(items: T[], column: number): T[][] {
  const cols = clampColumn(column)
  const rows: T[][] = []
  let currentRow: T[] = []
  let currentRowSpan = 0

  for (const item of items) {
    const itemSpan = clampSpan(item.span, cols)

    if (currentRowSpan + itemSpan > cols && currentRow.length > 0) {
      rows.push(fillRow(currentRow, cols, currentRowSpan))
      currentRow = []
      currentRowSpan = 0
    }

    currentRow.push({ ...item, span: itemSpan })
    currentRowSpan += itemSpan

    if (currentRowSpan === cols) {
      rows.push(currentRow)
      currentRow = []
      currentRowSpan = 0
    }
  }

  if (currentRow.length > 0) {
    rows.push(fillRow(currentRow, cols, currentRowSpan))
  }

  return rows
}

/** Table `colSpan` for a horizontal label+content pair. */
export function getDescriptionsHorizontalColSpan(span: number): number {
  const value = span > 0 && Number.isFinite(span) ? Math.floor(span) : 1
  return value > 1 ? value * 2 - 1 : 1
}
