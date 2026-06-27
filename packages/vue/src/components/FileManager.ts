import { defineComponent, h, ref, computed, nextTick, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
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
  type FileViewMode,
  type FileSortField,
  type FileSortOrder,
  type TigerLocale,
  type FileManagerProps as CoreFileManagerProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

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
>

export const FileManager = defineComponent({
  name: 'TigerFileManager',
  inheritAttrs: false,
  props: {
    files: { type: Array as PropType<FileItem[]>, default: () => [] },
    viewMode: {
      type: String as PropType<FileViewMode>,
      default: 'list'
    },
    selectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    multiple: { type: Boolean, default: false },
    columns: {
      type: Array as PropType<FileSortField[]>,
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
      default: () => []
    },
    showHidden: { type: Boolean, default: false },
    draggable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: undefined },
    searchable: { type: Boolean, default: false },
    searchText: { type: String, default: '' },
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
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getFileManagerLabels(mergedLocale.value))
    const localSearch = ref(props.searchText)
    const focusedIndex = ref(0)
    const contentRef = ref<HTMLElement | null>(null)
    let dragFromIndex: number | null = null

    function handleDragStart(event: DragEvent, item: FileItem, index: number) {
      if (!props.draggable || item.disabled) return
      dragFromIndex = index
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', String(toFileDragItem(item, index).id))
      }
    }

    function handleDragOver(event: DragEvent) {
      if (!props.draggable || dragFromIndex === null) return
      event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    }

    function handleDrop(event: DragEvent, toIndex: number) {
      if (!props.draggable) return
      const fromIndex = dragFromIndex
      dragFromIndex = null
      if (fromIndex === null || fromIndex === toIndex) return
      event.preventDefault()
      const items = model.value.processedItems
      const reordered = applyFileDragReorder(items, {
        item: toFileDragItem(items[fromIndex], fromIndex),
        fromIndex,
        toIndex,
        fromContainerId: '',
        toContainerId: ''
      })
      emit('reorder', reordered, fromIndex, toIndex)
      emit('update:files', reordered)
    }

    const model = computed(() =>
      deriveFileManagerModel({
        files: props.files,
        currentPath: props.currentPath,
        selectedKeys: props.selectedKeys,
        sortField: props.sortField,
        sortOrder: props.sortOrder,
        showHidden: props.showHidden,
        searchText: localSearch.value || props.searchText
      })
    )

    const containerClasses = computed(() =>
      classNames(getFileManagerContainerClasses(props.className), coerceClassValue(attrs.class))
    )

    function handleSelect(item: FileItem) {
      if (item.disabled) return
      emit('select', item)
      const keys = toggleFileSelection(props.selectedKeys, item.key, props.multiple)
      emit('update:selectedKeys', keys)
    }

    function handleOpen(item: FileItem) {
      const result = resolveFileOpen(item, props.currentPath)
      if (!result) return
      if (result.type === 'navigate') {
        emit('update:currentPath', result.path)
        emit('navigate', result.path)
      } else {
        emit('open', result.item)
      }
    }

    function navigateToBreadcrumb(index: number) {
      const newPath = sliceBreadcrumbPath(props.currentPath, index)
      emit('update:currentPath', newPath)
      emit('navigate', newPath)
    }

    function getFirstEnabledIndex() {
      return model.value.processedItems.findIndex((item) => !item.disabled)
    }

    function getLastEnabledIndex() {
      for (let index = model.value.processedItems.length - 1; index >= 0; index -= 1) {
        if (!model.value.processedItems[index]?.disabled) {
          return index
        }
      }
      return -1
    }

    function getFocusedItemIndex() {
      return focusedIndex.value >= 0 && !model.value.processedItems[focusedIndex.value]?.disabled
        ? focusedIndex.value
        : getFirstEnabledIndex()
    }

    function focusItemAt(index: number) {
      nextTick(() => {
        contentRef.value?.querySelector<HTMLElement>(`[data-option-index="${index}"]`)?.focus()
      })
    }

    function moveFocus(current: number, direction: 1 | -1) {
      if (model.value.processedItems.length === 0) return
      let next = current
      for (let i = 0; i < model.value.processedItems.length; i += 1) {
        next =
          (next + direction + model.value.processedItems.length) % model.value.processedItems.length
        if (!model.value.processedItems[next]?.disabled) {
          focusedIndex.value = next
          focusItemAt(next)
          return
        }
      }
    }

    function handleItemKeydown(event: KeyboardEvent, item: FileItem, index: number) {
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
        case 'Home': {
          event.preventDefault()
          const first = getFirstEnabledIndex()
          if (first >= 0) {
            focusedIndex.value = first
            focusItemAt(first)
          }
          return
        }
        case 'End': {
          event.preventDefault()
          const last = getLastEnabledIndex()
          if (last >= 0) {
            focusedIndex.value = last
            focusItemAt(last)
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
    }

    return () => {
      // Breadcrumb
      const breadcrumbItems = [
        h(
          'span',
          {
            class: fileManagerBreadcrumbItemClasses,
            onClick: () => navigateToBreadcrumb(0)
          },
          labels.value.rootText
        ),
        ...props.currentPath.flatMap((seg, i) => [
          h('span', { class: fileManagerBreadcrumbSeparatorClasses }, '/'),
          h(
            'span',
            {
              class: fileManagerBreadcrumbItemClasses,
              onClick: () => navigateToBreadcrumb(i + 1)
            },
            seg
          )
        ])
      ]

      const breadcrumb = h(
        'nav',
        { class: fileManagerBreadcrumbClasses, 'aria-label': 'File path' },
        breadcrumbItems
      )

      // Search
      const searchInput = props.searchable
        ? h('input', {
            type: 'text',
            class: fileManagerSearchClasses,
            placeholder: resolveLocaleText(
              'Search...',
              mergedLocale.value?.common?.searchPlaceholder
            ),
            value: localSearch.value,
            onInput: (e: Event) => {
              const val = (e.target as HTMLInputElement).value
              localSearch.value = val
              emit('update:searchText', val)
            }
          })
        : null

      const toolbar = h('div', { class: fileManagerToolbarClasses }, [
        breadcrumb,
        h('div', { class: 'flex-1' }),
        searchInput
      ])

      // File icon placeholder
      const fileIcon = (item: FileItem) =>
        h(
          'span',
          { class: fileManagerItemIconClasses, 'aria-hidden': 'true' },
          item.type === 'folder' ? '📁' : '📄'
        )

      // File items
      const renderItem = (item: FileItem, index: number) => {
        const isSelected = model.value.selectedSet.has(item.key)
        const itemClass = getFileItemClasses(props.viewMode, isSelected)
        const focusedItem = getFocusedItemIndex()

        const nameEl = h('span', { class: fileManagerItemNameClasses }, item.name)

        const metaColumns = props.columns ?? ['size', 'modified']
        const metaEls =
          props.viewMode === 'list'
            ? [
                metaColumns.includes('type')
                  ? h('span', { class: fileManagerItemMetaClasses }, item.extension ?? item.type)
                  : null,
                metaColumns.includes('size') && item.size !== undefined
                  ? h('span', { class: fileManagerItemMetaClasses }, formatFileSizeLabel(item.size))
                  : null,
                metaColumns.includes('modified') && item.modified
                  ? h('span', { class: fileManagerItemMetaClasses }, item.modified)
                  : null
              ]
            : []

        const dragItem = props.draggable && !item.disabled ? toFileDragItem(item, index) : undefined

        return h(
          'div',
          {
            key: item.key,
            class: itemClass,
            role: 'option',
            'aria-selected': isSelected,
            tabindex: !item.disabled && index === focusedItem ? 0 : -1,
            'data-option-index': index,
            'data-disabled': item.disabled || undefined,
            onFocus: () => {
              if (!item.disabled) focusedIndex.value = index
            },
            onKeydown: (event: KeyboardEvent) => handleItemKeydown(event, item, index),
            onClick: () => handleSelect(item),
            onDblclick: () => handleOpen(item),
            draggable: props.draggable && !item.disabled,
            'data-drag-id': dragItem?.id,
            onDragstart: (event: DragEvent) => handleDragStart(event, item, index),
            onDragover: handleDragOver,
            onDrop: (event: DragEvent) => handleDrop(event, index)
          },
          [fileIcon(item), nameEl, ...metaEls]
        )
      }

      const contentClass =
        props.viewMode === 'grid'
          ? `${fileManagerContentClasses} grid grid-cols-4 gap-2`
          : fileManagerContentClasses

      const content =
        model.value.processedItems.length > 0
          ? h(
              'div',
              {
                ref: contentRef,
                class: contentClass,
                role: 'listbox',
                'aria-multiselectable': props.multiple
              },
              model.value.processedItems.map(renderItem)
            )
          : h(
              'div',
              { class: fileManagerEmptyClasses },
              resolveLocaleText(
                'Empty folder',
                props.emptyText,
                mergedLocale.value?.common?.emptyText
              )
            )

      const loadingEl = props.loading
        ? h(
            'div',
            { class: fileManagerLoadingClasses },
            resolveLocaleText('Loading...', mergedLocale.value?.common?.loadingText)
          )
        : null

      return h('div', { class: containerClasses.value }, [toolbar, content, loadingEl])
    }
  }
})

export default FileManager
