import { defineComponent, computed, ref, h, PropType, watch, nextTick, type VNodeRef } from 'vue'
import {
  classNames,
  cascaderBaseClasses,
  cascaderDropdownClasses,
  cascaderColumnClasses,
  cascaderSearchInputClasses,
  cascaderEmptyStateClasses,
  cascaderSearchResultClasses,
  getCascaderTriggerClasses,
  getCascaderOptionClasses,
  getCascaderColumns,
  getCascaderDisplayLabel,
  flattenCascaderOptions,
  filterCascaderOptions,
  isCascaderOptionExpandable,
  getCascaderVirtualItemHeight,
  getCascaderVirtualRange,
  getCascaderVirtualAlignScrollTop,
  CASCADER_DEFAULT_LIST_HEIGHT,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionAria,
  getPickerTriggerKeyAction,
  getPickerNavigationIndex,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  coerceClassValue,
  type CascaderOption,
  type CascaderValue,
  type ComponentSize,
  type CascaderExpandTrigger,
  type CascaderSearchConfig,
  type CascaderFlattenedOption,
  resolveLocaleText,
  mergeTigerLocale,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { renderVueOverlayTeleport, useVueAnchoredOverlay } from '../utils/overlay'

let cascaderInstanceId = 0

// Chevron right icon (column expand)
const ChevronRightIcon = h(
  'svg',
  {
    class: 'w-4 h-4 text-[var(--tiger-text-muted,#9ca3af)]',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 20 20',
    fill: 'currentColor'
  },
  [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z',
      'clip-rule': 'evenodd'
    })
  ]
)

export interface VueCascaderProps {
  modelValue?: CascaderValue
  options?: CascaderOption[]
  placeholder?: string
  size?: ComponentSize
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean | CascaderSearchConfig
  searchValue?: string
  defaultSearchValue?: string
  expandTrigger?: CascaderExpandTrigger
  changeOnSelect?: boolean
  separator?: string
  emptyText?: string
  virtual?: boolean
  listHeight?: number
  locale?: Partial<TigerLocale>
}

export const Cascader = defineComponent({
  name: 'TigerCascader',
  props: {
    modelValue: {
      type: Array as PropType<CascaderValue>,
      default: () => []
    },
    options: {
      type: Array as PropType<CascaderOption[]>,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Please select'
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    searchable: {
      type: [Boolean, Object] as PropType<boolean | CascaderSearchConfig>,
      default: false
    },
    searchValue: {
      type: String,
      default: undefined
    },
    defaultSearchValue: {
      type: String,
      default: ''
    },
    expandTrigger: {
      type: String as PropType<CascaderExpandTrigger>,
      default: 'click'
    },
    changeOnSelect: {
      type: Boolean,
      default: false
    },
    separator: {
      type: String,
      default: ' / '
    },
    emptyText: {
      type: String,
      default: undefined
    },
    /**
     * Whether to use virtual scrolling for column and search lists
     */
    virtual: {
      type: Boolean,
      default: false
    },
    /**
     * Height of each column panel (and searchable list) in pixels
     * @default 256
     */
    listHeight: {
      type: Number,
      default: CASCADER_DEFAULT_LIST_HEIGHT
    },
    /**
     * Locale overrides merged on top of ConfigProvider locale
     */
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'update:searchValue', 'change', 'search-change'],
  setup(props, { emit, attrs }) {
    const instanceId = ++cascaderInstanceId
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const isOpen = ref(false)
    const uncontrolledSearchValue = ref(props.defaultSearchValue)
    const searchQuery = computed(() => props.searchValue ?? uncontrolledSearchValue.value)
    const activePath = ref<CascaderValue>([])
    const triggerRef = ref<HTMLElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLElement | null>(null)
    const overlay = useVueAnchoredOverlay({
      enabled: isOpen,
      referenceRef: triggerRef,
      floatingRef: dropdownRef,
      placement: 'bottom-start',
      offset: 4,
      layout: 'fullscreen-sm',
      matchReferenceWidth: true,
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      onDismiss: closeDropdown
    })
    // Virtual scrolling (column panels + searchable flat list)
    const columnScrollTops = ref<number[]>([])
    const columnScrollEls = ref<(HTMLElement | null)[]>([])
    const columnActiveIndices = ref<number[]>([])
    const searchScrollTop = ref(0)
    const searchScrollEl = ref<HTMLElement | null>(null)
    const searchActiveIndex = ref(-1)

    // Display label based on current value
    const displayLabel = computed(() => {
      if (!props.modelValue || props.modelValue.length === 0) return ''
      return getCascaderDisplayLabel(props.options, props.modelValue, props.separator)
    })

    // Columns to render in dropdown
    const columns = computed(() => {
      return getCascaderColumns(props.options, activePath.value)
    })

    // Search mode active
    const isSearchMode = computed(() => {
      return props.searchable && searchQuery.value.length > 0
    })

    // Flattened options for search
    const flattenedOptions = computed(() => {
      if (!props.searchable) return []
      return flattenCascaderOptions(props.options, [], [], props.changeOnSelect)
    })

    // Filtered search results
    const searchResults = computed(() => {
      if (!isSearchMode.value) return []
      return filterCascaderOptions(flattenedOptions.value, searchQuery.value, props.searchable)
    })

    // Trigger classes
    const triggerClasses = computed(() =>
      classNames(
        getCascaderTriggerClasses(props.size, props.disabled, isOpen.value),
        coerceClassValue(attrs.class)
      )
    )

    function selectedIndexInColumn(
      options: CascaderOption[],
      selectedValue: string | number | undefined
    ): number {
      if (selectedValue === undefined) return -1
      return options.findIndex((option) => option.value === selectedValue)
    }

    function alignVirtualScroll(
      el: HTMLElement | null,
      index: number,
      setScrollTop: (top: number) => void
    ) {
      if (!props.virtual || !el || index < 0) return
      const itemH = getCascaderVirtualItemHeight(props.size)
      const next = getCascaderVirtualAlignScrollTop(el.scrollTop, index, itemH, props.listHeight)
      if (el.scrollTop !== next) el.scrollTop = next
      setScrollTop(next)
    }

    // Sync active path with model value when dropdown opens
    watch(isOpen, (open) => {
      if (open) {
        columnScrollTops.value = []
        columnScrollEls.value = []
        columnActiveIndices.value = []
        searchScrollTop.value = 0
        searchActiveIndex.value = -1
        activePath.value = props.modelValue ? [...props.modelValue] : []
        updateSearchValue('')
      }
    })

    watch(
      columns,
      (cols) => {
        if (!props.virtual || !isOpen.value) return
        const itemH = getCascaderVirtualItemHeight(props.size)
        columnActiveIndices.value = cols.map((col, i) => {
          const prev = columnActiveIndices.value[i]
          if (prev !== undefined && prev >= 0 && prev < col.options.length) return prev
          return selectedIndexInColumn(col.options, col.selectedValue)
        })
        columnScrollTops.value = cols.map((col, i) => {
          const stored = columnScrollTops.value[i]
          if (stored !== undefined) return stored
          return getCascaderVirtualAlignScrollTop(
            0,
            columnActiveIndices.value[i] ?? -1,
            itemH,
            props.listHeight
          )
        })
      },
      { immediate: true }
    )

    // Keep the active option within the virtual scroll window (mirrors Select).
    watch(
      columnActiveIndices,
      (indices) => {
        if (!props.virtual) return
        nextTick(() => {
          indices.forEach((idx, colIndex) => {
            alignVirtualScroll(columnScrollEls.value[colIndex] ?? null, idx, (top) => {
              columnScrollTops.value[colIndex] = top
            })
          })
        })
      },
      { deep: true }
    )

    watch(searchActiveIndex, (idx) => {
      if (!props.virtual) return
      nextTick(() => {
        alignVirtualScroll(searchScrollEl.value, idx, (top) => {
          searchScrollTop.value = top
        })
      })
    })

    watch(searchQuery, () => {
      searchScrollTop.value = 0
      searchActiveIndex.value = -1
    })

    function updateSearchValue(value: string) {
      if (props.searchValue === undefined) {
        uncontrolledSearchValue.value = value
      }
      emit('update:searchValue', value)
      emit('search-change', value)
    }

    function toggleOpen() {
      if (props.disabled) return
      isOpen.value = !isOpen.value
    }

    function closeDropdown() {
      isOpen.value = false
    }

    function setColumnActiveIndex(colIndex: number, index: number) {
      const next = columnActiveIndices.value.slice()
      next[colIndex] = index
      columnActiveIndices.value = next
    }

    function handleOptionClick(option: CascaderOption, level: number) {
      if (option.disabled) return

      const optionIndex = columns.value[level]?.options.findIndex(
        (item) => item.value === option.value
      )
      // Update active path
      const newPath = activePath.value.slice(0, level)
      newPath.push(option.value)
      activePath.value = newPath
      if (optionIndex !== undefined && optionIndex >= 0) {
        setColumnActiveIndex(level, optionIndex)
      }

      const hasChildren = isCascaderOptionExpandable(option)

      if (!hasChildren) {
        // Leaf node selected — commit value
        emit('update:modelValue', newPath)
        emit('change', newPath)
        closeDropdown()
      } else if (props.changeOnSelect) {
        // changeOnSelect: commit value at each level
        emit('update:modelValue', newPath)
        emit('change', newPath)
      }
    }

    function handleOptionHover(option: CascaderOption, level: number) {
      const optionIndex = columns.value[level]?.options.findIndex(
        (item) => item.value === option.value
      )
      if (optionIndex !== undefined && optionIndex >= 0 && !option.disabled) {
        setColumnActiveIndex(level, optionIndex)
      }
      if (props.expandTrigger !== 'hover' || option.disabled) return

      const newPath = activePath.value.slice(0, level)
      newPath.push(option.value)
      activePath.value = newPath
    }

    function handleSearchResultClick(valuePath: CascaderValue, disabled: boolean) {
      if (disabled) return
      emit('update:modelValue', valuePath)
      emit('change', valuePath)
      closeDropdown()
    }

    function handleClear(e: Event) {
      e.stopPropagation()
      emit('update:modelValue', [])
      emit('change', [])
    }

    function handleSearchInput(e: Event) {
      updateSearchValue((e.target as HTMLInputElement).value)
    }

    function handleVirtualListKeyDown<T extends { disabled?: boolean }>(
      e: KeyboardEvent,
      items: T[],
      current: number,
      setIndex: (index: number) => void
    ) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      setIndex(getPickerNavigationIndex(items, current, e.key))
    }

    function renderVirtualWindow(
      itemCount: number,
      scrollTop: number,
      onScrollTop: (top: number) => void,
      setScrollEl: (el: HTMLElement | null) => void,
      renderItem: (index: number) => ReturnType<typeof h> | null,
      extraAttrs: Record<string, unknown>,
      onKeyDown?: (e: KeyboardEvent) => void
    ) {
      const itemH = getCascaderVirtualItemHeight(props.size)
      const { startIndex, endIndex, totalHeight } = getCascaderVirtualRange(
        scrollTop,
        props.listHeight,
        itemCount,
        itemH
      )
      const fromIndex = itemCount <= 0 ? 0 : Math.min(startIndex, endIndex, itemCount - 1)
      const toIndex = itemCount <= 0 ? -1 : Math.min(endIndex, itemCount - 1)
      const visible: ReturnType<typeof h>[] = []
      if (fromIndex <= toIndex) {
        for (let i = fromIndex; i <= toIndex; i++) {
          const node = renderItem(i)
          if (node) visible.push(node)
        }
      }
      return h(
        'div',
        {
          ...extraAttrs,
          ref: ((el: Element | null) => {
            setScrollEl(el as HTMLElement | null)
          }) as VNodeRef,
          'data-tiger-cascader-virtual': '',
          tabindex: 0,
          style: { maxHeight: `${props.listHeight}px`, overflowY: 'auto' },
          onScroll: (e: Event) => {
            onScrollTop((e.target as HTMLElement).scrollTop)
          },
          onKeydown: onKeyDown
        },
        [
          h('div', { style: { height: `${totalHeight}px`, position: 'relative' } }, [
            h('div', { style: { transform: `translateY(${fromIndex * itemH}px)` } }, visible)
          ])
        ]
      )
    }

    // Keyboard navigation
    function handleTriggerKeyDown(e: KeyboardEvent) {
      const action = getPickerTriggerKeyAction(e.key, isOpen.value)
      if (action === 'none') return

      e.preventDefault()
      if (action === 'toggle') {
        toggleOpen()
      } else if (action === 'open') {
        isOpen.value = true
      } else if (action === 'close') {
        closeDropdown()
      }
    }

    return () => {
      const hasValue = props.modelValue && props.modelValue.length > 0
      const showClear = props.clearable && hasValue && !props.disabled
      const listboxId = `tiger-cascader-listbox-${instanceId}`

      // Build chevron down icon
      const chevronIcon = h(
        'svg',
        {
          class: classNames(
            'w-5 h-5 text-[var(--tiger-cascader-icon,var(--tiger-text-muted,#9ca3af))] transition-transform',
            isOpen.value && 'rotate-180'
          ),
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: icon20ViewBox,
          fill: 'currentColor'
        },
        [
          h('path', {
            'fill-rule': 'evenodd',
            d: chevronDownSolidIcon20PathD,
            'clip-rule': 'evenodd'
          })
        ]
      )

      // Build clear icon
      const clearIcon = showClear
        ? h(
            'span',
            {
              class: 'flex items-center',
              role: 'button',
              'aria-label': resolveLocaleText(
                'Clear selection',
                mergedLocale.value?.common?.clearText
              ),
              onClick: handleClear
            },
            [
              h(
                'svg',
                {
                  class:
                    'w-4 h-4 text-[var(--tiger-cascader-icon,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-cascader-icon-hover,var(--tiger-text-muted,#6b7280))]',
                  xmlns: 'http://www.w3.org/2000/svg',
                  viewBox: icon20ViewBox,
                  fill: 'currentColor'
                },
                [
                  h('path', {
                    'fill-rule': 'evenodd',
                    d: closeSolidIcon20PathD,
                    'clip-rule': 'evenodd'
                  })
                ]
              )
            ]
          )
        : null

      // Trigger button
      const trigger = h(
        'button',
        {
          ref: triggerRef,
          type: 'button',
          class: triggerClasses.value,
          disabled: props.disabled,
          ...getPickerComboboxAria({ expanded: isOpen.value, listboxId }),
          onClick: toggleOpen,
          onKeydown: handleTriggerKeyDown
        },
        [
          h(
            'span',
            {
              class: classNames(
                'flex-1 text-left truncate',
                !hasValue &&
                  'text-[var(--tiger-cascader-placeholder,var(--tiger-text-muted,#9ca3af))]'
              )
            },
            hasValue ? displayLabel.value : props.placeholder
          ),
          h('span', { class: 'flex items-center gap-1' }, [clearIcon, chevronIcon])
        ]
      )

      // Dropdown content
      let dropdownContent: ReturnType<typeof h> | null = null

      if (isOpen.value) {
        const children: ReturnType<typeof h>[] = []

        // Search input
        if (props.searchable) {
          children.push(
            h('input', {
              ref: searchInputRef,
              type: 'text',
              class: cascaderSearchInputClasses,
              placeholder: resolveLocaleText(
                'Search...',
                mergedLocale.value?.common?.searchPlaceholder
              ),
              value: searchQuery.value,
              onInput: handleSearchInput,
              'aria-label': resolveLocaleText(
                'Search options',
                mergedLocale.value?.common?.searchPlaceholder
              )
            })
          )
        }

        if (isSearchMode.value) {
          // Search results mode
          if (searchResults.value.length === 0) {
            children.push(
              h(
                'div',
                { class: cascaderEmptyStateClasses },
                resolveLocaleText(
                  'No results found',
                  props.emptyText,
                  mergedLocale.value?.common?.emptyText
                )
              )
            )
          } else {
            const renderSearchItem = (item: CascaderFlattenedOption, index: number) =>
              h(
                'div',
                {
                  key: item.valuePath.join(','),
                  'data-option-index': index,
                  class: classNames(
                    cascaderSearchResultClasses,
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  ),
                  ...getPickerOptionAria({
                    selected: props.modelValue?.join(',') === item.valuePath.join(','),
                    disabled: item.disabled
                  }),
                  onMouseenter: () => {
                    if (!item.disabled) searchActiveIndex.value = index
                  },
                  onClick: () => handleSearchResultClick(item.valuePath, item.disabled)
                },
                typeof props.searchable === 'object' && props.searchable.render
                  ? props.searchable.render(searchQuery.value, item.path)
                  : item.label
              )

            const searchList = props.virtual
              ? renderVirtualWindow(
                  searchResults.value.length,
                  searchScrollTop.value,
                  (top) => {
                    searchScrollTop.value = top
                  },
                  (el) => {
                    searchScrollEl.value = el
                  },
                  (index) => renderSearchItem(searchResults.value[index], index),
                  {
                    ...getPickerListboxAria({ id: listboxId })
                  },
                  (e) =>
                    handleVirtualListKeyDown(
                      e,
                      searchResults.value,
                      searchActiveIndex.value,
                      (index) => {
                        searchActiveIndex.value = index
                      }
                    )
                )
              : h(
                  'div',
                  { class: 'max-h-64 overflow-auto', ...getPickerListboxAria({ id: listboxId }) },
                  searchResults.value.map((item, index) => renderSearchItem(item, index))
                )
            children.push(searchList)
          }
        } else {
          // Column mode (cascading panels)
          const renderColumnOption = (
            option: CascaderOption,
            col: (typeof columns.value)[number],
            colIndex: number,
            optionIndex: number
          ) => {
            const isSelected = col.selectedValue === option.value
            const hasChildren = isCascaderOptionExpandable(option)

            return h(
              'div',
              {
                key: option.value,
                'data-option-index': optionIndex,
                class: getCascaderOptionClasses(isSelected, !!option.disabled, props.size),
                ...getPickerOptionAria({ selected: isSelected, disabled: !!option.disabled }),
                onClick: () => handleOptionClick(option, colIndex),
                onMouseenter: () => handleOptionHover(option, colIndex)
              },
              [
                h('span', { class: 'flex-1 truncate' }, option.label),
                hasChildren ? ChevronRightIcon : null
              ]
            )
          }

          const columnElements = columns.value.map((col, colIndex) => {
            const listboxAttrs = getPickerListboxAria({
              id: colIndex === 0 ? listboxId : undefined,
              label: `Level ${colIndex + 1}`
            })

            if (props.virtual) {
              return renderVirtualWindow(
                col.options.length,
                columnScrollTops.value[colIndex] ?? 0,
                (top) => {
                  columnScrollTops.value[colIndex] = top
                },
                (el) => {
                  const next = columnScrollEls.value.slice()
                  next[colIndex] = el
                  columnScrollEls.value = next
                },
                (index) => renderColumnOption(col.options[index], col, colIndex, index),
                {
                  class: cascaderColumnClasses,
                  ...listboxAttrs
                },
                (e) =>
                  handleVirtualListKeyDown(
                    e,
                    col.options,
                    columnActiveIndices.value[colIndex] ?? -1,
                    (index) => setColumnActiveIndex(colIndex, index)
                  )
              )
            }

            return h(
              'div',
              {
                class: cascaderColumnClasses,
                ...listboxAttrs
              },
              col.options.map((option, optionIndex) =>
                renderColumnOption(option, col, colIndex, optionIndex)
              )
            )
          })

          children.push(h('div', { class: 'flex' }, columnElements))
        }

        dropdownContent = h(
          'div',
          {
            ref: dropdownRef,
            class: classNames(
              cascaderDropdownClasses,
              isSearchMode.value && 'flex-col',
              overlay.floatingClasses.value
            ),
            style: overlay.floatingStyles.value,
            'data-positioned': overlay.positioned.value
          },
          children
        )
      }

      return h(
        'div',
        {
          class: cascaderBaseClasses,
          'data-testid': 'cascader'
        },
        [trigger, renderVueOverlayTeleport(dropdownContent, overlay.target.value)]
      )
    }
  }
})

export default Cascader
