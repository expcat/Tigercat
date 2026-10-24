import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  canEmitFileDelete,
  canEmitFileOpen,
  canEmitFileRename,
  classNames,
  fileToUploadFile,
  filterUploadPreviewUrl,
  getW9DataLabels,
  isImageUploadFile,
  sanitizeFileDisplayName,
  searchFileTree,
  getFileManagerContainerClasses,
  getFileItemClasses,
  getFileManagerContentClasses,
  fileManagerContentClasses,
  getFileManagerGridStyle,
  deriveFileManagerModel,
  selectFileItem,
  toggleFileSelection,
  getFileManagerWindow,
  createFileManagerMeasure,
  FILE_MANAGER_DEFAULT_HEIGHT,
  FILE_MANAGER_LIST_ROW_HEIGHT,
  FILE_MANAGER_VIRTUAL_MIN_COUNT,
  FILE_BREADCRUMB_SEPARATOR,
  manageLiveRegion,
  scrollTopForVirtualAlign,
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
import { useTigerConfig } from './tiger-config'

export interface FileManagerProps
  extends
    Omit<CoreFileManagerProps, 'className'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CoreFileManagerProps | 'onSelect'> {
  className?: string
  /** Custom icon renderer */
  renderIcon?: (item: FileItem) => React.ReactNode
  bind?: {
    query?: string
    recursive?: boolean
    name?: string
    permission?: { readable?: boolean; writable?: boolean }
  }
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
  bind,
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
  const [fileAction, setFileAction] = useState('')
  const [uploadedName, setUploadedName] = useState('')
  const [previewLabel, setPreviewLabel] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const [viewport, setViewport] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<ReturnType<typeof manageLiveRegion> | null>(null)
  const measureRef = useRef(createFileManagerMeasure(FILE_MANAGER_LIST_ROW_HEIGHT))
  const followBottomRef = useRef(false)
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

  const pathKey = JSON.stringify(path)
  const viewKey = `${pathKey}\0${query}\0${model.processedItems.length}`
  useLayoutEffect(() => {
    followBottomRef.current = false
  }, [gridColumns, sortField, sortOrder, viewKey, viewMode])
  useEffect(() => {
    setFocusedIndex(0)
  }, [viewKey])

  const drag = useDrag({
    onDrop: (event) => {
      if (!model.canReorder) return
      const fromIndex = model.processedItems.findIndex((item) => item.key === event.item.id)
      const toIndex = event.overItem
        ? model.processedItems.findIndex((item) => item.key === event.overItem?.id)
        : event.toIndex
      if (fromIndex < 0 || toIndex < 0) return
      const result = applyFileManagerReorder(tree, path, fromIndex, toIndex, model.processedItems)
      if (!result) return
      onReorder?.(result.layer, fromIndex, toIndex)
      onFilesChange?.(result.files)
    }
  })
  const endDrag = drag.endDrag
  useLayoutEffect(() => {
    endDrag(true)
  }, [endDrag, pathKey])

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

  const focusItemAt = useCallback(
    (index: number, followEnd = false) => {
      followBottomRef.current = followEnd
      const host = contentRef.current
      if (host && model.processedItems.length >= FILE_MANAGER_VIRTUAL_MIN_COUNT) {
        const columns = Math.max(1, Math.floor(gridColumns) || DEFAULT_FILE_GRID_COLUMNS)
        const row = viewMode === 'grid' ? Math.floor(index / columns) : index
        const offset =
          viewMode === 'grid'
            ? measureRef.current.strategy.getItemOffset(row)
            : index * FILE_MANAGER_LIST_ROW_HEIGHT
        const size =
          viewMode === 'grid'
            ? measureRef.current.strategy.getItemHeight(row)
            : FILE_MANAGER_LIST_ROW_HEIGHT
        const next = followEnd
          ? Math.max(0, host.scrollHeight - host.clientHeight)
          : scrollTopForVirtualAlign({
              scrollTop: host.scrollTop,
              viewport: host.clientHeight,
              offset,
              size,
              align: 'auto'
            })
        if (next !== host.scrollTop) {
          host.scrollTop = next
          setScrollTop(next)
        }
      }
      requestAnimationFrame(() => {
        contentRef.current?.querySelector<HTMLElement>(`[data-option-index="${index}"]`)?.focus()
      })
    },
    [gridColumns, model.processedItems.length, viewMode]
  )

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
        focusItemAt(action.index, action.type === 'end')
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
    liveRef.current?.announce(loading ? `${loadingLabel ?? ''} ${resultCount}`.trim() : resultCount)
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
        viewport,
        gridColumns
      )
    }
    return getFileManagerWindow(
      model.processedItems.length,
      scrollTop,
      viewport,
      FILE_MANAGER_LIST_ROW_HEIGHT
    )
  }, [measureTick, model.processedItems, scrollTop, viewMode, viewport, gridColumns])

  useLayoutEffect(() => {
    const host = contentRef.current
    if (viewMode !== 'grid' || !fileWindow.virtual || !host) return
    if (followBottomRef.current) {
      const next = Math.max(0, host.scrollHeight - host.clientHeight)
      if (next !== host.scrollTop) {
        host.scrollTop = next
        setScrollTop(next)
      }
    }
    const columns = Math.max(1, Math.floor(gridColumns) || DEFAULT_FILE_GRID_COLUMNS)
    const rowHeights = new Map<number, number>()
    let rowGap = 0
    let changed = false
    host.querySelectorAll<HTMLElement>('[data-option-index]').forEach((node) => {
      const index = Number(node.dataset.optionIndex)
      const row = Math.floor(index / columns)
      const height = node.getBoundingClientRect().height
      rowHeights.set(row, Math.max(rowHeights.get(row) ?? 0, height))
      if (node.parentElement) {
        rowGap = Number.parseFloat(getComputedStyle(node.parentElement).rowGap) || 0
      }
    })
    rowHeights.forEach((height, row) => {
      const next = height + rowGap
      const prev = measureRef.current.strategy.getItemHeight(row)
      if (next > 0 && Math.abs(next - prev) > 1) {
        measureRef.current.measure(row, next)
        changed = true
      }
    })
    if (changed) setMeasureTick((tick) => tick + 1)
  }, [fileWindow, gridColumns, viewMode])

  const emptyLabel =
    emptyText ??
    (mergedLocale?.fileManager?.emptyText && mergedLocale.fileManager.emptyText !== 'Empty folder'
      ? mergedLocale.fileManager.emptyText
      : undefined) ??
    (mergedLocale?.common?.emptyText && mergedLocale.common.emptyText !== 'No data'
      ? mergedLocale.common.emptyText
      : undefined) ??
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
      {bind ? (
        <div data-tiger-file-bind="">
          <button
            type="button"
            data-tiger-file-open=""
            disabled={!canEmitFileOpen(bind.permission)}
            onClick={() => {
              if (canEmitFileOpen(bind.permission)) onOpen?.(files?.[0] as FileItem)
            }}>
            {getW9DataLabels().preview}
          </button>
          <button
            type="button"
            data-tiger-file-rename=""
            disabled={!canEmitFileRename(bind.permission)}
            onClick={() => {
              if (canEmitFileRename(bind.permission)) {
                setFileAction(sanitizeFileDisplayName(bind.name ?? ''))
              }
            }}>
            {getW9DataLabels().rename}
          </button>
          <button
            type="button"
            data-tiger-file-delete=""
            disabled={!canEmitFileDelete(bind.permission)}
            onClick={() => {
              if (canEmitFileDelete(bind.permission)) {
                setFileAction(`delete:${sanitizeFileDisplayName(bind.name ?? '')}`)
              }
            }}>
            {getW9DataLabels().delete}
          </button>
          <input
            type="file"
            data-tiger-file-upload=""
            aria-label={getW9DataLabels().upload}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              const uploaded = fileToUploadFile(file)
              setUploadedName(uploaded.name)
              setPreviewLabel(
                filterUploadPreviewUrl(uploaded.url) ??
                  (isImageUploadFile(uploaded) ? uploaded.name : '')
              )
            }}
          />
          <span data-file-upload="">{uploadedName}</span>
          <span data-file-preview="">{previewLabel}</span>
          {searchFileTree(files ?? [], bind.query ?? '', bind.recursive === true).map((hit) => (
            <span key={hit.path.join('/')} data-file-hit={hit.item.name} />
          ))}
          <span data-file-action="">{fileAction}</span>
        </div>
      ) : null}
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
          className={fileWindow.virtual ? fileManagerContentClasses : contentClass}
          style={fileWindow.virtual ? undefined : gridStyle}
          role="listbox"
          aria-label={`${labels.listboxAriaLabel}, ${resultCount}`}
          aria-multiselectable={multiple || undefined}
          aria-disabled={loading || undefined}
          onScroll={(event) => {
            const host = event.currentTarget
            followBottomRef.current = host.scrollTop + host.clientHeight >= host.scrollHeight - 1
            setScrollTop(host.scrollTop)
          }}>
          {fileWindow.virtual ? (
            <div style={{ height: fileWindow.totalHeight, position: 'relative' }}>
              <div
                className={viewMode === 'grid' ? 'grid gap-2' : undefined}
                style={{ ...gridStyle, transform: `translateY(${fileWindow.offsetTop}px)` }}>
                {visibleItems.map((item) => renderFileOption(item))}
              </div>
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
      ((event: React.PointerEvent<HTMLDivElement>) => void) | undefined
    const onDragKeyDown = dragProps?.onKeyDown as
      ((event: React.KeyboardEvent<HTMLDivElement>) => void) | undefined
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
        data-drag-id-type={dragProps?.['data-drag-id-type'] as 'string' | 'number' | undefined}
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
