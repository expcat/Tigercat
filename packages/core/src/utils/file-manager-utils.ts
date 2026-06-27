/**
 * FileManager utility functions
 *
 * Pure functions for file operations, sorting, filtering, styling,
 * shared model derivation, and drag integration.
 */

import type { FileItem, FileSortField, FileSortOrder, FileViewMode } from '../types/file-manager'
import type { DragItem, DragDropEvent } from '../types/drag'
import { formatBytes, getFileExtensionName } from './file-utils'

// ─── Tailwind class constants ─────────────────────────────────────

export const fileManagerContainerClasses =
  'tiger-file-manager relative flex flex-col border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-bg,#ffffff)] overflow-hidden'

export const fileManagerToolbarClasses =
  'flex items-center gap-2 px-3 py-2 border-b border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-bg-secondary,#f9fafb)]'

export const fileManagerBreadcrumbClasses =
  'flex items-center gap-1 text-sm text-[var(--tiger-text-secondary,#6b7280)]'

export const fileManagerBreadcrumbItemClasses =
  'cursor-pointer hover:text-[var(--tiger-primary,#2563eb)] transition-colors'

export const fileManagerBreadcrumbSeparatorClasses = 'text-[var(--tiger-text-muted,#9ca3af)]'

export const fileManagerContentClasses = 'flex-1 overflow-auto p-2'

export const fileManagerListItemClasses =
  'flex items-center gap-3 px-3 py-2 rounded-[var(--tiger-radius-md,0.5rem)] cursor-pointer transition-colors hover:bg-[var(--tiger-bg-hover,#f3f4f6)]'

export const fileManagerListItemSelectedClasses =
  'bg-[var(--tiger-primary,#2563eb)]/10 hover:bg-[var(--tiger-primary,#2563eb)]/15'

export const fileManagerGridItemClasses =
  'flex flex-col items-center gap-2 p-3 rounded-[var(--tiger-radius-md,0.5rem)] cursor-pointer transition-colors hover:bg-[var(--tiger-bg-hover,#f3f4f6)] text-center'

export const fileManagerGridItemSelectedClasses =
  'bg-[var(--tiger-primary,#2563eb)]/10 hover:bg-[var(--tiger-primary,#2563eb)]/15'

export const fileManagerItemIconClasses = 'text-[var(--tiger-text-muted,#9ca3af)] flex-shrink-0'

export const fileManagerItemNameClasses =
  'text-sm font-medium text-[var(--tiger-text,#1f2937)] truncate'

export const fileManagerItemMetaClasses = 'text-xs text-[var(--tiger-text-muted,#9ca3af)]'

export const fileManagerEmptyClasses =
  'flex items-center justify-center py-12 text-sm text-[var(--tiger-text-muted,#9ca3af)]'

export const fileManagerLoadingClasses =
  'absolute inset-0 flex items-center justify-center bg-[var(--tiger-bg,#ffffff)]/60 z-10'

export const fileManagerSearchClasses =
  'px-3 py-1.5 text-sm border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-bg,#ffffff)] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)]/30'

// ─── File operations ──────────────────────────────────────────────

/**
 * Sort file items. Folders are always placed before files.
 */
export function sortFileItems(
  items: FileItem[],
  field: FileSortField = 'name',
  order: FileSortOrder = 'asc'
): FileItem[] {
  const sorted = [...items].sort((a, b) => {
    // Folders first
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
        cmp = (a.modified ?? '').localeCompare(b.modified ?? '')
        break
    }

    return order === 'desc' ? -cmp : cmp
  })

  return sorted
}

/**
 * Filter file items by search text (name matching).
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
 * Uses the same format as upload-utils but handles undefined.
 */
export function formatFileSizeLabel(bytes?: number): string {
  return formatBytes(bytes, { precision: 1, trimTrailingZeros: true })
}

/**
 * Get file extension from name.
 */
export function getFileExtension(name: string): string {
  return getFileExtensionName(name)
}

/**
 * Navigate into a folder: return the children of the target folder.
 */
export function navigateToFolder(files: FileItem[], path: string[]): FileItem[] {
  let current = files
  for (const segment of path) {
    const folder = current.find((f) => f.type === 'folder' && f.name === segment)
    if (!folder || !folder.children) return []
    current = folder.children
  }
  return current
}

// ─── Class generators ─────────────────────────────────────────────

export function getFileManagerContainerClasses(className?: string): string {
  return className ? `${fileManagerContainerClasses} ${className}` : fileManagerContainerClasses
}

export function getFileItemClasses(viewMode: FileViewMode, selected: boolean): string {
  if (viewMode === 'grid') {
    return selected
      ? `${fileManagerGridItemClasses} ${fileManagerGridItemSelectedClasses}`
      : fileManagerGridItemClasses
  }
  return selected
    ? `${fileManagerListItemClasses} ${fileManagerListItemSelectedClasses}`
    : fileManagerListItemClasses
}

// ─── Shared model ─────────────────────────────────────────────────

export interface FileManagerModelInput {
  files: FileItem[]
  currentPath: string[]
  selectedKeys: (string | number)[]
  sortField: FileSortField
  sortOrder: FileSortOrder
  showHidden: boolean
  searchText: string
}

export interface FileManagerModelDerived {
  /** Items at the current directory level */
  currentItems: FileItem[]
  /** Items after filter + sort, ready for rendering */
  processedItems: FileItem[]
  /** Fast lookup set for selected keys */
  selectedSet: Set<string | number>
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
  const processedItems = sortFileItems(items, input.sortField, input.sortOrder)
  const selectedSet = new Set(input.selectedKeys)
  return { currentItems, processedItems, selectedSet }
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
 * Returns `null` if the item is disabled.
 */
export function resolveFileOpen(item: FileItem, currentPath: string[]): FileOpenResult | null {
  if (item.disabled) return null
  if (item.type === 'folder') {
    return { type: 'navigate', path: [...currentPath, item.name] }
  }
  return { type: 'open', item }
}

/**
 * Compute breadcrumb path after clicking an ancestor segment.
 */
export function sliceBreadcrumbPath(currentPath: string[], index: number): string[] {
  return currentPath.slice(0, index)
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

/**
 * Apply a drag-drop reorder to a flat list of file items.
 * Returns the new array with the moved item in its new position.
 */
export function applyFileDragReorder(items: FileItem[], event: DragDropEvent): FileItem[] {
  const { fromIndex, toIndex } = event
  if (fromIndex === toIndex) return items
  const result = [...items]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result
}
