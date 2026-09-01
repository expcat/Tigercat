/**
 * FileManager types
 *
 * Folders are identified by `key` (not `name`). Breadcrumb labels show `name`;
 * `currentPath` is an array of folder keys.
 *
 * Toolbar chrome does not include view / sort / hidden controls — the parent
 * owns those props. Search matches names in the **current folder only**.
 *
 * The root is `h-full`. Give the component (or its parent) a height so the
 * file list is the internal scroller.
 */

import type { TigerLocale } from './locale'

export type FileType = 'file' | 'folder'

export type FileViewMode = 'list' | 'grid'

/** Sort key. `'none'` keeps `files` order (also used while `draggable`). */
export type FileSortField = 'name' | 'size' | 'type' | 'modified' | 'none'

export type FileSortOrder = 'asc' | 'desc'

/** Extra list-view columns. The name is always shown. */
export type FileColumn = 'size' | 'type' | 'modified'

export interface FileItem {
  key: string | number
  name: string
  type: FileType
  /** File extension (e.g. 'ts', 'png') */
  extension?: string
  /** Size in bytes */
  size?: number
  /**
   * Modification time. ISO-8601 values sort as dates; anything else compares
   * as a string.
   */
  modified?: string
  /** MIME type */
  mimeType?: string
  /** Icon identifier; string values render as the default glyph */
  icon?: unknown
  /** Children for folders */
  children?: FileItem[]
  /** Whether the node is disabled */
  disabled?: boolean
  /** Custom metadata */
  [key: string]: unknown
}

export interface FileManagerProps {
  /** File/folder tree data */
  files?: FileItem[]
  /** View mode */
  viewMode?: FileViewMode
  /** Grid column count when `viewMode="grid"` */
  gridColumns?: number
  /** Currently selected file keys (controlled) */
  selectedKeys?: (string | number)[]
  /**
   * Default selected file keys (uncontrolled).
   * Used when `selectedKeys` is omitted.
   */
  defaultSelectedKeys?: (string | number)[]
  /** Allow multiple selection */
  multiple?: boolean
  /** Extra list-view columns (`size` / `type` / `modified`). Name is always shown. */
  columns?: FileColumn[]
  /**
   * Sort field. Ignored while `draggable` so drop order is kept.
   * `'none'` keeps the current folder's `files` order.
   */
  sortField?: FileSortField
  /** Sort order */
  sortOrder?: FileSortOrder
  /**
   * Current directory as folder **keys** (controlled).
   * Omit for an internal path buffer. Double-click / breadcrumb / Backspace
   * change the visible folder without a parent handler.
   */
  currentPath?: string[]
  /** Uncontrolled initial path (folder keys) */
  defaultCurrentPath?: string[]
  /** Show hidden files (prefixed with .) */
  showHidden?: boolean
  /**
   * Enable HTML5 reorder of the current folder.
   * Disabled while search or hidden-file filtering is hiding items.
   * Pointer only — there is no keyboard move.
   */
  draggable?: boolean
  /** Loading state */
  loading?: boolean
  /** Empty text */
  emptyText?: string
  /** Searchable */
  searchable?: boolean
  /**
   * Search text (controlled). `''` is a real empty query.
   * Matches names in the current folder only.
   */
  searchText?: string
  /** Uncontrolled initial search text */
  defaultSearchText?: string
  /** Custom class */
  className?: string
  /** Locale override merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Called when an item is selected */
  onSelect?: (item: FileItem) => void
  /** Called when an item is opened (file) */
  onOpen?: (item: FileItem) => void
  /** Called when navigating into a folder / breadcrumb */
  onNavigate?: (path: string[]) => void
  /** Called when the selected keys change */
  onSelectedKeysChange?: (keys: (string | number)[]) => void
  /** Called when the current path changes */
  onCurrentPathChange?: (path: string[]) => void
  /** Called when the search text changes */
  onSearchTextChange?: (text: string) => void
  /**
   * Called when items are reordered via drag-and-drop (requires `draggable`).
   * Receives the reordered **current-folder** source array (not a filtered view).
   */
  onReorder?: (items: FileItem[], fromIndex: number, toIndex: number) => void
  /**
   * Called with a new `files` tree after a current-folder reorder.
   * The tree is rewritten immutably at `currentPath`; other folders stay.
   */
  onFilesChange?: (files: FileItem[]) => void
}
