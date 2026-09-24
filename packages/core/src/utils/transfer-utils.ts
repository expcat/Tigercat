import type { ComponentSize } from '../types/base'
import type { TransferDirection, TransferItem, TransferSelectedKeys } from '../types/transfer'
import { classNames } from './class-names'
import { resolveButtonClasses } from './button-utils'
import { treeKeyId } from './tree-utils'
import { variableSizeStrategy, type VirtualRange } from './virtual-list-utils'

export const transferBaseClasses = 'flex flex-col sm:flex-row items-stretch gap-4 max-sm:flex-col'

export const transferPanelClasses =
  'flex-1 min-w-0 border border-[var(--tiger-border)] rounded-[var(--tiger-radius-md)] flex flex-col bg-[var(--tiger-surface)]'

export const transferPanelHeaderClasses =
  'flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)]'

/** Fixed usable height. Rows past this box use the shared virtual window. */
export const TRANSFER_PANEL_BODY_HEIGHT = 256

export const transferPanelBodyClasses = 'overflow-auto shrink-0'

export function getTransferPanelBodyStyle(): { height: string } {
  return { height: `${TRANSFER_PANEL_BODY_HEIGHT}px` }
}

export function getTransferRowHeight(size: ComponentSize = 'md', described = false): number {
  const base = size === 'sm' ? 36 : size === 'lg' ? 52 : 44
  return described ? base + 18 : base
}

export function transferListNeedsWindow(
  items: readonly { description?: string }[],
  size: ComponentSize = 'md',
  viewport = TRANSFER_PANEL_BODY_HEIGHT
): boolean {
  let total = 0
  for (const item of items) {
    total += getTransferRowHeight(size, Boolean(item.description))
    if (total > viewport) return true
  }
  return false
}

export function getTransferVirtualWindow(
  items: readonly { description?: string }[],
  scrollTop: number,
  size: ComponentSize = 'md',
  viewport = TRANSFER_PANEL_BODY_HEIGHT,
  overscan = 5
): VirtualRange {
  const strategy = variableSizeStrategy(
    (index) => getTransferRowHeight(size, Boolean(items[index]?.description)),
    items.length
  )
  return strategy.getRange(scrollTop, viewport, items.length, overscan)
}

export const transferEmptyClasses = 'px-3 py-8 text-center text-[var(--tiger-text-secondary)]'

export const transferOperationClasses =
  'flex flex-row sm:flex-col items-center justify-center gap-2 max-sm:flex-row'

export const transferItemDescriptionClasses =
  'block text-xs text-[var(--tiger-text-secondary)] truncate'

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
    'flex items-start gap-2 tiger-motion-aware [transition:var(--tiger-transition-base)]'

  const stateClass = isDisabled
    ? 'text-[var(--tiger-text-secondary)] cursor-not-allowed'
    : isSelected
      ? 'bg-[var(--tiger-outline-bg-hover)] text-[var(--tiger-text)]'
      : 'text-[var(--tiger-text)] hover:bg-[var(--tiger-outline-bg-hover)] cursor-pointer'

  return classNames(base, sizeClasses[size], itemPaddingClasses[size], stateClass)
}

export function getTransferButtonClasses(disabled: boolean): string {
  return resolveButtonClasses({ variant: 'outline', size: 'sm', disabled })
}

export function transferKeyId(key: string | number): string {
  return treeKeyId(key)
}

/** Collapse `1` and `'1'` to one row. First occurrence wins. */
export function dedupeTransferItems(dataSource: readonly TransferItem[]): TransferItem[] {
  const seen = new Set<string>()
  const result: TransferItem[] = []
  for (const item of dataSource) {
    const id = treeKeyId(item.key)
    if (seen.has(id)) continue
    seen.add(id)
    result.push(item)
  }
  return result
}

export function dedupeTransferKeys(keys: readonly (string | number)[]): (string | number)[] {
  const seen = new Set<string>()
  const result: (string | number)[] = []
  for (const key of keys) {
    const id = treeKeyId(key)
    if (seen.has(id)) continue
    seen.add(id)
    result.push(key)
  }
  return result
}

export function sameTransferKeys(
  left: readonly (string | number)[],
  right: readonly (string | number)[]
): boolean {
  if (left.length !== right.length) return false
  return left.every((key, index) => treeKeyId(key) === treeKeyId(right[index]!))
}

/** Selected keys split into the current filtered rows and the ones search hid. */
export function partitionTransferSelection(
  selectedKeys: readonly (string | number)[],
  visibleItems: readonly TransferItem[]
): { visible: (string | number)[]; hidden: (string | number)[] } {
  const visibleIds = new Set(visibleItems.map((item) => treeKeyId(item.key)))
  const visible: (string | number)[] = []
  const hidden: (string | number)[] = []
  const seen = new Set<string>()
  for (const key of selectedKeys) {
    const id = treeKeyId(key)
    if (seen.has(id)) continue
    seen.add(id)
    if (visibleIds.has(id)) visible.push(key)
    else hidden.push(key)
  }
  return { visible, hidden }
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
  const uniqueSource = dedupeTransferItems(dataSource)
  const byId = new Map<string, TransferItem>()
  for (const item of uniqueSource) {
    byId.set(transferKeyId(item.key), item)
  }

  const targetIdSet = new Set(targetKeys.map(transferKeyId))
  const sourceItems = uniqueSource.filter((item) => !targetIdSet.has(transferKeyId(item.key)))
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

export function resolveTransferValue(
  value?: (string | number)[] | null
): (string | number)[] | undefined {
  if (value == null) return undefined
  return dedupeTransferKeys(value)
}
