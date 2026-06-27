import { defineComponent, h, ref, computed, PropType } from 'vue'
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
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueFileManagerProps {
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
  locale?: Partial<TigerLocale>
}

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
    'update:selectedKeys'
  ],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getFileManagerLabels(mergedLocale.value))
    const localSearch = ref(props.searchText)

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

        const nameEl = h('span', { class: fileManagerItemNameClasses }, item.name)

        const metaEls =
          props.viewMode === 'list'
            ? [
                item.size !== undefined
                  ? h('span', { class: fileManagerItemMetaClasses }, formatFileSizeLabel(item.size))
                  : null,
                item.modified
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
            'data-disabled': item.disabled || undefined,
            onClick: () => handleSelect(item),
            onDblclick: () => handleOpen(item),
            draggable: props.draggable && !item.disabled,
            'data-drag-id': dragItem?.id
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
              { class: contentClass, role: 'listbox', 'aria-multiselectable': props.multiple },
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
