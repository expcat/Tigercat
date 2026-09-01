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

export const EMPTY_FILE_ITEMS: FileItem[] = []
export const EMPTY_FILE_PATH: string[] = []
export const DEFAULT_FILE_GRID_COLUMNS = 4

// ─── Tailwind class constants ─────────────────────────────────────

/** Container fill: optional `--tiger-file-manager-bg`, then registered `--tiger-surface`. */
export const fileManagerContainerClasses =
  'tiger-file-manager relative flex h-full min-h-0 flex-col border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-file-manager-bg,var(--tiger-surface,#ffffff))] overflow-hidden'

/** Toolbar fill: optional `--tiger-file-manager-toolbar-bg`, then registered `--tiger-surface-muted`. */
export const fileManagerToolbarClasses =
  'flex items-center gap-2 px-3 py-2 border-b border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-file-manager-toolbar-bg,var(--tiger-surface-muted,#f9fafb))]'

export const fileManagerBreadcrumbClasses =
  'flex items-center gap-1 text-sm text-[var(--tiger-text-secondary,#6b7280)]'

export const fileManagerBreadcrumbListClasses = 'm-0 flex list-none items-center gap-1 p-0'

export const fileManagerBreadcrumbItemClasses =
  'rounded-[var(--tiger-radius-sm,0.25rem)] bg-transparent p-0 text-sm text-[var(--tiger-text-secondary,#6b7280)] transition-colors hover:text-[var(--tiger-primary,#2563eb)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

export const fileManagerBreadcrumbCurrentClasses = 'text-sm text-[var(--tiger-text,#1f2937)]'

export const fileManagerBreadcrumbSeparatorClasses = 'text-[var(--tiger-text-muted,#9ca3af)]'

export const fileManagerContentClasses = 'min-h-0 flex-1 overflow-auto p-2'

export const fileManagerGridContentClasses = `${fileManagerContentClasses} grid gap-2`

const fileItemFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

export const fileManagerListItemClasses = `flex items-center gap-3 px-3 py-2 rounded-[var(--tiger-radius-md,0.5rem)] cursor-pointer transition-colors hover:bg-[var(--tiger-surface-muted,#f3f4f6)] ${fileItemFocusRing}`

export const fileManagerListItemSelectedClasses =
  'bg-[var(--tiger-primary,#2563eb)]/10 hover:bg-[var(--tiger-primary,#2563eb)]/15'

export const fileManagerGridItemClasses = `flex flex-col items-center gap-2 p-3 rounded-[var(--tiger-radius-md,0.5rem)] cursor-pointer transition-colors hover:bg-[var(--tiger-surface-muted,#f3f4f6)] text-center ${fileItemFocusRing}`

export const fileManagerGridItemSelectedClasses =
  'bg-[var(--tiger-primary,#2563eb)]/10 hover:bg-[var(--tiger-primary,#2563eb)]/15'

export const fileManagerItemDisabledClasses = 'cursor-default opacity-60 hover:bg-transparent'

export const fileManagerItemIconClasses = 'text-[var(--tiger-text-muted,#9ca3af)] flex-shrink-0'

export const fileManagerItemNameClasses =
  'text-sm font-medium text-[var(--tiger-text,#1f2937)] truncate'

export const fileManagerItemMetaClasses = 'text-xs text-[var(--tiger-text-muted,#9ca3af)]'

export const fileManagerEmptyClasses =
  'flex items-center justify-center py-12 text-sm text-[var(--tiger-text-muted,#9ca3af)]'

/** Loading overlay: same surface chain as the container, at 60% opacity. */
export const fileManagerLoadingClasses =
  'absolute inset-0 flex items-center justify-center bg-[var(--tiger-file-manager-bg,var(--tiger-surface,#ffffff))]/60 z-10'

/** Search field fill: same surface chain as the container. */
export const fileManagerSearchClasses = `px-3 py-1.5 text-sm border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-file-manager-bg,var(--tiger-surface,#ffffff))] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]`

// ─── File operations ──────────────────────────────────────────────

function fileKeyEquals(item: FileItem, segment: string | number): boolean {
  return String(item.key) === String(segment)
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
export function navigateToFolder(files: FileItem[], path: string[]): FileItem[] {
  let current = files
  for (const segment of path) {
    const folder = current.find((item) => item.type === 'folder' && fileKeyEquals(item, segment))
    if (!folder || !folder.children) return []
    current = folder.children
  }
  return current
}

export interface FileBreadcrumbSegment {
  key: string
  name: string
  path: string[]
  current: boolean
}

export function getFilePathSegmentName(files: FileItem[], path: string[]): string {
  if (path.length === 0) return ''
  const parent = navigateToFolder(files, path.slice(0, -1))
  const key = path[path.length - 1]
  const folder = parent.find((item) => item.type === 'folder' && fileKeyEquals(item, key))
  return folder?.name ?? String(key)
}

export function buildFileBreadcrumb(
  files: FileItem[],
  currentPath: string[],
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
      key: String(currentPath[index]),
      name: getFilePathSegmentName(files, path),
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
  currentPath: string[]
  selectedKeys: (string | number)[]
  sortField: FileSortField
  sortOrder: FileSortOrder
  showHidden: boolean
  searchText: string
  /** When true, skip name/size sort so drop order is kept. */
  draggable?: boolean
}

export interface FileManagerModelDerived {
  /** Items at the current directory level (unfiltered source) */
  currentItems: FileItem[]
  /** Items after filter + sort, ready for rendering */
  processedItems: FileItem[]
  /** Fast lookup set for selected keys */
  selectedSet: Set<string | number>
  /** Whether HTML5 reorder is allowed for this view */
  canReorder: boolean
}

export function canReorderFileItems(
  draggable: boolean,
  searchText: string,
  currentItems: FileItem[],
  processedItems: FileItem[]
): boolean {
  if (!draggable) return false
  if (searchText.trim()) return false
  return processedItems.length === currentItems.length
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
  const skipSort = Boolean(input.draggable) || input.sortField === 'none'
  const processedItems = skipSort ? items : sortFileItems(items, input.sortField, input.sortOrder)
  const selectedSet = new Set(input.selectedKeys)
  return {
    currentItems,
    processedItems,
    selectedSet,
    canReorder: canReorderFileItems(
      Boolean(input.draggable),
      input.searchText,
      currentItems,
      processedItems
    )
  }
}

/**
 * Toggle a file's selection state, respecting single / multi mode.
 * Returns the new selectedKeys array.
 */
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
  path?: string[]
  /** The opened file item (when type === 'open') */
  item?: FileItem
}

/**
 * Determine the action when a file item is activated (double-click / Enter).
 * Returns `null` if the item is disabled. Folder navigation appends `item.key`.
 */
export function resolveFileOpen(item: FileItem, currentPath: string[]): FileOpenResult | null {
  if (item.disabled) return null
  if (item.type === 'folder') {
    return { type: 'navigate', path: [...currentPath, String(item.key)] }
  }
  return { type: 'open', item }
}

/**
 * Compute breadcrumb path after clicking an ancestor segment.
 */
export function sliceBreadcrumbPath(currentPath: string[], index: number): string[] {
  return currentPath.slice(0, index)
}

export function getParentFilePath(currentPath: string[]): string[] | null {
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
  | { type: 'up'; path: string[] }
  | null

export function resolveFileManagerItemKeydown(input: {
  key: string
  altKey?: boolean
  viewMode: FileViewMode
  gridColumns: number
  isRtl?: boolean
  currentIndex: number
  items: FileItem[]
  currentPath: string[]
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
  path: string[],
  fromIndex: number,
  toIndex: number
): FileItem[] {
  if (path.length === 0) return reorderSequence(files, fromIndex, toIndex)
  const [head, ...rest] = path
  return files.map((item) => {
    if (item.type !== 'folder' || !fileKeyEquals(item, head)) return item
    return {
      ...item,
      children: reorderFileTreeAtPath(item.children ?? [], rest, fromIndex, toIndex)
    }
  })
}

export function applyFileManagerReorder(
  files: FileItem[],
  path: string[],
  fromIndex: number,
  toIndex: number,
  currentItems: FileItem[]
): { files: FileItem[]; layer: FileItem[] } | null {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= currentItems.length ||
    toIndex >= currentItems.length ||
    fromIndex === toIndex
  ) {
    return null
  }
  const fromItem = currentItems[fromIndex]
  const toItem = currentItems[toIndex]
  if (!fromItem || fromItem.disabled || toItem?.disabled) return null
  const layer = reorderSequence(currentItems, fromIndex, toIndex)
  return { files: reorderFileTreeAtPath(files, path, fromIndex, toIndex), layer }
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
