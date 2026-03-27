import { defineComponent, h, ref, computed, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getFileManagerContainerClasses,
  getFileItemClasses,
  sortFileItems,
  filterFileItems,
  filterHiddenFiles,
  navigateToFolder,
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
    emptyText: { type: String, default: 'Empty folder' },
    searchable: { type: Boolean, default: false },
    searchText: { type: String, default: '' },
    className: { type: String, default: undefined }
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
    const localSearch = ref(props.searchText)

    const currentItems = computed(() => navigateToFolder(props.files, props.currentPath))

    const processedItems = computed(() => {
      let items = filterHiddenFiles(currentItems.value, props.showHidden)
      if (localSearch.value || props.searchText) {
        items = filterFileItems(items, localSearch.value || props.searchText)
      }
      return sortFileItems(items, props.sortField, props.sortOrder)
    })

    const selectedSet = computed(() => new Set(props.selectedKeys))

    const containerClasses = computed(() =>
      classNames(getFileManagerContainerClasses(props.className), coerceClassValue(attrs.class))
    )

    function handleSelect(item: FileItem) {
      if (item.disabled) return
      emit('select', item)
      // Toggle selection
      const keys = [...props.selectedKeys]
      const idx = keys.indexOf(item.key)
      if (idx >= 0) {
        keys.splice(idx, 1)
      } else {
        if (!props.multiple) keys.length = 0
        keys.push(item.key)
      }
      emit('update:selectedKeys', keys)
    }

    function handleOpen(item: FileItem) {
      if (item.disabled) return
      if (item.type === 'folder') {
        const newPath = [...props.currentPath, item.name]
        emit('update:currentPath', newPath)
        emit('navigate', newPath)
      } else {
        emit('open', item)
      }
    }

    function navigateToBreadcrumb(index: number) {
      const newPath = props.currentPath.slice(0, index)
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
          'Root'
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
            placeholder: 'Search...',
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
      const renderItem = (item: FileItem) => {
        const isSelected = selectedSet.value.has(item.key)
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
            draggable: props.draggable && !item.disabled
          },
          [fileIcon(item), nameEl, ...metaEls]
        )
      }

      const contentClass =
        props.viewMode === 'grid'
          ? `${fileManagerContentClasses} grid grid-cols-4 gap-2`
          : fileManagerContentClasses

      const content =
        processedItems.value.length > 0
          ? h(
              'div',
              { class: contentClass, role: 'listbox', 'aria-multiselectable': props.multiple },
              processedItems.value.map(renderItem)
            )
          : h('div', { class: fileManagerEmptyClasses }, props.emptyText)

      const loadingEl = props.loading
        ? h('div', { class: fileManagerLoadingClasses }, 'Loading...')
        : null

      return h('div', { class: containerClasses.value }, [toolbar, content, loadingEl])
    }
  }
})

export default FileManager
