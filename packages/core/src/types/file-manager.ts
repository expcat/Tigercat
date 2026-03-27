/**
 * FileManager types
 *
 * Extends TreeNode for file/folder representation with
 * additional metadata and operations.
 */

export type FileType = 'file' | 'folder'

export type FileViewMode = 'list' | 'grid'

export type FileSortField = 'name' | 'size' | 'type' | 'modified'

export type FileSortOrder = 'asc' | 'desc'

export interface FileItem {
  key: string | number
  name: string
  type: FileType
  /** File extension (e.g. 'ts', 'png') */
  extension?: string
  /** Size in bytes */
  size?: number
  /** ISO timestamp */
  modified?: string
  /** MIME type */
  mimeType?: string
  /** Custom icon identifier */
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
  /** Currently selected file keys */
  selectedKeys?: (string | number)[]
  /** Allow multiple selection */
  multiple?: boolean
  /** Which columns to show in list view */
  columns?: FileSortField[]
  /** Sort field */
  sortField?: FileSortField
  /** Sort order */
  sortOrder?: FileSortOrder
  /** Current directory path (breadcrumb) */
  currentPath?: string[]
  /** Show hidden files (prefixed with .) */
  showHidden?: boolean
  /** Enable drag and drop */
  draggable?: boolean
  /** Loading state */
  loading?: boolean
  /** Empty text */
  emptyText?: string
  /** Searchable */
  searchable?: boolean
  /** Search text */
  searchText?: string
  /** Custom class */
  className?: string
}
