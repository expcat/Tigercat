/**
 * Table row grouping utilities
 */

/**
 * Group data by a column key
 */
export function groupDataByColumn<T>(data: T[], groupBy: string): Map<string, T[]> {
  const groups = new Map<string, T[]>()

  for (const record of data) {
    const key = String((record as Record<string, unknown>)[groupBy] ?? '')
    const existing = groups.get(key)
    if (existing) {
      existing.push(record)
    } else {
      groups.set(key, [record])
    }
  }

  return groups
}

/**
 * Get group header row classes
 */
export const tableGroupHeaderClasses =
  'bg-[var(--tiger-surface-muted,#f3f4f6)] font-semibold text-sm text-[var(--tiger-text,#111827)] border-b border-[var(--tiger-border,#e5e7eb)]'

/**
 * Get group header cell padding classes
 */
export function getGroupHeaderCellClasses(size: 'sm' | 'md' | 'lg'): string {
  const padding: Record<string, string> = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  }
  return padding[size] || padding.md
}
