import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getFileManagerContainerClasses,
  getFileItemClasses,
  deriveFileManagerModel,
  toggleFileSelection,
  resolveFileOpen,
  sliceBreadcrumbPath,
  toFileDragItem,
  applyFileDragReorder,
  formatFileSizeLabel,
  getFileManagerLabels,
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
  resolveLocaleText,
  mergeTigerLocale,
  type FileItem,
  type FileSortField,
  type FileManagerProps as CoreFileManagerProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface FileManagerProps extends CoreFileManagerProps {
  /** Custom icon renderer */
  renderIcon?: (item: FileItem) => React.ReactNode
}

export const FileManager: React.FC<FileManagerProps> = ({
  files = [],
  viewMode = 'list',
  selectedKeys = [],
  multiple = false,
  columns,
  sortField = 'name',
  sortOrder = 'asc',
  currentPath = [],
  showHidden = false,
  draggable = false,
  loading = false,
  emptyText,
  searchable = false,
  searchText = '',
  className,
  onSelect,
  onOpen,
  onNavigate,
  onSelectedKeysChange,
  onCurrentPathChange,
  onSearchTextChange,
  onReorder,
  renderIcon,
  locale
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const [localSearch, setLocalSearch] = useState(searchText)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragFromIndex = useRef<number | null>(null)
  const labels = useMemo(() => getFileManagerLabels(mergedLocale), [mergedLocale])

  // Which meta columns the list view shows (name is always rendered).
  const metaColumns = columns ?? ['size', 'modified']
  const showSizeColumn = metaColumns.includes('size')
  const showModifiedColumn = metaColumns.includes('modified')
  const showTypeColumn = metaColumns.includes('type')

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
      {labels.rootText}
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

  const firstEnabledIndex = model.processedItems.findIndex((item) => !item.disabled)
  const focusedItem =
    focusedIndex >= 0 && !model.processedItems[focusedIndex]?.disabled
      ? focusedIndex
      : firstEnabledIndex

  const focusItemAt = useCallback((index: number) => {
    requestAnimationFrame(() => {
      contentRef.current?.querySelector<HTMLElement>(`[data-option-index="${index}"]`)?.focus()
    })
  }, [])

  const moveFocus = useCallback(
    (current: number, direction: 1 | -1) => {
      if (model.processedItems.length === 0) return
      let next = current
      for (let i = 0; i < model.processedItems.length; i += 1) {
        next = (next + direction + model.processedItems.length) % model.processedItems.length
        if (!model.processedItems[next]?.disabled) {
          setFocusedIndex(next)
          focusItemAt(next)
          return
        }
      }
    },
    [focusItemAt, model.processedItems]
  )

  const handleItemKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, item: FileItem, index: number) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault()
          moveFocus(index, 1)
          return
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault()
          moveFocus(index, -1)
          return
        case 'Home':
          event.preventDefault()
          if (firstEnabledIndex >= 0) {
            setFocusedIndex(firstEnabledIndex)
            focusItemAt(firstEnabledIndex)
          }
          return
        case 'End': {
          event.preventDefault()
          let lastEnabledIndex = -1
          for (let next = model.processedItems.length - 1; next >= 0; next -= 1) {
            if (!model.processedItems[next]?.disabled) {
              lastEnabledIndex = next
              break
            }
          }
          if (lastEnabledIndex >= 0) {
            setFocusedIndex(lastEnabledIndex)
            focusItemAt(lastEnabledIndex)
          }
          return
        }
        case ' ':
          event.preventDefault()
          handleSelect(item)
          return
        case 'Enter':
          event.preventDefault()
          handleSelect(item)
          handleOpen(item)
          return
        default:
          return
      }
    },
    [firstEnabledIndex, focusItemAt, handleOpen, handleSelect, model.processedItems, moveFocus]
  )

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, item: FileItem, index: number) => {
      if (!draggable || item.disabled) return
      dragFromIndex.current = index
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(toFileDragItem(item, index).id))
    },
    [draggable]
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!draggable || dragFromIndex.current === null) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    },
    [draggable]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, toIndex: number) => {
      if (!draggable) return
      const fromIndex = dragFromIndex.current
      dragFromIndex.current = null
      if (fromIndex === null || fromIndex === toIndex) return
      event.preventDefault()
      const items = model.processedItems
      const reordered = applyFileDragReorder(items, {
        item: toFileDragItem(items[fromIndex], fromIndex),
        fromIndex,
        toIndex,
        fromContainerId: '',
        toContainerId: ''
      })
      onReorder?.(reordered, fromIndex, toIndex)
    },
    [draggable, model.processedItems, onReorder]
  )

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
            placeholder={resolveLocaleText('Search...', mergedLocale?.common?.searchPlaceholder)}
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              onSearchTextChange?.(e.target.value)
            }}
          />
        )}
      </div>

      {model.processedItems.length > 0 ? (
        <div
          ref={contentRef}
          className={contentClass}
          role="listbox"
          aria-multiselectable={multiple}>
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
                tabIndex={!item.disabled && index === focusedItem ? 0 : -1}
                data-option-index={index}
                data-disabled={item.disabled || undefined}
                data-drag-id={dragItem?.id}
                onFocus={() => {
                  if (!item.disabled) setFocusedIndex(index)
                }}
                onKeyDown={(event) => handleItemKeyDown(event, item, index)}
                onClick={() => handleSelect(item)}
                onDoubleClick={() => handleOpen(item)}
                draggable={draggable && !item.disabled}
                onDragStart={(event) => handleDragStart(event, item, index)}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event, index)}>
                {renderIcon ? (
                  renderIcon(item)
                ) : (
                  <span className={fileManagerItemIconClasses} aria-hidden="true">
                    {item.type === 'folder' ? '📁' : '📄'}
                  </span>
                )}
                <span className={fileManagerItemNameClasses}>{item.name}</span>
                {viewMode === 'list' && showTypeColumn && (
                  <span className={fileManagerItemMetaClasses}>{item.extension ?? item.type}</span>
                )}
                {viewMode === 'list' && showSizeColumn && item.size !== undefined && (
                  <span className={fileManagerItemMetaClasses}>
                    {formatFileSizeLabel(item.size)}
                  </span>
                )}
                {viewMode === 'list' && showModifiedColumn && item.modified && (
                  <span className={fileManagerItemMetaClasses}>{item.modified}</span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className={fileManagerEmptyClasses}>
          {resolveLocaleText('Empty folder', emptyText, mergedLocale?.common?.emptyText)}
        </div>
      )}

      {loading && (
        <div className={fileManagerLoadingClasses}>
          {resolveLocaleText('Loading...', mergedLocale?.common?.loadingText)}
        </div>
      )}
    </div>
  )
}

export default FileManager
