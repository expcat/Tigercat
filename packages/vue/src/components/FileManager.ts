import { defineComponent, h, ref, computed, nextTick, watch, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
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
  type FileViewMode,
  type FileSortField,
  type FileSortOrder,
  type FileColumn,
  type TigerLocale,
  type FileManagerProps as CoreFileManagerProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
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
    const contentRef = ref<HTMLElement | null>(null)
    const innerSelectedKeys = ref<(string | number)[]>([...(props.defaultSelectedKeys ?? [])])
    const innerPath = ref<string[]>([...(props.defaultCurrentPath ?? EMPTY_FILE_PATH)])
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
    const resolvedSearch = computed(() =>
      isSearchControlled.value ? (props.searchText ?? '') : innerSearch.value
    )
    const tree = computed(() => props.files ?? EMPTY_FILE_ITEMS)

    const drag = useDrag({
      containerId: 'files',
      onDrop: (event) => {
        if (!model.value.canReorder) return
        const result = applyFileManagerReorder(
          tree.value,
          resolvedPath.value,
          event.fromIndex,
          event.toIndex,
          model.value.currentItems
        )
        if (!result) return
        emit('reorder', result.layer, event.fromIndex, event.toIndex)
        emit('update:files', result.files)
      }
    })

    function handleDragStart(event: DragEvent, item: FileItem, index: number) {
      if (!model.value.canReorder || item.disabled) return
      drag.startDrag(toFileDragItem(item, index, 'files'), event)
    }

    function handleDragOver(event: DragEvent, item: FileItem, index: number) {
      if (!model.value.canReorder || item.disabled) return
      drag.dragOver(toFileDragItem(item, index, 'files'), event)
    }

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
      () =>
        `${resolvedPath.value.join('/')}\0${resolvedSearch.value}\0${model.value.processedItems.length}`
    )

    watch(viewKey, () => {
      focusedIndex.value = 0
    })

    const containerClasses = computed(() =>
      classNames(getFileManagerContainerClasses(props.className), coerceClassValue(attrs.class))
    )
    const containerStyle = computed(() => mergeStyleValues(attrs.style))

    function commitPath(next: string[]) {
      if (!isPathControlled.value) innerPath.value = next
      emit('update:currentPath', next)
      emit('navigate', next)
    }

    function handleSelect(item: FileItem) {
      if (props.loading || item.disabled) return
      emit('select', item)
      const keys = toggleFileSelection(resolvedKeys.value, item.key, props.multiple)
      if (!isKeysControlled.value) innerSelectedKeys.value = keys
      emit('update:selectedKeys', keys)
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

    function focusItemAt(index: number) {
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
    }

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
                    '/'
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
        const metaColumns = props.columns ?? DEFAULT_FILE_COLUMNS
        const nameEl = h('span', { class: fileManagerItemNameClasses }, item.name)
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
            class: itemClass,
            role: 'option',
            'aria-selected': isSelected,
            'aria-disabled': item.disabled || undefined,
            tabindex: !props.loading && !item.disabled && index === focusedItem ? 0 : -1,
            'data-option-index': index,
            'data-disabled': item.disabled || undefined,
            onFocus: () => {
              if (!item.disabled) focusedIndex.value = index
            },
            onKeydown: (event: KeyboardEvent) => handleItemKeydown(event, item, index),
            onClick: () => handleSelect(item),
            onDblclick: () => handleOpen(item),
            draggable: canDrag,
            'data-drag-id': item.key,
            'data-drag-index': index,
            'data-drag-container': 'files',
            onDragstart: canDrag
              ? (event: DragEvent) => handleDragStart(event, item, index)
              : undefined,
            onDragover: canDrag
              ? (event: DragEvent) => handleDragOver(event, item, index)
              : undefined,
            onDrop: canDrag ? (event: DragEvent) => drag.drop(event) : undefined,
            onDragend: canDrag ? () => drag.endDrag() : undefined
          },
          [fileIcon(item), nameEl, ...metaEls]
        )
      }

      const content =
        model.value.processedItems.length > 0
          ? h(
              'div',
              {
                ref: contentRef,
                class: getFileManagerContentClasses(props.viewMode),
                style: getFileManagerGridStyle(props.viewMode, props.gridColumns),
                role: 'listbox',
                'aria-label': labels.value.listboxAriaLabel,
                'aria-multiselectable': props.multiple || undefined,
                'aria-disabled': props.loading || undefined
              },
              model.value.processedItems.map(renderItem)
            )
          : h('div', { class: fileManagerEmptyClasses }, props.emptyText ?? labels.value.emptyText)

      const loadingEl = props.loading
        ? h(
            'div',
            { class: fileManagerLoadingClasses, role: 'status' },
            mergedLocale.value?.common?.loadingText
          )
        : null

      return h(
        'div',
        {
          ...forwardedAttrs,
          class: containerClasses.value,
          style: containerStyle.value,
          'aria-busy': props.loading || undefined
        },
        [toolbar, content, loadingEl]
      )
    }
  }
})

export default FileManager
