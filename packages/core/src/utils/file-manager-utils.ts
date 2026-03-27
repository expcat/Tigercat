/**
 * FileManager utility functions
 *
 * Pure functions for file operations, sorting, filtering, and styling.
 */

import type { FileItem, FileSortField, FileSortOrder, FileViewMode } from '../types/file-manager'

// ─── Tailwind class constants ─────────────────────────────────────

export const fileManagerContainerClasses =
  'tiger-file-manager flex flex-col border border-[var(--tiger-border,#e5e7eb)] rounded-lg bg-[var(--tiger-bg,#ffffff)] overflow-hidden'

export const fileManagerToolbarClasses =
  'flex items-center gap-2 px-3 py-2 border-b border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-bg-secondary,#f9fafb)]'

export const fileManagerBreadcrumbClasses =
  'flex items-center gap-1 text-sm text-[var(--tiger-text-secondary,#6b7280)]'

export const fileManagerBreadcrumbItemClasses =
  'cursor-pointer hover:text-[var(--tiger-primary,#2563eb)] transition-colors'

export const fileManagerBreadcrumbSeparatorClasses = 'text-[var(--tiger-text-muted,#9ca3af)]'

export const fileManagerContentClasses = 'flex-1 overflow-auto p-2'

export const fileManagerListItemClasses =
  'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-[var(--tiger-bg-hover,#f3f4f6)]'

export const fileManagerListItemSelectedClasses =
  'bg-[var(--tiger-primary,#2563eb)]/10 hover:bg-[var(--tiger-primary,#2563eb)]/15'

export const fileManagerGridItemClasses =
  'flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors hover:bg-[var(--tiger-bg-hover,#f3f4f6)] text-center'

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
  'px-3 py-1.5 text-sm border border-[var(--tiger-border,#e5e7eb)] rounded-md bg-[var(--tiger-bg,#ffffff)] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)]/30'

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
  if (bytes === undefined || bytes === null) return ''
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)

  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`
}

/**
 * Get file extension from name.
 */
export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return ''
  return name.slice(dot + 1).toLowerCase()
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
