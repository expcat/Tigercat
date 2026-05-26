import React, { useCallback, useMemo, useState } from 'react'
import {
  classNames,
  getFileManagerContainerClasses,
  getFileItemClasses,
  deriveFileManagerModel,
  toggleFileSelection,
  resolveFileOpen,
  sliceBreadcrumbPath,
  toFileDragItem,
  formatFileSizeLabel,
  fileManagerToolbarClasses,
  fileManagerBreadcrumbClasses,
  fileManagerBreadcrumbItemClasses,
  fileManagerBreadcrumbSeparatorClasses,
  fileManagerContentClasses,
  fileManagerItemIconClasses,
  fileManagerItemNameClasses,
  fileManagerItemMetaClasses,
  fileManagerEmptyClasses,
  fileManagerLoadingClasses,
  fileManagerSearchClasses,
  type FileItem,
  type FileViewMode,
  type FileSortField,
  type FileSortOrder
} from '@expcat/tigercat-core'

export interface FileManagerProps {
  files?: FileItem[]
  viewMode?: FileViewMode
  selectedKeys?: (string | number)[]
  multiple?: boolean
  sortField?: FileSortField
  sortOrder?: FileSortOrder
  currentPath?: string[]
  showHidden?: boolean
  draggable?: boolean
  loading?: boolean
  emptyText?: string
  searchable?: boolean
  searchText?: string
  className?: string
  onSelect?: (item: FileItem) => void
  onOpen?: (item: FileItem) => void
  onNavigate?: (path: string[]) => void
  onSelectedKeysChange?: (keys: (string | number)[]) => void
  onCurrentPathChange?: (path: string[]) => void
  onSearchTextChange?: (text: string) => void
  renderIcon?: (item: FileItem) => React.ReactNode
}

export const FileManager: React.FC<FileManagerProps> = ({
  files = [],
  viewMode = 'list',
  selectedKeys = [],
  multiple = false,
  sortField = 'name',
  sortOrder = 'asc',
  currentPath = [],
  showHidden = false,
  draggable = false,
  loading = false,
  emptyText = 'Empty folder',
  searchable = false,
  searchText = '',
  className,
  onSelect,
  onOpen,
  onNavigate,
  onSelectedKeysChange,
  onCurrentPathChange,
  onSearchTextChange,
  renderIcon
}) => {
  const [localSearch, setLocalSearch] = useState(searchText)

  const model = useMemo(
    () =>
      deriveFileManagerModel({
        files,
        currentPath,
        selectedKeys,
        sortField,
        sortOrder,
        showHidden,
        searchText: localSearch || searchText
      }),
    [files, currentPath, selectedKeys, sortField, sortOrder, showHidden, localSearch, searchText]
  )

  const containerClasses = useMemo(() => getFileManagerContainerClasses(className), [className])

  const handleSelect = useCallback(
    (item: FileItem) => {
      if (item.disabled) return
      onSelect?.(item)
      const keys = toggleFileSelection(selectedKeys, item.key, multiple)
      onSelectedKeysChange?.(keys)
    },
    [selectedKeys, multiple, onSelect, onSelectedKeysChange]
  )

  const handleOpen = useCallback(
    (item: FileItem) => {
      const result = resolveFileOpen(item, currentPath)
      if (!result) return
      if (result.type === 'navigate') {
        onCurrentPathChange?.(result.path!)
        onNavigate?.(result.path!)
      } else {
        onOpen?.(result.item!)
      }
    },
    [currentPath, onOpen, onNavigate, onCurrentPathChange]
  )

  const navigateToBreadcrumb = useCallback(
    (index: number) => {
      const newPath = sliceBreadcrumbPath(currentPath, index)
      onCurrentPathChange?.(newPath)
      onNavigate?.(newPath)
    },
    [currentPath, onNavigate, onCurrentPathChange]
  )

  const breadcrumbItems = [
    <span
      key="root"
      className={fileManagerBreadcrumbItemClasses}
      onClick={() => navigateToBreadcrumb(0)}>
      Root
    </span>,
    ...currentPath.flatMap((seg, i) => [
      <span key={`sep-${i}`} className={fileManagerBreadcrumbSeparatorClasses}>
        /
      </span>,
      <span
        key={`path-${i}`}
        className={fileManagerBreadcrumbItemClasses}
        onClick={() => navigateToBreadcrumb(i + 1)}>
        {seg}
      </span>
    ])
  ]

  const contentClass =
    viewMode === 'grid'
      ? `${fileManagerContentClasses} grid grid-cols-4 gap-2`
      : fileManagerContentClasses

  return (
    <div className={classNames(containerClasses)}>
      <div className={fileManagerToolbarClasses}>
        <nav className={fileManagerBreadcrumbClasses} aria-label="File path">
          {breadcrumbItems}
        </nav>
        <div className="flex-1" />
        {searchable && (
          <input
            type="text"
            className={fileManagerSearchClasses}
            placeholder="Search..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              onSearchTextChange?.(e.target.value)
            }}
          />
        )}
      </div>

      {model.processedItems.length > 0 ? (
        <div className={contentClass} role="listbox" aria-multiselectable={multiple}>
          {model.processedItems.map((item, index) => {
            const isSelected = model.selectedSet.has(item.key)
            const itemClass = getFileItemClasses(viewMode, isSelected)
            const dragItem = draggable && !item.disabled ? toFileDragItem(item, index) : undefined

            return (
              <div
                key={item.key}
                className={itemClass}
                role="option"
                aria-selected={isSelected}
                data-disabled={item.disabled || undefined}
                data-drag-id={dragItem?.id}
                onClick={() => handleSelect(item)}
                onDoubleClick={() => handleOpen(item)}
                draggable={draggable && !item.disabled}>
                {renderIcon ? (
                  renderIcon(item)
                ) : (
                  <span className={fileManagerItemIconClasses} aria-hidden="true">
                    {item.type === 'folder' ? '📁' : '📄'}
                  </span>
                )}
                <span className={fileManagerItemNameClasses}>{item.name}</span>
                {viewMode === 'list' && item.size !== undefined && (
                  <span className={fileManagerItemMetaClasses}>
                    {formatFileSizeLabel(item.size)}
                  </span>
                )}
                {viewMode === 'list' && item.modified && (
                  <span className={fileManagerItemMetaClasses}>{item.modified}</span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className={fileManagerEmptyClasses}>{emptyText}</div>
      )}

      {loading && <div className={fileManagerLoadingClasses}>Loading...</div>}
    </div>
  )
}

export default FileManager
