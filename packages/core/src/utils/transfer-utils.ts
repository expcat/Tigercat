import type { TransferItem, TransferSize } from '../types/transfer'
import { classNames } from './class-names'

// ============================================================================
// STYLE CLASSES
// ============================================================================

export const transferBaseClasses = 'flex items-stretch gap-4'

export const transferPanelClasses =
  'flex-1 min-w-0 border border-[var(--tiger-transfer-border,var(--tiger-border,#d1d5db))] rounded-lg overflow-hidden flex flex-col bg-[var(--tiger-transfer-bg,var(--tiger-surface,#ffffff))]'

export const transferPanelHeaderClasses =
  'flex items-center justify-between px-3 py-2 border-b border-[var(--tiger-transfer-border,var(--tiger-border,#d1d5db))] bg-[var(--tiger-transfer-header-bg,var(--tiger-surface-muted,#f9fafb))]'

export const transferPanelBodyClasses = 'flex-1 overflow-auto min-h-[200px]'

export const transferSearchClasses =
  'w-full px-3 py-1.5 border-b border-[var(--tiger-transfer-border,var(--tiger-border,#d1d5db))] text-sm bg-[var(--tiger-transfer-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-transfer-text,var(--tiger-text,#111827))] outline-none placeholder:text-[var(--tiger-transfer-placeholder,var(--tiger-text-muted,#9ca3af))]'

export const transferEmptyClasses =
  'px-3 py-8 text-center text-[var(--tiger-transfer-empty-text,var(--tiger-text-muted,#9ca3af))]'

export const transferOperationClasses = 'flex flex-col items-center justify-center gap-2'

// ============================================================================
// SIZE HELPERS
// ============================================================================

const sizeClasses: Record<TransferSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

const itemPaddingClasses: Record<TransferSize, string> = {
  sm: 'px-2 py-1',
  md: 'px-3 py-2',
  lg: 'px-4 py-2.5'
}

const checkboxSizeClasses: Record<TransferSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

// ============================================================================
// STYLE FUNCTIONS
// ============================================================================

export function getTransferItemClasses(
  isSelected: boolean,
  isDisabled: boolean,
  size: TransferSize = 'md'
): string {
  const base = 'flex items-center gap-2 cursor-pointer transition-colors'

  const stateClass = isDisabled
    ? 'text-[var(--tiger-transfer-text-disabled,var(--tiger-text-muted,#9ca3af))] cursor-not-allowed'
    : isSelected
      ? 'bg-[var(--tiger-transfer-item-bg-selected,var(--tiger-outline-bg-active,#dbeafe))] text-[var(--tiger-transfer-item-text,var(--tiger-text,#111827))]'
      : 'text-[var(--tiger-transfer-item-text,var(--tiger-text,#111827))] hover:bg-[var(--tiger-transfer-item-bg-hover,var(--tiger-outline-bg-hover,#eff6ff))]'

  return classNames(base, sizeClasses[size], itemPaddingClasses[size], stateClass)
}

export function getTransferCheckboxClasses(size: TransferSize = 'md'): string {
  return classNames(
    checkboxSizeClasses[size],
    'rounded border border-[var(--tiger-transfer-checkbox-border,var(--tiger-border,#d1d5db))] accent-[var(--tiger-primary,#2563eb)]'
  )
}

export function getTransferButtonClasses(disabled: boolean): string {
  const base = 'px-2 py-1.5 rounded border transition-colors flex items-center justify-center'

  return disabled
    ? classNames(
        base,
        'border-[var(--tiger-transfer-btn-border-disabled,var(--tiger-border,#d1d5db))] bg-[var(--tiger-transfer-btn-bg-disabled,var(--tiger-surface-muted,#f9fafb))] text-[var(--tiger-transfer-btn-text-disabled,var(--tiger-text-muted,#9ca3af))] cursor-not-allowed'
      )
    : classNames(
        base,
        'border-[var(--tiger-transfer-btn-border,var(--tiger-primary,#2563eb))] bg-[var(--tiger-transfer-btn-bg,var(--tiger-primary,#2563eb))] text-[var(--tiger-transfer-btn-text,#ffffff)] hover:bg-[var(--tiger-transfer-btn-bg-hover,var(--tiger-primary-hover,#1d4ed8))] cursor-pointer'
      )
}

// ============================================================================
// LOGIC FUNCTIONS
// ============================================================================

/**
 * Default filter for transfer items
 */
export function defaultTransferFilter(inputValue: string, item: TransferItem): boolean {
  return item.label.toLowerCase().includes(inputValue.toLowerCase())
}

/**
 * Split data source into source and target lists
 */
export function splitTransferData(
  dataSource: TransferItem[],
  targetKeys: (string | number)[]
): { sourceItems: TransferItem[]; targetItems: TransferItem[] } {
  const targetKeySet = new Set(targetKeys)
  const sourceItems: TransferItem[] = []
  const targetItems: TransferItem[] = []

  for (const item of dataSource) {
    if (targetKeySet.has(item.key)) {
      targetItems.push(item)
    } else {
      sourceItems.push(item)
    }
  }

  return { sourceItems, targetItems }
}

/**
 * Filter items by search query
 */
export function filterTransferItems(
  items: TransferItem[],
  query: string,
  filterFn?: (inputValue: string, item: TransferItem) => boolean
): TransferItem[] {
  if (!query) return items
  const fn = filterFn ?? defaultTransferFilter
  return items.filter((item) => fn(query, item))
}
