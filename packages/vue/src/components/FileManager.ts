import {
  defineComponent,
  h,
  ref,
  computed,
  nextTick,
  watch,
  onUpdated,
  onBeforeUnmount,
  PropType
} from 'vue'
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
  coerceClassValue,
  mergeStyleValues,
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
  type FileViewMode,
  type FileSortField,
  type FileSortOrder,
  type FileColumn,
  type TigerLocale,
  type FileManagerProps as CoreFileManagerProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { useDrag } from '../composables/useDrag'

/**
 * Vue FileManager props. Reuses the shared core props except the React-style
 * callbacks — Vue uses emits / `v-model` (`update:selectedKeys`,
 * `update:currentPath`, `update:searchText`, `update:files`, `reorder`).
 */
export type VueFileManagerProps = Omit<
  CoreFileManagerProps,
  | 'onSelect'
  | 'onOpen'
  | 'onNavigate'
  | 'onSelectedKeysChange'
  | 'onCurrentPathChange'
  | 'onSearchTextChange'
  | 'onReorder'
  | 'onFilesChange'
>

export const FileManager = defineComponent({
  name: 'TigerFileManager',
  inheritAttrs: false,
  props: {
    files: { type: Array as PropType<FileItem[]>, default: undefined },
    viewMode: {
      type: String as PropType<FileViewMode>,
      default: 'list'
    },
    gridColumns: { type: Number, default: DEFAULT_FILE_GRID_COLUMNS },
    selectedKeys: {
      type: Array as PropType<(string | number)[]>
    },
    defaultSelectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    multiple: { type: Boolean, default: false },
    columns: {
      type: Array as PropType<FileColumn[]>,
      default: undefined
    },
    sortField: {
      type: String as PropType<FileSortField>,
      default: 'name'
    },
    sortOrder: {
      type: String as PropType<FileSortOrder>,
      default: 'asc'
    },
    currentPath: {
      type: Array as PropType<string[]>,
      default: undefined
    },
    defaultCurrentPath: {
      type: Array as PropType<string[]>,
      default: undefined
    },
    showHidden: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: undefined },
    searchable: { type: Boolean, default: false },
    searchText: { type: String, default: undefined },
    defaultSearchText: { type: String, default: undefined },
    className: { type: String, default: undefined },
    bind: {
      type: Object as PropType<{
        query?: string
        recursive?: boolean
        name?: string
        permission?: { readable?: boolean; writable?: boolean }
      }>,
      default: undefined
    },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  emits: [
    'select',
    'open',
    'navigate',
    'update:currentPath',
    'update:searchText',
    'update:selectedKeys',
    'update:files',
    'reorder'
  ],
  setup(props, { emit, attrs, slots }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getFileManagerLabels(mergedLocale.value))
    const isRtl = computed(() => mergedLocale.value?.direction === 'rtl')
    const focusedIndex = ref(0)
    const fileAction = ref('')
    const uploadedName = ref('')
    const previewLabel = ref('')
    const scrollTop = ref(0)
    const viewport = ref(0)
    const measureTick = ref(0)
    const contentRef = ref<HTMLElement | null>(null)
    const measure = createFileManagerMeasure(FILE_MANAGER_LIST_ROW_HEIGHT)
    let followBottom = false
    const live = manageLiveRegion('polite')
    onBeforeUnmount(() => live.destroy())
    watch(
      contentRef,
      (el, _previous, onCleanup) => {
        if (!el) return
        const read = () => {
          viewport.value = el.clientHeight
        }
        read()
        if (typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(read)
        observer.observe(el)
        onCleanup(() => observer.disconnect())
      },
      { immediate: true, flush: 'post' }
    )
    const innerSelectedKeys = ref<(string | number)[]>([...(props.defaultSelectedKeys ?? [])])
    const innerPath = ref<(string | number)[]>([...(props.defaultCurrentPath ?? EMPTY_FILE_PATH)])
    const innerSearch = ref(props.defaultSearchText ?? '')
    const isKeysControlled = computed(() => props.selectedKeys !== undefined)
    const isPathControlled = computed(() => props.currentPath !== undefined)
    const isSearchControlled = computed(() => props.searchText !== undefined)
    const resolvedKeys = computed(() =>
      isKeysControlled.value ? (props.selectedKeys ?? []) : innerSelectedKeys.value
    )
    const resolvedPath = computed(() =>
      isPathControlled.value ? (props.currentPath ?? EMPTY_FILE_PATH) : innerPath.value
    )
    const pathKey = computed(() => JSON.stringify(resolvedPath.value))
    const resolvedSearch = computed(() =>
      isSearchControlled.value ? (props.searchText ?? '') : innerSearch.value
    )
    const tree = computed(() => props.files ?? EMPTY_FILE_ITEMS)

    const drag = useDrag({
      onDrop: (event) => {
        if (!model.value.canReorder) return
        const fromIndex = model.value.processedItems.findIndex((item) => item.key === event.item.id)
        const toIndex = event.overItem
          ? model.value.processedItems.findIndex((item) => item.key === event.overItem?.id)
          : event.toIndex
        if (fromIndex < 0 || toIndex < 0) return
        const result = applyFileManagerReorder(
          tree.value,
          resolvedPath.value,
          fromIndex,
          toIndex,
          model.value.processedItems
        )
        if (!result) return
        emit('reorder', result.layer, fromIndex, toIndex)
        emit('update:files', result.files)
      }
    })

    const model = computed(() =>
      deriveFileManagerModel({
        files: tree.value,
        currentPath: resolvedPath.value,
        selectedKeys: resolvedKeys.value,
        sortField: props.sortField,
        sortOrder: props.sortOrder,
        showHidden: props.showHidden,
        searchText: resolvedSearch.value,
        draggable: props.draggable
      })
    )

    const viewKey = computed(
      () => `${pathKey.value}\0${resolvedSearch.value}\0${model.value.processedItems.length}`
    )

    watch(
      () => {
        const count = model.value.processedItems.length
        const text = labels.value.resultCountText.replace('{count}', String(count))
        return props.loading
          ? `${mergedLocale.value?.common?.loadingText ?? ''} ${text}`.trim()
          : text
      },
      (message) => live.announce(message),
      { immediate: true }
    )

    watch(pathKey, () => drag.endDrag(true))
    watch(viewKey, () => {
      followBottom = false
      focusedIndex.value = 0
    })
    watch(
      [() => props.viewMode, () => props.gridColumns, () => props.sortField, () => props.sortOrder],
      () => {
        followBottom = false
      }
    )

    const containerClasses = computed(() =>
      classNames(getFileManagerContainerClasses(props.className), coerceClassValue(attrs.class))
    )
    const containerStyle = computed(() => {
      const incoming = attrs.style as { height?: unknown } | undefined
      const className = String(props.className ?? '')
      const explicit = incoming?.height != null || /\b(?:h|min-h|max-h)-/.test(className)
      return mergeStyleValues(
        explicit ? undefined : { height: FILE_MANAGER_DEFAULT_HEIGHT },
        attrs.style
      )
    })

    function commitPath(next: (string | number)[]) {
      if (!isPathControlled.value) innerPath.value = next
      emit('update:currentPath', next)
      emit('navigate', next)
    }

    function writeSelection(item: FileItem, mode: 'select' | 'toggle') {
      if (props.loading || item.disabled) return
      emit('select', item)
      const keys =
        mode === 'toggle'
          ? toggleFileSelection(resolvedKeys.value, item.key, props.multiple)
          : selectFileItem(resolvedKeys.value, item.key, props.multiple)
      if (!isKeysControlled.value) innerSelectedKeys.value = keys
      emit('update:selectedKeys', keys)
    }

    function handleSelect(item: FileItem) {
      writeSelection(item, 'select')
    }

    function handleOpen(item: FileItem) {
      if (props.loading) return
      const result = resolveFileOpen(item, resolvedPath.value)
      if (!result) return
      if (result.type === 'navigate') {
        commitPath(result.path!)
      } else {
        emit('open', result.item)
      }
    }

    function focusItemAt(index: number, followEnd = false) {
      followBottom = followEnd
      const host = contentRef.value
      if (host && model.value.processedItems.length >= FILE_MANAGER_VIRTUAL_MIN_COUNT) {
        const columns = Math.max(1, Math.floor(props.gridColumns) || DEFAULT_FILE_GRID_COLUMNS)
        const row = props.viewMode === 'grid' ? Math.floor(index / columns) : index
        const offset =
          props.viewMode === 'grid'
            ? measure.strategy.getItemOffset(row)
            : index * FILE_MANAGER_LIST_ROW_HEIGHT
        const size =
          props.viewMode === 'grid'
            ? measure.strategy.getItemHeight(row)
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
          scrollTop.value = next
        }
      }
      nextTick(() => {
        contentRef.value?.querySelector<HTMLElement>(`[data-option-index="${index}"]`)?.focus()
      })
    }

    function handleItemKeydown(event: KeyboardEvent, item: FileItem, index: number) {
      if (props.loading) return
      const action = resolveFileManagerItemKeydown({
        key: event.key,
        altKey: event.altKey,
        viewMode: props.viewMode,
        gridColumns: props.gridColumns,
        isRtl: isRtl.value,
        currentIndex: index,
        items: model.value.processedItems,
        currentPath: resolvedPath.value
      })
      if (!action) return
      event.preventDefault()
      if (action.type === 'move' || action.type === 'home' || action.type === 'end') {
        focusedIndex.value = action.index
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
    }

    function measureGridRows() {
      const host = contentRef.value
      if (
        !host ||
        props.viewMode !== 'grid' ||
        model.value.processedItems.length < FILE_MANAGER_VIRTUAL_MIN_COUNT
      ) {
        return
      }
      const columns = Math.max(1, Math.floor(props.gridColumns) || DEFAULT_FILE_GRID_COLUMNS)
      if (followBottom) {
        const next = Math.max(0, host.scrollHeight - host.clientHeight)
        if (next !== host.scrollTop) {
          host.scrollTop = next
          scrollTop.value = next
        }
      }
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
        const prev = measure.strategy.getItemHeight(row)
        if (next > 0 && Math.abs(next - prev) > 1) {
          measure.measure(row, next)
          changed = true
        }
      })
      if (changed) measureTick.value += 1
    }

    onUpdated(measureGridRows)

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )
      const breadcrumbs = buildFileBreadcrumb(tree.value, resolvedPath.value, labels.value.rootText)
      const focusedItem = clampFileManagerFocusIndex(focusedIndex.value, model.value.processedItems)
      const breadcrumb = h(
        'nav',
        { class: fileManagerBreadcrumbClasses, 'aria-label': labels.value.pathAriaLabel },
        h(
          'ol',
          { class: fileManagerBreadcrumbListClasses },
          breadcrumbs.map((segment, index) =>
            h('li', { key: segment.key || 'root', class: 'flex items-center gap-1' }, [
              index > 0
                ? h(
                    'span',
                    { class: fileManagerBreadcrumbSeparatorClasses, 'aria-hidden': 'true' },
                    FILE_BREADCRUMB_SEPARATOR
                  )
                : null,
              segment.current
                ? h(
                    'span',
                    { class: fileManagerBreadcrumbCurrentClasses, 'aria-current': 'page' },
                    segment.name
                  )
                : h(
                    'button',
                    {
                      type: 'button',
                      class: fileManagerBreadcrumbItemClasses,
                      onClick: () => commitPath(segment.path)
                    },
                    segment.name
                  )
            ])
          )
        )
      )

      const searchInput = props.searchable
        ? h('input', {
            type: 'text',
            class: fileManagerSearchClasses,
            placeholder: mergedLocale.value?.common?.searchPlaceholder,
            'aria-label': labels.value.searchAriaLabel,
            value: resolvedSearch.value,
            onInput: (event: Event) => {
              const value = (event.target as HTMLInputElement).value
              if (!isSearchControlled.value) innerSearch.value = value
              emit('update:searchText', value)
            }
          })
        : null

      const toolbar = h('div', { class: fileManagerToolbarClasses }, [
        breadcrumb,
        h('div', { class: 'flex-1' }),
        searchInput
      ])

      const fileIcon = (item: FileItem) =>
        slots.icon
          ? slots.icon({ item })
          : h(
              'span',
              { class: fileManagerItemIconClasses, 'aria-hidden': 'true' },
              resolveFileItemIcon(item)
            )

      const renderItem = (item: FileItem, index: number) => {
        const isSelected = model.value.selectedSet.has(item.key)
        const itemClass = getFileItemClasses(props.viewMode, isSelected, Boolean(item.disabled))
        const canDrag = model.value.canReorder && !item.disabled
        const dragProps = canDrag ? drag.getDragItemAttrs(toFileDragItem(item, index)) : null
        const metaColumns = props.columns ?? DEFAULT_FILE_COLUMNS
        const nameEl = h(
          'span',
          { class: fileManagerItemNameClasses },
          sanitizeFileDisplayName(item.name)
        )
        const metaEls =
          props.viewMode === 'list'
            ? [
                metaColumns.includes('type')
                  ? h(
                      'span',
                      { class: fileManagerItemMetaClasses },
                      resolveFileItemExtension(item) || item.type
                    )
                  : null,
                metaColumns.includes('size') && item.size !== undefined
                  ? h('span', { class: fileManagerItemMetaClasses }, formatFileSizeLabel(item.size))
                  : null,
                metaColumns.includes('modified') && item.modified
                  ? h('span', { class: fileManagerItemMetaClasses }, item.modified)
                  : null
              ]
            : []

        return h(
          'div',
          {
            key: item.key,
            role: 'option',
            'aria-selected': isSelected,
            'aria-disabled': item.disabled || undefined,
            tabindex: !props.loading && !item.disabled && index === focusedItem ? 0 : -1,
            'data-option-index': index,
            'data-disabled': item.disabled || undefined,
            onFocus: () => {
              if (!item.disabled) focusedIndex.value = index
            },
            class: classNames(itemClass, dragProps?.class as string | undefined),
            style: dragProps?.style,
            onKeydown: (event: KeyboardEvent) => {
              const onKey = dragProps?.onKeydown as ((event: KeyboardEvent) => void) | undefined
              onKey?.(event)
              if (event.defaultPrevented) return
              handleItemKeydown(event, item, index)
            },
            onClick: () => handleSelect(item),
            onDblclick: () => handleOpen(item),
            'data-drag-id': dragProps?.['data-drag-id'],
            'data-drag-id-type': dragProps?.['data-drag-id-type'],
            'data-drag-index': dragProps?.['data-drag-index'],
            'data-drag-container': dragProps?.['data-drag-container'],
            onPointerdown: dragProps?.onPointerdown as ((event: PointerEvent) => void) | undefined
          },
          [fileIcon(item), nameEl, ...metaEls]
        )
      }

      const countText = labels.value.resultCountText.replace(
        '{count}',
        String(model.value.processedItems.length)
      )
      const fileWindow =
        props.viewMode === 'grid'
          ? measure.windowFor(
              model.value.processedItems.map((item) => item.key),
              scrollTop.value,
              viewport.value,
              props.gridColumns
            )
          : getFileManagerWindow(
              model.value.processedItems.length,
              scrollTop.value,
              viewport.value,
              FILE_MANAGER_LIST_ROW_HEIGHT
            )
      const visible = fileWindow.virtual
        ? model.value.processedItems.slice(fileWindow.start, fileWindow.end)
        : model.value.processedItems
      const rows = visible.map((item) => renderItem(item, model.value.processedItems.indexOf(item)))
      const content =
        model.value.processedItems.length > 0
          ? h(
              'div',
              {
                ref: contentRef,
                class: fileWindow.virtual
                  ? fileManagerContentClasses
                  : getFileManagerContentClasses(props.viewMode),
                style: fileWindow.virtual
                  ? undefined
                  : getFileManagerGridStyle(props.viewMode, props.gridColumns),
                role: 'listbox',
                'aria-label': `${labels.value.listboxAriaLabel}, ${countText}`,
                'aria-multiselectable': props.multiple || undefined,
                'aria-disabled': props.loading || undefined,
                onScroll: (event: Event) => {
                  const host = event.currentTarget as HTMLElement
                  followBottom = host.scrollTop + host.clientHeight >= host.scrollHeight - 1
                  scrollTop.value = host.scrollTop
                }
              },
              fileWindow.virtual
                ? h(
                    'div',
                    {
                      style: { height: `${fileWindow.totalHeight}px`, position: 'relative' }
                    },
                    [
                      h(
                        'div',
                        {
                          class: props.viewMode === 'grid' ? 'grid gap-2' : undefined,
                          style: {
                            ...getFileManagerGridStyle(props.viewMode, props.gridColumns),
                            transform: `translateY(${fileWindow.offsetTop}px)`
                          }
                        },
                        rows
                      )
                    ]
                  )
                : rows
            )
          : h('div', { class: fileManagerEmptyClasses }, [
              h(
                'span',
                {},
                props.emptyText ??
                  (mergedLocale.value?.fileManager?.emptyText &&
                  mergedLocale.value.fileManager.emptyText !== 'Empty folder'
                    ? mergedLocale.value.fileManager.emptyText
                    : undefined) ??
                  (mergedLocale.value?.common?.emptyText &&
                  mergedLocale.value.common.emptyText !== 'No data'
                    ? mergedLocale.value.common.emptyText
                    : undefined) ??
                  labels.value.emptyText
              ),
              h('span', { class: 'ms-2' }, countText)
            ])

      const loadingEl = props.loading
        ? h('div', { class: fileManagerLoadingClasses }, [
            h('span', {}, mergedLocale.value?.common?.loadingText),
            h('span', { class: 'ms-2' }, countText)
          ])
        : null
      void measureTick.value

      return h(
        'div',
        {
          ...forwardedAttrs,
          class: containerClasses.value,
          style: containerStyle.value,
          'aria-busy': props.loading || undefined
        },
        [
          props.bind
            ? h('div', { 'data-tiger-file-bind': '' }, [
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-file-open': '',
                    disabled: !canEmitFileOpen(props.bind.permission),
                    onClick: () => {
                      if (canEmitFileOpen(props.bind?.permission)) emit('open', props.bind?.name)
                    }
                  },
                  getW9DataLabels().preview
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-file-rename': '',
                    disabled: !canEmitFileRename(props.bind.permission),
                    onClick: () => {
                      if (!canEmitFileRename(props.bind?.permission)) return
                      fileAction.value = sanitizeFileDisplayName(props.bind?.name ?? '')
                    }
                  },
                  getW9DataLabels().rename
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-file-delete': '',
                    disabled: !canEmitFileDelete(props.bind.permission),
                    onClick: () => {
                      if (canEmitFileDelete(props.bind?.permission)) {
                        fileAction.value = `delete:${sanitizeFileDisplayName(props.bind?.name ?? '')}`
                      }
                    }
                  },
                  getW9DataLabels().delete
                ),
                h('input', {
                  type: 'file',
                  'data-tiger-file-upload': '',
                  'aria-label': getW9DataLabels().upload,
                  onChange: (event: Event) => {
                    const file = (event.target as HTMLInputElement).files?.[0]
                    if (!file) return
                    const uploaded = fileToUploadFile(file)
                    uploadedName.value = uploaded.name
                    previewLabel.value =
                      filterUploadPreviewUrl(uploaded.url) ??
                      (isImageUploadFile(uploaded) ? uploaded.name : '')
                  }
                }),
                h('span', { 'data-file-upload': '' }, uploadedName.value),
                h('span', { 'data-file-preview': '' }, previewLabel.value),
                ...searchFileTree(
                  props.files ?? [],
                  props.bind.query ?? '',
                  props.bind.recursive === true
                ).map((hit) =>
                  h('span', { key: hit.path.join('/'), 'data-file-hit': hit.item.name })
                ),
                h('span', { 'data-file-action': '' }, fileAction.value)
              ])
            : null,
          toolbar,
          content,
          loadingEl
        ]
      )
    }
  }
})

export default FileManager
