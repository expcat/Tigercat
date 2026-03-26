import { defineComponent, computed, ref, h, PropType, watch, onBeforeUnmount } from 'vue'
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
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  checkSolidIcon20PathD,
  coerceClassValue,
  type CascaderOption,
  type CascaderValue,
  type CascaderSize,
  type CascaderExpandTrigger,
  type CascaderShowSearch
} from '@expcat/tigercat-core'

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
  size?: CascaderSize
  disabled?: boolean
  clearable?: boolean
  showSearch?: boolean | CascaderShowSearch
  expandTrigger?: CascaderExpandTrigger
  changeOnSelect?: boolean
  separator?: string
  notFoundText?: string
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
      type: String as PropType<CascaderSize>,
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
    showSearch: {
      type: [Boolean, Object] as PropType<boolean | CascaderShowSearch>,
      default: false
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
    notFoundText: {
      type: String,
      default: 'No results found'
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const instanceId = ++cascaderInstanceId
    const isOpen = ref(false)
    const searchQuery = ref('')
    const activePath = ref<CascaderValue>([])
    const triggerRef = ref<HTMLElement | null>(null)
    const dropdownRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLElement | null>(null)

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
      return props.showSearch && searchQuery.value.length > 0
    })

    // Flattened options for search
    const flattenedOptions = computed(() => {
      if (!props.showSearch) return []
      return flattenCascaderOptions(props.options)
    })

    // Filtered search results
    const searchResults = computed(() => {
      if (!isSearchMode.value) return []
      return filterCascaderOptions(flattenedOptions.value, searchQuery.value, props.showSearch)
    })

    // Trigger classes
    const triggerClasses = computed(() =>
      classNames(
        getCascaderTriggerClasses(props.size, props.disabled, isOpen.value),
        coerceClassValue(attrs.class)
      )
    )

    // Sync active path with model value when dropdown opens
    watch(isOpen, (open) => {
      if (open) {
        activePath.value = props.modelValue ? [...props.modelValue] : []
        searchQuery.value = ''
      }
    })

    function toggleOpen() {
      if (props.disabled) return
      isOpen.value = !isOpen.value
    }

    function closeDropdown() {
      isOpen.value = false
    }

    function handleOptionClick(option: CascaderOption, level: number) {
      if (option.disabled) return

      // Update active path
      const newPath = activePath.value.slice(0, level)
      newPath.push(option.value)
      activePath.value = newPath

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
      searchQuery.value = (e.target as HTMLInputElement).value
    }

    // Keyboard navigation
    function handleTriggerKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          toggleOpen()
          break
        case 'Escape':
          e.preventDefault()
          closeDropdown()
          break
        case 'ArrowDown':
          e.preventDefault()
          if (!isOpen.value) {
            isOpen.value = true
          }
          break
      }
    }

    // Click outside to close
    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.value &&
        !triggerRef.value.contains(target) &&
        dropdownRef.value &&
        !dropdownRef.value.contains(target)
      ) {
        closeDropdown()
      }
    }

    watch(isOpen, (open) => {
      if (open) {
        document.addEventListener('click', handleDocumentClick, true)
      } else {
        document.removeEventListener('click', handleDocumentClick, true)
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleDocumentClick, true)
    })

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
              'aria-label': 'Clear selection',
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
          role: 'combobox',
          'aria-expanded': isOpen.value,
          'aria-haspopup': 'listbox',
          'aria-controls': isOpen.value ? listboxId : undefined,
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
        if (props.showSearch) {
          children.push(
            h('input', {
              ref: searchInputRef,
              type: 'text',
              class: cascaderSearchInputClasses,
              placeholder: 'Search...',
              value: searchQuery.value,
              onInput: handleSearchInput,
              'aria-label': 'Search options'
            })
          )
        }

        if (isSearchMode.value) {
          // Search results mode
          if (searchResults.value.length === 0) {
            children.push(h('div', { class: cascaderEmptyStateClasses }, props.notFoundText))
          } else {
            const searchList = h(
              'div',
              { class: 'max-h-64 overflow-auto', role: 'listbox', id: listboxId },
              searchResults.value.map((item) =>
                h(
                  'div',
                  {
                    class: classNames(
                      cascaderSearchResultClasses,
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    ),
                    role: 'option',
                    'aria-selected': props.modelValue?.join(',') === item.valuePath.join(','),
                    'aria-disabled': item.disabled,
                    onClick: () => handleSearchResultClick(item.valuePath, item.disabled)
                  },
                  item.label
                )
              )
            )
            children.push(searchList)
          }
        } else {
          // Column mode (cascading panels)
          const columnElements = columns.value.map((col, colIndex) =>
            h(
              'div',
              {
                class: cascaderColumnClasses,
                role: 'listbox',
                id: colIndex === 0 ? listboxId : undefined,
                'aria-label': `Level ${colIndex + 1}`
              },
              col.options.map((option) => {
                const isSelected = col.selectedValue === option.value
                const hasChildren = isCascaderOptionExpandable(option)

                return h(
                  'div',
                  {
                    class: getCascaderOptionClasses(isSelected, !!option.disabled, props.size),
                    role: 'option',
                    'aria-selected': isSelected,
                    'aria-disabled': option.disabled,
                    onClick: () => handleOptionClick(option, colIndex),
                    onMouseenter: () => handleOptionHover(option, colIndex)
                  },
                  [
                    h('span', { class: 'flex-1 truncate' }, option.label),
                    hasChildren ? ChevronRightIcon : null
                  ]
                )
              })
            )
          )

          children.push(h('div', { class: 'flex' }, columnElements))
        }

        dropdownContent = h(
          'div',
          {
            ref: dropdownRef,
            class: classNames(cascaderDropdownClasses, isSearchMode.value && 'flex-col')
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
        [trigger, dropdownContent]
      )
    }
  }
})

export default Cascader
