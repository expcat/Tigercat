import type { ComponentSize } from '../types/base'
import type { TransferDirection, TransferItem, TransferSelectedKeys } from '../types/transfer'
import { classNames } from './class-names'
import { resolveButtonClasses } from './button-utils'

export const transferBaseClasses = 'flex flex-col sm:flex-row items-stretch gap-4 max-sm:flex-col'

export const transferPanelClasses =
  'flex-1 min-w-0 border border-[var(--tiger-border,#d1d5db)] rounded-[var(--tiger-radius-md,0.5rem)] flex flex-col bg-[var(--tiger-surface,#ffffff)]'

export const transferPanelHeaderClasses =
  'flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-surface-muted,#f9fafb)]'

export const transferPanelBodyClasses = 'flex-1 overflow-auto min-h-[200px]'

export const transferEmptyClasses = 'px-3 py-8 text-center text-[var(--tiger-text-muted,#9ca3af)]'

export const transferOperationClasses =
  'flex flex-row sm:flex-col items-center justify-center gap-2 max-sm:flex-row'

export const transferItemDescriptionClasses =
  'block text-xs text-[var(--tiger-text-muted,#6b7280)] truncate'

export const transferMoveToTargetIconClasses = 'rtl:rotate-180 max-sm:rotate-90'
export const transferMoveToSourceIconClasses = 'rtl:rotate-180 max-sm:rotate-90'

const sizeClasses: Record<ComponentSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

const itemPaddingClasses: Record<ComponentSize, string> = {
  sm: 'px-2 py-1',
  md: 'px-3 py-2',
  lg: 'px-4 py-2.5'
}

export function getTransferItemClasses(
  isSelected: boolean,
  isDisabled: boolean,
  size: ComponentSize = 'md'
): string {
  const base =
    'flex items-start gap-2 tiger-motion-aware [transition:var(--tiger-transition-base,background-color_150ms_ease)]'

  const stateClass = isDisabled
    ? 'text-[var(--tiger-text-muted,#9ca3af)] cursor-not-allowed'
    : isSelected
      ? 'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-text,#111827)]'
      : 'text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)] cursor-pointer'

  return classNames(base, sizeClasses[size], itemPaddingClasses[size], stateClass)
}

export function getTransferButtonClasses(disabled: boolean): string {
  return resolveButtonClasses({ variant: 'outline', size: 'sm', disabled })
}

/** @deprecated Transfer rows reuse Checkbox visuals. */
export function getTransferCheckboxClasses(size: ComponentSize = 'md'): string {
  return classNames(
    size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
    'rounded border border-[var(--tiger-border,#d1d5db)] accent-[var(--tiger-primary,#2563eb)]'
  )
}

export function transferKeyId(key: string | number): string {
  return String(key)
}

export function findTransferItem(
  dataSource: TransferItem[],
  key: string | number
): TransferItem | undefined {
  const id = transferKeyId(key)
  return dataSource.find((item) => transferKeyId(item.key) === id)
}

export function hasTransferKey(keys: Iterable<string | number>, key: string | number): boolean {
  const id = transferKeyId(key)
  for (const item of keys) {
    if (transferKeyId(item) === id) return true
  }
  return false
}

export function toggleTransferKey(
  selected: Iterable<string | number>,
  key: string | number
): (string | number)[] {
  const id = transferKeyId(key)
  const next: (string | number)[] = []
  let found = false
  for (const item of selected) {
    if (transferKeyId(item) === id) {
      found = true
      continue
    }
    next.push(item)
  }
  if (!found) next.push(key)
  return next
}

export function defaultTransferFilter(inputValue: string, item: TransferItem): boolean {
  const query = inputValue.toLowerCase()
  if (item.label.toLowerCase().includes(query)) return true
  return Boolean(item.description?.toLowerCase().includes(query))
}

export function splitTransferData(
  dataSource: TransferItem[],
  targetKeys: (string | number)[]
): { sourceItems: TransferItem[]; targetItems: TransferItem[] } {
  const byId = new Map<string, TransferItem>()
  for (const item of dataSource) {
    const id = transferKeyId(item.key)
    if (!byId.has(id)) byId.set(id, item)
  }

  const targetIdSet = new Set(targetKeys.map(transferKeyId))
  const sourceItems = dataSource.filter((item) => !targetIdSet.has(transferKeyId(item.key)))
  const targetItems: TransferItem[] = []
  const seen = new Set<string>()
  for (const key of targetKeys) {
    const id = transferKeyId(key)
    if (seen.has(id)) continue
    seen.add(id)
    const item = byId.get(id)
    if (item) targetItems.push(item)
  }
  return { sourceItems, targetItems }
}

export interface TransferMoveResult {
  targetKeys: (string | number)[]
  movedKeys: (string | number)[]
}

export function moveTransferItems(
  direction: TransferDirection,
  targetKeys: (string | number)[],
  selectedKeys: Iterable<string | number>,
  dataSource: TransferItem[]
): TransferMoveResult {
  const byId = new Map<string, TransferItem>()
  for (const item of dataSource) {
    const id = transferKeyId(item.key)
    if (!byId.has(id)) byId.set(id, item)
  }

  const movedKeys: (string | number)[] = []
  const seen = new Set<string>()
  for (const key of selectedKeys) {
    const id = transferKeyId(key)
    if (seen.has(id)) continue
    seen.add(id)
    const item = byId.get(id)
    if (!item || item.disabled) continue
    movedKeys.push(item.key)
  }

  if (direction === 'right') {
    const existing = new Set(targetKeys.map(transferKeyId))
    const appended = movedKeys.filter((key) => !existing.has(transferKeyId(key)))
    return { targetKeys: [...targetKeys, ...appended], movedKeys }
  }

  const movedSet = new Set(movedKeys.map(transferKeyId))
  return {
    targetKeys: targetKeys.filter((key) => !movedSet.has(transferKeyId(key))),
    movedKeys
  }
}

export function filterTransferItems(
  items: TransferItem[],
  query: string,
  filterFn?: (inputValue: string, item: TransferItem) => boolean
): TransferItem[] {
  if (!query) return items
  const fn = filterFn ?? defaultTransferFilter
  return items.filter((item) => fn(query, item))
}

export function canMoveTransferItems(
  selectedKeys: Iterable<string | number>,
  dataSource: TransferItem[],
  disabled: boolean
): boolean {
  if (disabled) return false
  for (const key of selectedKeys) {
    const item = findTransferItem(dataSource, key)
    if (item && !item.disabled) return true
  }
  return false
}

export interface TransferSelectAllState {
  checked: boolean
  indeterminate: boolean
  enabledKeys: (string | number)[]
}

export function getTransferSelectAllState(
  visibleItems: TransferItem[],
  selectedKeys: Iterable<string | number>
): TransferSelectAllState {
  const enabledKeys = visibleItems.filter((item) => !item.disabled).map((item) => item.key)
  if (enabledKeys.length === 0) {
    return { checked: false, indeterminate: false, enabledKeys }
  }
  let selectedCount = 0
  for (const key of enabledKeys) {
    if (hasTransferKey(selectedKeys, key)) selectedCount += 1
  }
  return {
    checked: selectedCount === enabledKeys.length,
    indeterminate: selectedCount > 0 && selectedCount < enabledKeys.length,
    enabledKeys
  }
}

export function applyTransferSelectAll(
  selectedKeys: Iterable<string | number>,
  enabledKeys: (string | number)[],
  checked: boolean
): (string | number)[] {
  const enabledIds = new Set(enabledKeys.map(transferKeyId))
  const next: (string | number)[] = []
  for (const key of selectedKeys) {
    if (!enabledIds.has(transferKeyId(key))) next.push(key)
  }
  if (checked) next.push(...enabledKeys)
  return next
}

export function emptyTransferSelectedKeys(): TransferSelectedKeys {
  return { source: [], target: [] }
}

export function resolveTransferTargetKeys(
  value?: (string | number)[],
  targetKeys?: (string | number)[]
): { keys: (string | number)[] | undefined; conflict: boolean } {
  if (value !== undefined && targetKeys !== undefined) {
    const same =
      value.length === targetKeys.length &&
      value.every((key, index) => transferKeyId(key) === transferKeyId(targetKeys[index]!))
    return { keys: value, conflict: !same }
  }
  if (value !== undefined) return { keys: value, conflict: false }
  if (targetKeys !== undefined) return { keys: targetKeys, conflict: false }
  return { keys: undefined, conflict: false }
}
