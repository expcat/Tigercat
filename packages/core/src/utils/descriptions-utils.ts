import type { DescriptionsSize, DescriptionsLayout } from '../types/descriptions'

export const descriptionsBaseClasses = 'w-full'

export const descriptionsWrapperClasses =
  'rounded-lg overflow-hidden bg-[var(--tiger-surface,#fff)]'

export const descriptionsHeaderClasses = 'flex items-center justify-between mb-4'

export const descriptionsTitleClasses = 'text-lg font-semibold text-[var(--tiger-text,#111827)]'

export const descriptionsExtraClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'

export const descriptionsSizeClasses: Record<DescriptionsSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
} as const

export const descriptionsTableClasses = 'w-full border-collapse'

export const descriptionsTableBorderedClasses = 'border border-[var(--tiger-border,#e5e7eb)]'

/**
 * Descriptions row classes
 */
export const descriptionsRowClasses = ''

/**
 * Size classes for descriptions cells
 */
export const descriptionsCellSizeClasses: Record<DescriptionsSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4'
} as const

export const descriptionsLabelClasses =
  'font-medium bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-muted,#374151)]'

export const descriptionsLabelBorderedClasses = 'border border-[var(--tiger-border,#e5e7eb)]'

export const descriptionsContentClasses = 'text-[var(--tiger-text,#111827)]'

export const descriptionsContentBorderedClasses = 'border border-[var(--tiger-border,#e5e7eb)]'

/**
 * Vertical layout wrapper classes
 */
export const descriptionsVerticalWrapperClasses = 'space-y-0'

/**
 * Vertical layout item classes
 */
export const descriptionsVerticalItemClasses =
  'border-b border-[var(--tiger-border,#e5e7eb)] last:border-b-0'

/**
 * Vertical layout label classes
 */
export const descriptionsVerticalLabelClasses =
  'font-medium mb-1 text-[var(--tiger-text-muted,#374151)]'

/**
 * Vertical layout content classes
 */
export const descriptionsVerticalContentClasses = 'text-[var(--tiger-text,#111827)]'

/**
 * Get descriptions container classes
 * @param bordered - Whether to show border
 * @param size - Descriptions size
 * @returns Combined class string
 */
export function getDescriptionsClasses(bordered: boolean, size: DescriptionsSize): string {
  return [descriptionsBaseClasses, descriptionsSizeClasses[size]].join(' ')
}

/**
 * Get descriptions table classes
 * @param bordered - Whether to show border
 * @returns Combined class string
 */
export function getDescriptionsTableClasses(bordered: boolean): string {
  const classes = [descriptionsTableClasses]
  if (bordered) {
    classes.push(descriptionsTableBorderedClasses)
  }
  return classes.join(' ')
}

/**
 * Get descriptions label cell classes
 * @param bordered - Whether to show border
 * @param size - Descriptions size
 * @param layout - Descriptions layout
 * @returns Combined class string
 */
export function getDescriptionsLabelClasses(
  bordered: boolean,
  size: DescriptionsSize,
  layout: DescriptionsLayout
): string {
  if (layout === 'vertical') {
    return `${descriptionsVerticalLabelClasses} ${descriptionsCellSizeClasses[size]}`
  }

  const classes = [descriptionsLabelClasses, descriptionsCellSizeClasses[size]]
  if (bordered) {
    classes.push(descriptionsLabelBorderedClasses)
  }
  return classes.join(' ')
}

/**
 * Get descriptions content cell classes
 * @param bordered - Whether to show border
 * @param size - Descriptions size
 * @param layout - Descriptions layout
 * @returns Combined class string
 */
export function getDescriptionsContentClasses(
  bordered: boolean,
  size: DescriptionsSize,
  layout: DescriptionsLayout
): string {
  if (layout === 'vertical') {
    return `${descriptionsVerticalContentClasses} ${descriptionsCellSizeClasses[size]}`
  }

  const classes = [descriptionsContentClasses, descriptionsCellSizeClasses[size]]
  if (bordered) {
    classes.push(descriptionsContentBorderedClasses)
  }
  return classes.join(' ')
}

/**
 * Get descriptions vertical item classes
 * @param bordered - Whether to show border
 * @param size - Descriptions size
 * @returns Combined class string
 */
export function getDescriptionsVerticalItemClasses(
  bordered: boolean,
  size: DescriptionsSize
): string {
  const classes = [descriptionsCellSizeClasses[size]]
  if (!bordered) {
    classes.push(descriptionsVerticalItemClasses)
  }
  return classes.join(' ')
}

/**
 * Group items into rows based on column configuration
 * @param items - Array of description items
 * @param column - Number of columns per row
 * @returns Array of rows, each containing items
 */
export function groupItemsIntoRows<T extends { span?: number }>(items: T[], column: number): T[][] {
  const rows: T[][] = []
  let currentRow: T[] = []
  let currentRowSpan = 0

  for (const item of items) {
    const itemSpan = item.span || 1

    if (currentRowSpan + itemSpan > column && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = []
      currentRowSpan = 0
    }

    currentRow.push(item)
    currentRowSpan += itemSpan

    if (currentRowSpan === column) {
      rows.push(currentRow)
      currentRow = []
      currentRowSpan = 0
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}
