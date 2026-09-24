import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getFileManagerContainerClasses,
  getFileItemClasses,
  getFileManagerContentClasses,
  getFileManagerGridStyle,
  deriveFileManagerModel,
  selectFileItem,
  toggleFileSelection,
  sanitizeFileDisplayName,
  getFileManagerWindow,
  createFileManagerMeasure,
  FILE_MANAGER_DEFAULT_HEIGHT,
  FILE_MANAGER_LIST_ROW_HEIGHT,
  FILE_BREADCRUMB_SEPARATOR,
  manageLiveRegion,
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
  className?: string
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
  const [scrollTop, setScrollTop] = useState(0)
  const [viewport, setViewport] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<ReturnType<typeof manageLiveRegion> | null>(null)
  const measureRef = useRef(createFileManagerMeasure(FILE_MANAGER_LIST_ROW_HEIGHT))
  const [measureTick, setMeasureTick] = useState(0)
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
    onDrop: (event) => {
      if (!model.canReorder) return
      const result = applyFileManagerReorder(
        tree,
        path,
        event.fromIndex,
        event.toIndex,
        model.processedItems
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
    (next: (string | number)[]) => {
      setPath(next)
    },
    [setPath]
  )

  const writeSelection = useCallback(
    (item: FileItem, mode: 'select' | 'toggle') => {
      if (loading || item.disabled) return
      onSelect?.(item)
      const next =
        mode === 'toggle'
          ? toggleFileSelection(keys, item.key, multiple)
          : selectFileItem(keys, item.key, multiple)
      setKeys(next)
    },
    [keys, loading, multiple, onSelect, setKeys]
  )

  const handleSelect = useCallback(
    (item: FileItem) => {
      writeSelection(item, 'select')
    },
    [writeSelection]
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
        writeSelection(item, 'toggle')
        return
      }
      if (action.type === 'open') {
        writeSelection(item, 'select')
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
      isRtl,
      loading,
      model.processedItems,
      path,
      viewMode,
      writeSelection
    ]
  )

  useEffect(() => {
    const region = manageLiveRegion('polite')
    liveRef.current = region
    return () => {
      region.destroy()
      liveRef.current = null
    }
  }, [])

  const loadingLabel = mergedLocale?.common?.loadingText
  const resultCount = (labels.resultCountText ?? '{count}').replace(
    '{count}',
    String(model.processedItems.length)
  )

  useEffect(() => {
    if (!loading) return
    liveRef.current?.announce(`${loadingLabel ?? ''} ${resultCount}`.trim())
  }, [loading, loadingLabel, resultCount])

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return undefined
    const read = () => setViewport(el.clientHeight)
    read()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [model.processedItems.length, loading])

  const fileWindow = useMemo(() => {
    if (viewMode === 'grid') {
      return measureRef.current.windowFor(
        model.processedItems.map((item) => item.key),
        scrollTop,
        viewport
      )
    }
    return getFileManagerWindow(
      model.processedItems.length,
      scrollTop,
      viewport,
      FILE_MANAGER_LIST_ROW_HEIGHT
    )
  }, [measureTick, model.processedItems, scrollTop, viewMode, viewport])

  useLayoutEffect(() => {
    if (viewMode !== 'grid' || !fileWindow.virtual || !contentRef.current) return
    let changed = false
    contentRef.current.querySelectorAll<HTMLElement>('[data-option-index]').forEach((node) => {
      const index = Number(node.dataset.optionIndex)
      const item = model.processedItems[index]
      if (!item) return
      const next = node.getBoundingClientRect().height
      const prev = measureRef.current.strategy.getItemHeight(index)
      if (next > 0 && Math.abs(next - prev) > 1) {
        measureRef.current.measure(index, next, item.key)
        changed = true
      }
    })
    if (changed) setMeasureTick((tick) => tick + 1)
  }, [fileWindow, model.processedItems, viewMode])

  const emptyLabel =
    emptyText ??
    mergedLocale?.fileManager?.emptyText ??
    mergedLocale?.common?.emptyText ??
    labels.emptyText
  const explicitHeight =
    style?.height != null || (className ? /\b(?:h|min-h|max-h)-/.test(className) : false)
  const rootStyle = {
    ...(explicitHeight ? {} : { height: FILE_MANAGER_DEFAULT_HEIGHT }),
    ...style
  }
  const visibleItems = fileWindow.virtual
    ? model.processedItems.slice(fileWindow.start, fileWindow.end)
    : model.processedItems

  return (
    <div
      {...rest}
      className={classNames(containerClasses)}
      style={rootStyle}
      aria-busy={loading || undefined}>
      <div className={fileManagerToolbarClasses}>
        <nav className={fileManagerBreadcrumbClasses} aria-label={labels.pathAriaLabel}>
          <ol className={fileManagerBreadcrumbListClasses}>
            {breadcrumbs.map((segment, index) => (
              <li key={segment.key || 'root'} className="flex items-center gap-1">
                {index > 0 ? (
                  <span className={fileManagerBreadcrumbSeparatorClasses} aria-hidden="true">
                    {FILE_BREADCRUMB_SEPARATOR}
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
          style={
            fileWindow.virtual
              ? { height: fileWindow.totalHeight, position: 'relative' }
              : gridStyle
          }
          role="listbox"
          aria-label={`${labels.listboxAriaLabel}, ${resultCount}`}
          aria-multiselectable={multiple || undefined}
          aria-disabled={loading || undefined}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
          {fileWindow.virtual ? (
            <div style={{ transform: `translateY(${fileWindow.offsetTop}px)` }}>
              {visibleItems.map((item) => renderFileOption(item))}
            </div>
          ) : (
            visibleItems.map((item) => renderFileOption(item))
          )}
        </div>
      ) : (
        <div className={fileManagerEmptyClasses}>
          <span>{emptyLabel}</span>
          <span className="ms-2">{resultCount}</span>
        </div>
      )}

      {loading && (
        <div className={fileManagerLoadingClasses}>
          <span>{loadingLabel}</span>
          <span className="ms-2">{resultCount}</span>
        </div>
      )}
    </div>
  )

  function renderFileOption(item: FileItem) {
    const index = model.processedItems.indexOf(item)
    const isSelected = model.selectedSet.has(item.key)
    const itemClass = getFileItemClasses(viewMode, isSelected, Boolean(item.disabled))
    const canDrag = model.canReorder && !item.disabled
    const dragProps = canDrag
      ? (drag.getDragItemProps(toFileDragItem(item, index)) as Record<string, unknown>)
      : null
    const dragClass = dragProps?.className as string | undefined
    const dragStyle = dragProps?.style as React.CSSProperties | undefined
    const onPointerDown = dragProps?.onPointerDown as
      | ((event: React.PointerEvent<HTMLDivElement>) => void)
      | undefined
    const onDragKeyDown = dragProps?.onKeyDown as
      | ((event: React.KeyboardEvent<HTMLDivElement>) => void)
      | undefined
    return (
      <div
        key={item.key}
        className={classNames(itemClass, dragClass)}
        style={dragStyle}
        role="option"
        aria-selected={isSelected}
        aria-disabled={item.disabled || undefined}
        tabIndex={!loading && !item.disabled && index === focusedItem ? 0 : -1}
        data-option-index={index}
        data-disabled={item.disabled || undefined}
        data-drag-id={dragProps?.['data-drag-id'] as string | number | undefined}
        data-drag-index={dragProps?.['data-drag-index'] as number | undefined}
        data-drag-container={dragProps?.['data-drag-container'] as string | undefined}
        onFocus={() => {
          if (!item.disabled) setFocusedIndex(index)
        }}
        onKeyDown={(event) => {
          onDragKeyDown?.(event)
          if (event.defaultPrevented) return
          handleItemKeyDown(event, item, index)
        }}
        onClick={() => handleSelect(item)}
        onDoubleClick={() => handleOpen(item)}
        onPointerDown={onPointerDown}>
        {renderIcon ? (
          renderIcon(item)
        ) : (
          <span className={fileManagerItemIconClasses} aria-hidden="true">
            {resolveFileItemIcon(item)}
          </span>
        )}
        <span className={fileManagerItemNameClasses}>{sanitizeFileDisplayName(item.name)}</span>
        {viewMode === 'list' && showTypeColumn && (
          <span className={fileManagerItemMetaClasses}>
            {resolveFileItemExtension(item) || item.type}
          </span>
        )}
        {viewMode === 'list' && showSizeColumn && item.size !== undefined && (
          <span className={fileManagerItemMetaClasses}>{formatFileSizeLabel(item.size)}</span>
        )}
        {viewMode === 'list' && showModifiedColumn && item.modified && (
          <span className={fileManagerItemMetaClasses}>{item.modified}</span>
        )}
      </div>
    )
  }
}

export default FileManager
