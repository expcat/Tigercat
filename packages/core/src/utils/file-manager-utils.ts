/**
 * FileManager utility functions
 *
 * Pure functions for file operations, sorting, filtering, styling,
 * shared model derivation, and drag integration.
 */

import type {
  FileColumn,
  FileItem,
  FileSortField,
  FileSortOrder,
  FileViewMode
} from '../types/file-manager'
import type { DragItem } from '../types/drag'
import { classNames } from './class-names'
import { reorderSequence } from './drag'
import { formatBytes, getFileExtensionName } from './file-utils'
import { calculateVirtualRange, dynamicSizeStrategy } from './virtual-list-utils'
import type { VirtualListSizeStrategy } from '../types/virtual-list'

export const EMPTY_FILE_ITEMS: FileItem[] = []
export const EMPTY_FILE_PATH: string[] = []
export const DEFAULT_FILE_GRID_COLUMNS = 4

// ─── Tailwind class constants ─────────────────────────────────────

/** Container fill: optional `--tiger-file-manager-bg`, then registered `--tiger-surface`. */
export const fileManagerContainerClasses =
  'tiger-file-manager relative flex h-full min-h-0 flex-col border border-[var(--tiger-border)] rounded-[var(--tiger-radius-md)] bg-[var(--tiger-file-manager-bg)] overflow-hidden'

export const FILE_MANAGER_DEFAULT_HEIGHT = '20rem'
export const FILE_MANAGER_LIST_ROW_HEIGHT = 40
export const FILE_MANAGER_VIRTUAL_MIN_COUNT = 48
export const FILE_BREADCRUMB_SEPARATOR = '›'

/** Toolbar fill: optional `--tiger-file-manager-toolbar-bg`, then registered `--tiger-surface-muted`. */
export const fileManagerToolbarClasses =
  'flex items-center gap-2 px-3 py-2 border-b border-[var(--tiger-border)] bg-[var(--tiger-file-manager-toolbar-bg)]'

export const fileManagerBreadcrumbClasses =
  'flex items-center gap-1 text-sm text-[var(--tiger-text-secondary)]'

export const fileManagerBreadcrumbListClasses = 'm-0 flex list-none items-center gap-1 p-0'

export const fileManagerBreadcrumbItemClasses =
  'rounded-[var(--tiger-radius-sm)] bg-transparent p-0 text-sm text-[var(--tiger-text-secondary)] transition-colors hover:text-[var(--tiger-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]'

export const fileManagerBreadcrumbCurrentClasses = 'text-sm text-[var(--tiger-text)]'

export const fileManagerBreadcrumbSeparatorClasses = 'text-[var(--tiger-text-secondary)]'

export const fileManagerContentClasses = 'min-h-0 flex-1 overflow-auto p-2'

export const fileManagerGridContentClasses = `${fileManagerContentClasses} grid gap-2`

const fileItemFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]'

export const fileManagerListItemClasses = `flex items-center gap-3 px-3 py-2 rounded-[var(--tiger-radius-md)] cursor-pointer transition-colors hover:bg-[var(--tiger-surface-muted)] ${fileItemFocusRing}`

export const fileManagerListItemSelectedClasses =
  'bg-[var(--tiger-primary)]/10 hover:bg-[var(--tiger-primary)]/15'

export const fileManagerGridItemClasses = `flex flex-col items-center gap-2 p-3 rounded-[var(--tiger-radius-md)] cursor-pointer transition-colors hover:bg-[var(--tiger-surface-muted)] text-center ${fileItemFocusRing}`

export const fileManagerGridItemSelectedClasses =
  'bg-[var(--tiger-primary)]/10 hover:bg-[var(--tiger-primary)]/15'

export const fileManagerItemDisabledClasses = 'cursor-default opacity-60 hover:bg-transparent'

export const fileManagerItemIconClasses = 'text-[var(--tiger-text-secondary)] flex-shrink-0'

export const fileManagerItemNameClasses = 'text-sm font-medium text-[var(--tiger-text)] truncate'

export const fileManagerItemMetaClasses = 'text-xs text-[var(--tiger-text-secondary)]'

export const fileManagerEmptyClasses =
  'flex items-center justify-center py-12 text-sm text-[var(--tiger-text-secondary)]'

/** Loading overlay: same surface chain as the container, at 60% opacity. */
export const fileManagerLoadingClasses =
  'absolute inset-0 flex items-center justify-center bg-[var(--tiger-file-manager-bg)]/60 z-10'

/** Search field fill: same surface chain as the container. */
export const fileManagerSearchClasses = `px-3 py-1.5 text-sm border border-[var(--tiger-border)] rounded-[var(--tiger-radius-md)] bg-[var(--tiger-file-manager-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-focus-ring)]`

// ─── File operations ──────────────────────────────────────────────

/** Strict key compare. A numeric key is not the same entry as its decimal string. */
export function fileKeyEquals(item: FileItem, segment: string | number): boolean {
  return item.key === segment
}

const BIDI_AND_BREAKS = /[\u0000-\u001F\u007F\u200E\u200F\u202A-\u202E\u2066-\u2069\u2028\u2029]/g

/** Strip bidi controls and line breaks so a name cannot disguise the path. */
export function sanitizeFileDisplayName(name: string): string {
  return name
    .replace(BIDI_AND_BREAKS, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function compareModified(a: string | undefined, b: string | undefined): number {
  const aTime = Date.parse(a ?? '')
  const bTime = Date.parse(b ?? '')
  if (Number.isFinite(aTime) && Number.isFinite(bTime)) return aTime - bTime
  return (a ?? '').localeCompare(b ?? '')
}

/**
 * Sort file items. Folders are always placed before files.
 * `'none'` returns a shallow copy in the original order (folders still first).
 */
export function sortFileItems(
  items: FileItem[],
  field: FileSortField = 'name',
  order: FileSortOrder = 'asc'
): FileItem[] {
  if (field === 'none') {
    return [...items].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return 0
    })
  }

  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }

    let cmp = 0
    switch (field) {
      case 'name':
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        break
      case 'size':
        cmp = (a.size ?? 0) - (b.size ?? 0)
        break
      case 'type':
        cmp = (a.extension ?? '').localeCompare(b.extension ?? '')
        break
      case 'modified':
        cmp = compareModified(a.modified, b.modified)
        break
    }

    return order === 'desc' ? -cmp : cmp
  })

  return sorted
}

/**
 * Filter file items by search text (name matching in the current folder).
 */
export function filterFileItems(items: FileItem[], searchText: string): FileItem[] {
  if (!searchText.trim()) return items
  const lower = searchText.toLowerCase()
  return items.filter((item) => item.name.toLowerCase().includes(lower))
}

/**
 * Filter hidden files (those starting with '.').
 */
export function filterHiddenFiles(items: FileItem[], showHidden: boolean): FileItem[] {
  if (showHidden) return items
  return items.filter((item) => !item.name.startsWith('.'))
}

/**
 * Format file size to human readable string.
 * Non-finite values (NaN / Infinity) render as empty, not `0 B`.
 */
export function formatFileSizeLabel(bytes?: number): string {
  if (bytes === undefined || bytes === null || !Number.isFinite(bytes)) return ''
  return formatBytes(bytes, { precision: 1, trimTrailingZeros: true })
}

/**
 * Get file extension from name.
 */
export function getFileExtension(name: string): string {
  return getFileExtensionName(name)
}

/**
 * Walk `path` (folder **keys**) and return that folder's children.
 */
export function navigateToFolder(
  files: FileItem[],
  path: readonly (string | number)[]
): FileItem[] {
  let current = files
  for (const segment of path) {
    const folder = current.find((item) => item.type === 'folder' && fileKeyEquals(item, segment))
    if (!folder || !folder.children) return []
    current = folder.children
  }
  return current
}

export interface FileBreadcrumbSegment {
  key: string | number
  name: string
  path: (string | number)[]
  current: boolean
}

export function getFilePathSegmentName(
  files: FileItem[],
  path: readonly (string | number)[]
): string {
  if (path.length === 0) return ''
  const parent = navigateToFolder(files, path.slice(0, -1))
  const key = path[path.length - 1]
  const folder = parent.find((item) => item.type === 'folder' && fileKeyEquals(item, key))
  return folder?.name ?? String(key)
}

export function buildFileBreadcrumb(
  files: FileItem[],
  currentPath: readonly (string | number)[],
  rootText: string
): FileBreadcrumbSegment[] {
  const root: FileBreadcrumbSegment = {
    key: '',
    name: rootText,
    path: EMPTY_FILE_PATH,
    current: currentPath.length === 0
  }
  const segments = currentPath.map((_, index) => {
    const path = currentPath.slice(0, index + 1)
    return {
      key: currentPath[index],
      name: sanitizeFileDisplayName(getFilePathSegmentName(files, path)),
      path,
      current: index === currentPath.length - 1
    }
  })
  return [root, ...segments]
}

// ─── Class generators ─────────────────────────────────────────────

export function getFileManagerContainerClasses(className?: string): string {
  return className ? `${fileManagerContainerClasses} ${className}` : fileManagerContainerClasses
}

export function getFileManagerContentClasses(viewMode: FileViewMode): string {
  return viewMode === 'grid' ? fileManagerGridContentClasses : fileManagerContentClasses
}

export function getFileManagerGridStyle(
  viewMode: FileViewMode,
  gridColumns: number
): { gridTemplateColumns: string } | undefined {
  if (viewMode !== 'grid') return undefined
  const columns = Math.max(1, Math.floor(gridColumns) || DEFAULT_FILE_GRID_COLUMNS)
  return { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
}

export function getFileItemClasses(
  viewMode: FileViewMode,
  selected: boolean,
  disabled = false
): string {
  const isGrid = viewMode === 'grid'
  const base = isGrid ? fileManagerGridItemClasses : fileManagerListItemClasses
  const selectedClass = isGrid
    ? fileManagerGridItemSelectedClasses
    : fileManagerListItemSelectedClasses
  return classNames(base, selected && selectedClass, disabled && fileManagerItemDisabledClasses)
}

export function resolveFileItemExtension(item: FileItem): string {
  return item.extension ?? (item.type === 'file' ? getFileExtension(item.name) : '')
}

export function resolveFileItemIcon(item: FileItem): string {
  if (typeof item.icon === 'string' && item.icon.length > 0) return item.icon
  return item.type === 'folder' ? '📁' : '📄'
}

export const DEFAULT_FILE_COLUMNS: FileColumn[] = ['size', 'modified']

// ─── Shared model ─────────────────────────────────────────────────

export interface FileManagerModelInput {
  files: FileItem[]
  currentPath: readonly (string | number)[]
  selectedKeys: (string | number)[]
  sortField: FileSortField
  sortOrder: FileSortOrder
  showHidden: boolean
  searchText: string
  /** Drag stays available while a filter hides rows. Sort still applies. */
  draggable?: boolean
}

export interface FileManagerModelDerived {
  /** Items at the current directory level (unfiltered source) */
  currentItems: FileItem[]
  /** Items after filter + sort, ready for rendering */
  processedItems: FileItem[]
  /** Fast lookup set for selected keys */
  selectedSet: Set<string | number>
  /** Whether pointer reorder is allowed. Filters do not turn this off. */
  canReorder: boolean
}

export function canReorderFileItems(draggable: boolean): boolean {
  return draggable
}

/**
 * Derive the file manager view-model from inputs.
 * Both Vue and React should call this in a computed / useMemo.
 */
export function deriveFileManagerModel(input: FileManagerModelInput): FileManagerModelDerived {
  const currentItems = navigateToFolder(input.files, input.currentPath)
  let items = filterHiddenFiles(currentItems, input.showHidden)
  if (input.searchText) {
    items = filterFileItems(items, input.searchText)
  }
  const processedItems =
    input.sortField === 'none' ? items : sortFileItems(items, input.sortField, input.sortOrder)
  const selectedSet = new Set(input.selectedKeys)
  return {
    currentItems,
    processedItems,
    selectedSet,
    canReorder: canReorderFileItems(Boolean(input.draggable))
  }
}

/**
 * Toggle a file's selection state, respecting single / multi mode.
 * Returns the new selectedKeys array.
 */
/** Click selects. It does not toggle the key off (double-click must not undo it). */
export function selectFileItem(
  selectedKeys: (string | number)[],
  key: string | number,
  multiple: boolean
): (string | number)[] {
  if (!multiple) {
    if (selectedKeys.length === 1 && selectedKeys[0] === key) return selectedKeys
    return [key]
  }
  if (selectedKeys.some((entry) => entry === key)) return selectedKeys
  return [...selectedKeys, key]
}

export function toggleFileSelection(
  selectedKeys: (string | number)[],
  key: string | number,
  multiple: boolean
): (string | number)[] {
  const keys = [...selectedKeys]
  const idx = keys.indexOf(key)
  if (idx >= 0) {
    keys.splice(idx, 1)
  } else {
    if (!multiple) keys.length = 0
    keys.push(key)
  }
  return keys
}

export interface FileOpenResult {
  type: 'navigate' | 'open'
  /** New path (when type === 'navigate') */
  path?: (string | number)[]
  /** The opened file item (when type === 'open') */
  item?: FileItem
}

/**
 * Determine the action when a file item is activated (double-click / Enter).
 * Returns `null` if the item is disabled. Folder navigation appends `item.key`.
 */
export function resolveFileOpen(
  item: FileItem,
  currentPath: readonly (string | number)[]
): FileOpenResult | null {
  if (item.disabled) return null
  if (item.type === 'folder') {
    return { type: 'navigate', path: [...currentPath, item.key] }
  }
  return { type: 'open', item }
}

/**
 * Compute breadcrumb path after clicking an ancestor segment.
 */
export function sliceBreadcrumbPath(
  currentPath: readonly (string | number)[],
  index: number
): (string | number)[] {
  return currentPath.slice(0, index)
}

export function getParentFilePath(
  currentPath: readonly (string | number)[]
): (string | number)[] | null {
  if (currentPath.length === 0) return null
  return currentPath.slice(0, -1)
}

export function getFirstEnabledFileIndex(items: FileItem[]): number {
  return items.findIndex((item) => !item.disabled)
}

export function getLastEnabledFileIndex(items: FileItem[]): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index]?.disabled) return index
  }
  return -1
}

export function clampFileManagerFocusIndex(index: number, items: FileItem[]): number {
  if (index >= 0 && index < items.length && !items[index]?.disabled) return index
  return getFirstEnabledFileIndex(items)
}

export function getFileManagerMoveIndex(
  current: number,
  key: string,
  items: FileItem[],
  viewMode: FileViewMode,
  gridColumns: number,
  isRtl = false
): number | null {
  const count = items.length
  if (count === 0) return null
  const cols = Math.max(1, Math.floor(gridColumns) || DEFAULT_FILE_GRID_COLUMNS)
  let delta = 0
  switch (key) {
    case 'ArrowDown':
      delta = viewMode === 'grid' ? cols : 1
      break
    case 'ArrowUp':
      delta = viewMode === 'grid' ? -cols : -1
      break
    case 'ArrowRight':
      delta = isRtl ? -1 : 1
      break
    case 'ArrowLeft':
      delta = isRtl ? 1 : -1
      break
    default:
      return null
  }

  let next = current
  for (let step = 0; step < count; step += 1) {
    next = (((next + delta) % count) + count) % count
    if (!items[next]?.disabled) return next
  }
  return current
}

export type FileManagerItemKeyAction =
  | { type: 'move'; index: number }
  | { type: 'home'; index: number }
  | { type: 'end'; index: number }
  | { type: 'select' }
  | { type: 'open' }
  | { type: 'up'; path: (string | number)[] }
  | null

export function resolveFileManagerItemKeydown(input: {
  key: string
  altKey?: boolean
  viewMode: FileViewMode
  gridColumns: number
  isRtl?: boolean
  currentIndex: number
  items: FileItem[]
  currentPath: readonly (string | number)[]
}): FileManagerItemKeyAction {
  const { key, items, currentIndex } = input
  if (key === 'Home') {
    const index = getFirstEnabledFileIndex(items)
    return index >= 0 ? { type: 'home', index } : null
  }
  if (key === 'End') {
    const index = getLastEnabledFileIndex(items)
    return index >= 0 ? { type: 'end', index } : null
  }
  if (key === 'Backspace' || (input.altKey && key === 'ArrowUp')) {
    const path = getParentFilePath(input.currentPath)
    return path ? { type: 'up', path } : null
  }
  if (key === ' ') return { type: 'select' }
  if (key === 'Enter') return { type: 'open' }
  const next = getFileManagerMoveIndex(
    currentIndex,
    key,
    items,
    input.viewMode,
    input.gridColumns,
    input.isRtl
  )
  return next === null ? null : { type: 'move', index: next }
}

/**
 * Immutable reorder of the folder at `path` (source-layer indices).
 */
export function reorderFileTreeAtPath(
  files: FileItem[],
  path: readonly (string | number)[],
  fromIndex: number,
  toIndex: number
): FileItem[] {
  if (path.length === 0) return reorderSequence(files, fromIndex, toIndex)
  const [head, ...rest] = path
  let rewritten = false
  return files.map((item) => {
    if (rewritten || item.type !== 'folder' || !fileKeyEquals(item, head)) return item
    rewritten = true
    return {
      ...item,
      children: reorderFileTreeAtPath(item.children ?? [], rest, fromIndex, toIndex)
    }
  })
}

/**
 * Reorder the folder on `path` only.
 * `fromIndex` / `toIndex` address `visibleLayer` (sorted or filtered).
 * The source index is the matching id in that folder, not the visible slot.
 */
export function applyFileManagerReorder(
  files: FileItem[],
  path: readonly (string | number)[],
  fromIndex: number,
  toIndex: number,
  visibleLayer: FileItem[]
): { files: FileItem[]; layer: FileItem[] } | null {
  const fromItem = visibleLayer[fromIndex]
  const toItem = visibleLayer[toIndex]
  if (!fromItem || !toItem || fromItem.key === toItem.key) return null
  if (fromItem.disabled || toItem.disabled) return null
  const source = navigateToFolder(files, path)
  const sourceFrom = source.findIndex((item) => item.key === fromItem.key)
  const sourceTo = source.findIndex((item) => item.key === toItem.key)
  if (sourceFrom < 0 || sourceTo < 0 || sourceFrom === sourceTo) return null
  const layer = reorderSequence(source, sourceFrom, sourceTo)
  return { files: reorderFileTreeAtPath(files, path, sourceFrom, sourceTo), layer }
}

export interface FileManagerWindow {
  start: number
  end: number
  offsetTop: number
  totalHeight: number
  virtual: boolean
}

/** Fixed-height window for a large current layer. Small layers render in full. */
export function getFileManagerWindow(
  count: number,
  scrollTop: number,
  viewport: number,
  rowHeight = FILE_MANAGER_LIST_ROW_HEIGHT
): FileManagerWindow {
  if (count < FILE_MANAGER_VIRTUAL_MIN_COUNT || rowHeight <= 0) {
    return {
      start: 0,
      end: count,
      offsetTop: 0,
      totalHeight: Math.max(0, count * rowHeight),
      virtual: false
    }
  }
  const range = calculateVirtualRange(scrollTop, viewport > 0 ? viewport : 320, count, rowHeight, 4)
  return { ...range, virtual: true }
}

/** Variable row heights, keyed by item id. Used when the current layer is large. */
export function createFileManagerMeasure(estimatedHeight: number): {
  strategy: VirtualListSizeStrategy
  windowFor(
    keys: readonly (string | number)[],
    scrollTop: number,
    viewport: number
  ): FileManagerWindow
  measure(index: number, height: number, key: string | number): void
} {
  const strategy = dynamicSizeStrategy(estimatedHeight, 0)
  const setItemKeys = strategy.setItemKeys?.bind(strategy)
  const getRange = strategy.getRange.bind(strategy)
  const updateItemHeight = strategy.updateItemHeight?.bind(strategy)
  return {
    strategy,
    windowFor(keys, scrollTop, viewport) {
      if (keys.length < FILE_MANAGER_VIRTUAL_MIN_COUNT) {
        return {
          start: 0,
          end: keys.length,
          offsetTop: 0,
          totalHeight: keys.length * estimatedHeight,
          virtual: false
        }
      }
      setItemKeys?.(keys)
      const range = getRange(scrollTop, viewport > 0 ? viewport : 320, keys.length, 4)
      return {
        start: range.startIndex,
        end: range.endIndex + 1,
        offsetTop: range.offsetTop,
        totalHeight: range.totalHeight,
        virtual: true
      }
    },
    measure(index, height, key) {
      updateItemHeight?.(index, height, key)
    }
  }
}

// ─── Drag integration ─────────────────────────────────────────────

/**
 * Convert a FileItem to the generic DragItem interface used by drag utils.
 */
export function toFileDragItem(item: FileItem, index: number, containerId?: string): DragItem {
  return {
    id: item.key,
    index,
    containerId,
    data: { name: item.name, type: item.type }
  }
}
