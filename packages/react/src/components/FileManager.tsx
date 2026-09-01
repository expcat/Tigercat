import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getFileManagerContainerClasses,
  getFileItemClasses,
  getFileManagerContentClasses,
  getFileManagerGridStyle,
  deriveFileManagerModel,
  toggleFileSelection,
  resolveFileOpen,
  buildFileBreadcrumb,
  applyFileManagerReorder,
  clampFileManagerFocusIndex,
  resolveFileManagerItemKeydown,
  resolveFileItemExtension,
  resolveFileItemIcon,
  toFileDragItem,
  formatFileSizeLabel,
  getFileManagerLabels,
  DEFAULT_FILE_COLUMNS,
  DEFAULT_FILE_GRID_COLUMNS,
  EMPTY_FILE_ITEMS,
  EMPTY_FILE_PATH,
  fileManagerToolbarClasses,
  fileManagerBreadcrumbClasses,
  fileManagerBreadcrumbListClasses,
  fileManagerBreadcrumbItemClasses,
  fileManagerBreadcrumbCurrentClasses,
  fileManagerBreadcrumbSeparatorClasses,
  fileManagerItemIconClasses,
  fileManagerItemNameClasses,
  fileManagerItemMetaClasses,
  fileManagerEmptyClasses,
  fileManagerLoadingClasses,
  fileManagerSearchClasses,
  mergeTigerLocale,
  type FileItem,
  type FileManagerProps as CoreFileManagerProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useDrag } from '../hooks/useDrag'
import { useTigerConfig } from './ConfigProvider'

export interface FileManagerProps
  extends
    Omit<CoreFileManagerProps, 'className'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CoreFileManagerProps | 'onSelect'> {
  /** Custom icon renderer */
  renderIcon?: (item: FileItem) => React.ReactNode
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  viewMode = 'list',
  gridColumns = DEFAULT_FILE_GRID_COLUMNS,
  selectedKeys,
  defaultSelectedKeys,
  multiple = false,
  columns,
  sortField = 'name',
  sortOrder = 'asc',
  currentPath,
  defaultCurrentPath,
  showHidden = false,
  draggable = false,
  loading = false,
  emptyText,
  searchable = false,
  searchText,
  defaultSearchText,
  className,
  onSelect,
  onOpen,
  onNavigate,
  onSelectedKeysChange,
  onCurrentPathChange,
  onSearchTextChange,
  onReorder,
  onFilesChange,
  renderIcon,
  locale,
  style,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getFileManagerLabels(mergedLocale), [mergedLocale])
  const isRtl = mergedLocale?.direction === 'rtl'
  const tree = files ?? EMPTY_FILE_ITEMS
  const [focusedIndex, setFocusedIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const [keys, setKeys] = useControlledState({
    value: selectedKeys,
    defaultValue: defaultSelectedKeys ?? [],
    onChange: onSelectedKeysChange
  })
  const [path, setPath] = useControlledState({
    value: currentPath,
    defaultValue: defaultCurrentPath ?? EMPTY_FILE_PATH,
    onChange: (next) => {
      onCurrentPathChange?.(next)
      onNavigate?.(next)
    }
  })
  const [query, setQuery] = useControlledState({
    value: searchText,
    defaultValue: defaultSearchText ?? '',
    onChange: onSearchTextChange
  })

  const metaColumns = columns ?? DEFAULT_FILE_COLUMNS
  const showSizeColumn = metaColumns.includes('size')
  const showModifiedColumn = metaColumns.includes('modified')
  const showTypeColumn = metaColumns.includes('type')

  const model = useMemo(
    () =>
      deriveFileManagerModel({
        files: tree,
        currentPath: path,
        selectedKeys: keys,
        sortField,
        sortOrder,
        showHidden,
        searchText: query,
        draggable
      }),
    [tree, path, keys, sortField, sortOrder, showHidden, query, draggable]
  )

  const viewKey = `${path.join('/')}\0${query}\0${model.processedItems.length}`
  useEffect(() => {
    setFocusedIndex(0)
  }, [viewKey])

  const drag = useDrag({
    containerId: 'files',
    onDrop: (event) => {
      if (!model.canReorder) return
      const result = applyFileManagerReorder(
        tree,
        path,
        event.fromIndex,
        event.toIndex,
        model.currentItems
      )
      if (!result) return
      onReorder?.(result.layer, event.fromIndex, event.toIndex)
      onFilesChange?.(result.files)
    }
  })

  const containerClasses = useMemo(() => getFileManagerContainerClasses(className), [className])
  const contentClass = getFileManagerContentClasses(viewMode)
  const gridStyle = getFileManagerGridStyle(viewMode, gridColumns)
  const breadcrumbs = useMemo(
    () => buildFileBreadcrumb(tree, path, labels.rootText),
    [tree, path, labels.rootText]
  )
  const focusedItem = clampFileManagerFocusIndex(focusedIndex, model.processedItems)

  const commitPath = useCallback(
    (next: string[]) => {
      setPath(next)
    },
    [setPath]
  )

  const handleSelect = useCallback(
    (item: FileItem) => {
      if (loading || item.disabled) return
      onSelect?.(item)
      setKeys(toggleFileSelection(keys, item.key, multiple))
    },
    [keys, loading, multiple, onSelect, setKeys]
  )

  const handleOpen = useCallback(
    (item: FileItem) => {
      if (loading) return
      const result = resolveFileOpen(item, path)
      if (!result) return
      if (result.type === 'navigate') {
        commitPath(result.path!)
      } else {
        onOpen?.(result.item!)
      }
    },
    [commitPath, loading, onOpen, path]
  )

  const focusItemAt = useCallback((index: number) => {
    requestAnimationFrame(() => {
      contentRef.current?.querySelector<HTMLElement>(`[data-option-index="${index}"]`)?.focus()
    })
  }, [])

  const handleItemKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, item: FileItem, index: number) => {
      if (loading) return
      const action = resolveFileManagerItemKeydown({
        key: event.key,
        altKey: event.altKey,
        viewMode,
        gridColumns,
        isRtl,
        currentIndex: index,
        items: model.processedItems,
        currentPath: path
      })
      if (!action) return
      event.preventDefault()
      if (action.type === 'move' || action.type === 'home' || action.type === 'end') {
        setFocusedIndex(action.index)
        focusItemAt(action.index)
        return
      }
      if (action.type === 'select') {
        handleSelect(item)
        return
      }
      if (action.type === 'open') {
        handleSelect(item)
        handleOpen(item)
        return
      }
      commitPath(action.path)
    },
    [
      commitPath,
      focusItemAt,
      gridColumns,
      handleOpen,
      handleSelect,
      isRtl,
      loading,
      model.processedItems,
      path,
      viewMode
    ]
  )

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, item: FileItem, index: number) => {
      if (!model.canReorder || item.disabled) return
      drag.startDrag(toFileDragItem(item, index, 'files'), event)
    },
    [drag, model.canReorder]
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>, item: FileItem, index: number) => {
      if (!model.canReorder || item.disabled) return
      drag.dragOver(toFileDragItem(item, index, 'files'), event)
    },
    [drag, model.canReorder]
  )

  const emptyLabel =
    emptyText ??
    mergedLocale?.fileManager?.emptyText ??
    mergedLocale?.common?.emptyText ??
    labels.emptyText
  const loadingLabel = mergedLocale?.common?.loadingText

  return (
    <div
      {...rest}
      className={classNames(containerClasses)}
      style={style}
      aria-busy={loading || undefined}>
      <div className={fileManagerToolbarClasses}>
        <nav className={fileManagerBreadcrumbClasses} aria-label={labels.pathAriaLabel}>
          <ol className={fileManagerBreadcrumbListClasses}>
            {breadcrumbs.map((segment, index) => (
              <li key={segment.key || 'root'} className="flex items-center gap-1">
                {index > 0 ? (
                  <span className={fileManagerBreadcrumbSeparatorClasses} aria-hidden="true">
                    /
                  </span>
                ) : null}
                {segment.current ? (
                  <span className={fileManagerBreadcrumbCurrentClasses} aria-current="page">
                    {segment.name}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={fileManagerBreadcrumbItemClasses}
                    onClick={() => commitPath(segment.path)}>
                    {segment.name}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex-1" />
        {searchable && (
          <input
            type="text"
            className={fileManagerSearchClasses}
            placeholder={mergedLocale?.common?.searchPlaceholder}
            aria-label={labels.searchAriaLabel}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
      </div>

      {model.processedItems.length > 0 ? (
        <div
          ref={contentRef}
          className={contentClass}
          style={gridStyle}
          role="listbox"
          aria-label={labels.listboxAriaLabel}
          aria-multiselectable={multiple || undefined}
          aria-disabled={loading || undefined}>
          {model.processedItems.map((item, index) => {
            const isSelected = model.selectedSet.has(item.key)
            const itemClass = getFileItemClasses(viewMode, isSelected, Boolean(item.disabled))
            const canDrag = model.canReorder && !item.disabled
            return (
              <div
                key={item.key}
                className={itemClass}
                role="option"
                aria-selected={isSelected}
                aria-disabled={item.disabled || undefined}
                tabIndex={!loading && !item.disabled && index === focusedItem ? 0 : -1}
                data-option-index={index}
                data-disabled={item.disabled || undefined}
                data-drag-id={item.key}
                data-drag-index={index}
                data-drag-container="files"
                onFocus={() => {
                  if (!item.disabled) setFocusedIndex(index)
                }}
                onKeyDown={(event) => handleItemKeyDown(event, item, index)}
                onClick={() => handleSelect(item)}
                onDoubleClick={() => handleOpen(item)}
                draggable={canDrag}
                onDragStart={canDrag ? (event) => handleDragStart(event, item, index) : undefined}
                onDragOver={canDrag ? (event) => handleDragOver(event, item, index) : undefined}
                onDrop={canDrag ? (event) => drag.drop(event) : undefined}
                onDragEnd={canDrag ? () => drag.endDrag() : undefined}>
                {renderIcon ? (
                  renderIcon(item)
                ) : (
                  <span className={fileManagerItemIconClasses} aria-hidden="true">
                    {resolveFileItemIcon(item)}
                  </span>
                )}
                <span className={fileManagerItemNameClasses}>{item.name}</span>
                {viewMode === 'list' && showTypeColumn && (
                  <span className={fileManagerItemMetaClasses}>
                    {resolveFileItemExtension(item) || item.type}
                  </span>
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
        <div className={fileManagerEmptyClasses}>{emptyLabel}</div>
      )}

      {loading && (
        <div className={fileManagerLoadingClasses} role="status">
          {loadingLabel}
        </div>
      )}
    </div>
  )
}

export default FileManager
