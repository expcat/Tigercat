/**
 * Descriptions component utilities
 * Shared styles and helpers for Descriptions components
 */

import type { DescriptionsSize, DescriptionsLayout } from '../types/descriptions'

/**
 * Base classes for descriptions container
 */
export const descriptionsBaseClasses = 'w-full'

/**
 * Descriptions wrapper classes
 */
export const descriptionsWrapperClasses = 'bg-white rounded-lg overflow-hidden'

/**
 * Descriptions header classes
 */
export const descriptionsHeaderClasses = 'flex items-center justify-between mb-4'

/**
 * Descriptions title classes
 */
export const descriptionsTitleClasses = 'text-lg font-semibold text-gray-900'

/**
 * Descriptions extra classes
 */
export const descriptionsExtraClasses = 'text-sm text-gray-600'

/**
 * Size classes for descriptions padding and text
 */
export const descriptionsSizeClasses: Record<DescriptionsSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const

/**
 * Descriptions table classes (for bordered layout)
 */
export const descriptionsTableClasses = 'w-full border-collapse'

/**
 * Descriptions table bordered classes
 */
export const descriptionsTableBorderedClasses = 'border border-gray-200'

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
  lg: 'px-6 py-4',
} as const

/**
 * Label cell classes
 */
export const descriptionsLabelClasses = 'font-medium text-gray-700 bg-gray-50'

/**
 * Label cell bordered classes
 */
export const descriptionsLabelBorderedClasses = 'border border-gray-200'

/**
 * Content cell classes
 */
export const descriptionsContentClasses = 'text-gray-900'

/**
 * Content cell bordered classes
 */
export const descriptionsContentBorderedClasses = 'border border-gray-200'

/**
 * Vertical layout wrapper classes
 */
export const descriptionsVerticalWrapperClasses = 'space-y-0'

/**
 * Vertical layout item classes
 */
export const descriptionsVerticalItemClasses = 'border-b border-gray-200 last:border-b-0'

/**
 * Vertical layout label classes
 */
export const descriptionsVerticalLabelClasses = 'font-medium text-gray-700 mb-1'

/**
 * Vertical layout content classes
 */
export const descriptionsVerticalContentClasses = 'text-gray-900'

/**
 * Get descriptions container classes
 * @param bordered - Whether to show border
 * @param size - Descriptions size
 * @returns Combined class string
 */
export function getDescriptionsClasses(bordered: boolean, size: DescriptionsSize): string {
  const classes = [descriptionsBaseClasses, descriptionsSizeClasses[size]]
  return classes.join(' ')
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
export function groupItemsIntoRows<T extends { span?: number }>(
  items: T[],
  column: number
): T[][] {
  const rows: T[][] = []
  let currentRow: T[] = []
  let currentRowSpan = 0

  for (const item of items) {
    const itemSpan = item.span || 1
    
    // If adding this item would exceed column count, start a new row
    if (currentRowSpan + itemSpan > column && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = []
      currentRowSpan = 0
    }

    currentRow.push(item)
    currentRowSpan += itemSpan

    // If current row is exactly filled, start a new row
    if (currentRowSpan === column) {
      rows.push(currentRow)
      currentRow = []
      currentRowSpan = 0
    }
  }

  // Add any remaining items
  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}
