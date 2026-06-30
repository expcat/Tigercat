import { defineComponent, computed, ref, h, PropType, watch, nextTick, onBeforeUnmount } from 'vue'
import {
  classNames,
  getSelectTriggerClasses,
  getSelectOptionClasses,
  selectBaseClasses,
  selectDropdownBaseClasses,
  selectGroupLabelClasses,
  selectSearchInputClasses,
  selectEmptyStateClasses,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  isOptionGroup,
  createSelectSearchDebouncer,
  getCreateSelectOptionLabel,
  flattenSelectOptions,
  resolveCreatableSelectOption,
  resolveSelectFilteredOptions,
  getSelectVirtualItemHeight,
  fixedSizeStrategy,
  getPickerOptionAria,
  findFirstEnabledIndex as pickerFindFirstEnabledIndex,
  findLastEnabledIndex as pickerFindLastEnabledIndex,
  findNextEnabledIndex as pickerFindNextEnabledIndex,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  checkSolidIcon20PathD,
  type SelectOption,
  type SelectOptions,
  type ComponentSize,
  type SelectModelValue,
  type SelectSearchDebouncer,
  resolveLocaleText,
  mergeTigerLocale,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

let selectInstanceId = 0

// Chevron down icon
const ChevronDownIcon = h(
  'svg',
  {
    class:
      'w-5 h-5 text-[var(--tiger-select-icon,var(--tiger-text-muted,#9ca3af))] transition-transform',
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

// Close icon (X)
const CloseIcon = h(
  'svg',
  {
    class:
      'w-4 h-4 text-[var(--tiger-select-icon,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-select-icon-hover,var(--tiger-text-muted,#6b7280))]',
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

// Check icon
const CheckIcon = h(
  'svg',
  {
    class: 'w-5 h-5 text-[var(--tiger-select-check-icon,var(--tiger-primary,#2563eb))]',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: icon20ViewBox,
    fill: 'currentColor'
  },
  [
    h('path', {
      'fill-rule': 'evenodd',
      d: checkSolidIcon20PathD,
      'clip-rule': 'evenodd'
    })
  ]
)

export interface VueSelectProps {
  modelValue?: SelectModelValue
  options?: SelectOptions
  size?: ComponentSize
  disabled?: boolean
  placeholder?: string
  searchable?: boolean
  searchValue?: string
  defaultSearchValue?: string
  multiple?: boolean
  clearable?: boolean
  emptyText?: string
  maxTagCount?: number
  virtual?: boolean
  remote?: boolean
  searchDebounce?: number
  creatable?: boolean
  createOptionText?: string
  listHeight?: number
  locale?: Partial<TigerLocale>
}

export const Select = defineComponent({
  name: 'TigerSelect',
  props: {
    /**
     * Selected value(s) (for v-model)
     */
    modelValue: {
      type: [String, Number, Array] as PropType<SelectModelValue>
    },
    /**
     * Available options or option groups
     * @default []
     */
    options: {
      type: Array as PropType<SelectOptions>,
      default: () => []
    },
    /**
     * Select size
     * @default 'md'
     */
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md' as ComponentSize
    },
    /**
     * Whether the select is disabled
     */
    disabled: Boolean,
    /**
     * Placeholder text
     * @default 'Select an option'
     */
    placeholder: {
      type: String,
      default: 'Select an option'
    },
    /**
     * Enable search functionality
     */
    searchable: Boolean,
    searchValue: {
      type: String,
      default: undefined
    },
    defaultSearchValue: {
      type: String,
      default: ''
    },
    /**
     * Allow multiple selection
     */
    multiple: Boolean,
    /**
     * Show clear button
     * @default true
     */
    clearable: {
      type: Boolean,
      default: true
    },
    /**
     * Text shown when the options list is empty or no search result matches
     */
    emptyText: {
      type: String,
      default: undefined
    },
    /**
     * Maximum number of tags in multi-select display
     * @since 0.5.0
     */
    maxTagCount: {
      type: Number,
      default: undefined
    },
    /**
     * Whether to use virtual scrolling
     * @since 0.5.0
     */
    virtual: Boolean,
    /**
     * Whether search is handled remotely
     */
    remote: Boolean,
    /**
     * Debounce delay for search callbacks in milliseconds
     * @default 0
     */
    searchDebounce: {
      type: Number,
      default: 0
    },
    /**
     * Whether users can create a new option from the search query
     */
    creatable: Boolean,
    /**
     * Prefix text used for the creatable option row
     * @default 'Create'
     */
    createOptionText: {
      type: String,
      default: 'Create'
    },
    /**
     * Height of the dropdown panel in pixels
     * @default 256
     * @since 0.5.0
     */
    listHeight: {
      type: Number,
      default: 256
    },
    /**
     * Locale overrides merged on top of ConfigProvider locale
     */
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'update:searchValue', 'change', 'search-change', 'create'],
  setup(props, { emit }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const instanceId = ++selectInstanceId
    const listboxId = `tiger-select-listbox-${instanceId}`
    const getOptionId = (index: number) => `tiger-select-option-${instanceId}-${index}`

    const isOpen = ref(false)
    const uncontrolledSearchValue = ref(props.defaultSearchValue)
    const searchQuery = computed(() => props.searchValue ?? uncontrolledSearchValue.value)
    const activeIndex = ref(-1)
    const createdOptions = ref<SelectOption[]>([])
    const dropdownRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLInputElement | null>(null)
    // Virtual scrolling (flat options only)
    const virtualScrollTop = ref(0)
    const virtualScrollRef = ref<HTMLElement | null>(null)
    // Keep the active option within the virtual scroll window during keyboard nav.
    watch(activeIndex, (idx) => {
      if (!props.virtual || idx < 0) return
      const el = virtualScrollRef.value
      if (!el) return
      const itemH = getSelectVirtualItemHeight(props.size)
      const top = idx * itemH
      if (top < el.scrollTop) el.scrollTop = top
      else if (top + itemH > el.scrollTop + props.listHeight)
        el.scrollTop = top + itemH - props.listHeight
    })
    let searchDebouncer: SelectSearchDebouncer = createSelectSearchDebouncer({
      delay: props.searchDebounce,
      onSearchChange: (query) => emit('search-change', query)
    })

    function updateSearchValue(query: string) {
      if (props.searchValue === undefined) {
        uncontrolledSearchValue.value = query
      }
      emit('update:searchValue', query)
      searchDebouncer.schedule(query)
    }

    const filteredOptions = computed(() => {
      return resolveSelectFilteredOptions(props.options, searchQuery.value, {
        searchable: props.searchable,
        remote: props.remote
      })
    })

    const allOptions = computed(() => flattenSelectOptions(props.options))
    const flatFilteredOptions = computed(() => flattenSelectOptions(filteredOptions.value))
    const creatableOption = computed(() =>
      resolveCreatableSelectOption([...props.options, ...createdOptions.value], searchQuery.value, {
        creatable: props.creatable && props.searchable
      })
    )
    const flatSelectableOptions = computed(() => {
      return creatableOption.value
        ? [...flatFilteredOptions.value, creatableOption.value]
        : flatFilteredOptions.value
    })

    const displayText = computed(() => {
      if (props.multiple && Array.isArray(props.modelValue)) {
        if (props.modelValue.length === 0) {
          return props.placeholder
        }
        const currentValue = props.modelValue
        const selectedOptions = [...allOptions.value, ...createdOptions.value].filter((opt) =>
          currentValue.includes(opt.value)
        )
        const labels = selectedOptions.map((opt) => opt.label)
        if (props.maxTagCount !== undefined && labels.length > props.maxTagCount) {
          const visible = labels.slice(0, props.maxTagCount)
          return `${visible.join(', ')} +${labels.length - props.maxTagCount}`
        }
        return labels.join(', ')
      }

      const value = Array.isArray(props.modelValue) ? undefined : props.modelValue
      if (value === undefined || value === null || value === '') {
        return props.placeholder
      }
      const option = [...allOptions.value, ...createdOptions.value].find(
        (opt) => opt.value === value
      )
      return option ? option.label : props.placeholder
    })

    const showClearButton = computed(() => {
      return (
        props.clearable &&
        !props.disabled &&
        props.modelValue !== undefined &&
        props.modelValue !== null &&
        props.modelValue !== '' &&
        (!Array.isArray(props.modelValue) || props.modelValue.length > 0)
      )
    })

    const doneText = computed(() =>
      resolveLocaleText(
        'Done',
        mergedLocale.value?.common?.okText,
        mergedLocale.value?.common?.closeText
      )
    )

    function isSelected(option: SelectOption): boolean {
      if (props.multiple && Array.isArray(props.modelValue)) {
        return props.modelValue.includes(option.value)
      }
      return props.modelValue === option.value
    }

    const findFirstEnabledIndex = (): number =>
      pickerFindFirstEnabledIndex(flatSelectableOptions.value)

    const findLastEnabledIndex = (): number =>
      pickerFindLastEnabledIndex(flatSelectableOptions.value)

    const findNextEnabledIndex = (current: number, direction: 1 | -1): number =>
      pickerFindNextEnabledIndex(flatSelectableOptions.value, current, direction)

    const focusOptionAt = (index: number) => {
      if (index < 0) {
        return
      }

      nextTick(() => {
        const el = dropdownRef.value?.querySelector<HTMLElement>(`[data-option-index="${index}"]`)
        el?.focus()
        el?.scrollIntoView({ block: 'nearest' })
      })
    }

    const setActiveAndFocus = (index: number) => {
      activeIndex.value = index
      focusOptionAt(index)
    }

    function toggleDropdown() {
      if (!props.disabled) {
        isOpen.value = !isOpen.value
        if (isOpen.value && props.searchable) {
          // Focus search input when dropdown opens
          nextTick(() => {
            searchInputRef.value?.focus()
          })
        }
      }
    }

    function closeDropdown() {
      isOpen.value = false
      updateSearchValue('')
      activeIndex.value = -1
    }

    function selectOption(option: SelectOption) {
      if (option.disabled) {
        return
      }

      if (creatableOption.value && option.value === creatableOption.value.value) {
        createdOptions.value = [...createdOptions.value, option]
        emit('create', option)
      }

      if (props.multiple) {
        const currentValue = Array.isArray(props.modelValue) ? props.modelValue : []
        let newValue: typeof currentValue

        if (currentValue.includes(option.value)) {
          newValue = currentValue.filter((v) => v !== option.value)
        } else {
          newValue = [...currentValue, option.value]
        }

        emit('update:modelValue', newValue)
        emit('change', newValue)
      } else {
        emit('update:modelValue', option.value)
        emit('change', option.value)
        closeDropdown()
        nextTick(() => {
          ;(triggerRef.value as HTMLButtonElement | null)?.focus()
        })
      }
    }

    function clearSelection(event: Event) {
      event.stopPropagation()
      const newValue = props.multiple ? [] : undefined
      emit('update:modelValue', newValue)
      emit('change', newValue)
    }

    function handleClickOutside(event: Event) {
      if (
        dropdownRef.value &&
        triggerRef.value &&
        !dropdownRef.value.contains(event.target as Node) &&
        !triggerRef.value.contains(event.target as Node)
      ) {
        closeDropdown()
      }
    }

    function handleSearchInput(event: Event) {
      const target = event.target as HTMLInputElement
      updateSearchValue(target.value)
    }

    function getActiveOption(): SelectOption | undefined {
      if (activeIndex.value < 0) {
        return undefined
      }
      return flatSelectableOptions.value[activeIndex.value]
    }

    function selectActiveOption() {
      const option = getActiveOption()
      if (!option || option.disabled) {
        return
      }
      selectOption(option)
    }

    function handleTriggerKeyDown(event: KeyboardEvent) {
      if (props.disabled) {
        return
      }

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          if (!isOpen.value) {
            isOpen.value = true
            return
          }
          const next = findNextEnabledIndex(activeIndex.value, 1)
          setActiveAndFocus(next)
          return
        }
        case 'ArrowUp': {
          event.preventDefault()
          if (!isOpen.value) {
            isOpen.value = true
            return
          }
          const next = findNextEnabledIndex(activeIndex.value, -1)
          setActiveAndFocus(next)
          return
        }
        case 'Enter':
        case ' ': {
          event.preventDefault()
          if (!isOpen.value) {
            isOpen.value = true
            return
          }
          selectActiveOption()
          return
        }
        case 'Escape': {
          if (isOpen.value) {
            event.preventDefault()
            closeDropdown()
          }
          return
        }
        default:
          return
      }
    }

    function handleDropdownKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          const next = findNextEnabledIndex(activeIndex.value, 1)
          setActiveAndFocus(next)
          return
        }
        case 'ArrowUp': {
          event.preventDefault()
          const next = findNextEnabledIndex(activeIndex.value, -1)
          setActiveAndFocus(next)
          return
        }
        case 'Home': {
          event.preventDefault()
          const next = findFirstEnabledIndex()
          setActiveAndFocus(next)
          return
        }
        case 'End': {
          event.preventDefault()
          const next = findLastEnabledIndex()
          setActiveAndFocus(next)
          return
        }
        case 'Enter':
        case ' ': {
          event.preventDefault()
          selectActiveOption()
          return
        }
        case 'Escape': {
          event.preventDefault()
          closeDropdown()
          nextTick(() => {
            ;(triggerRef.value as HTMLButtonElement | null)?.focus()
          })
          return
        }
        case 'Tab': {
          closeDropdown()
          return
        }
        default:
          return
      }
    }

    function handleSearchKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case ' ': {
          event.stopPropagation()
          return
        }
        case 'ArrowDown': {
          event.preventDefault()
          event.stopPropagation()
          const next = activeIndex.value >= 0 ? activeIndex.value : findFirstEnabledIndex()
          setActiveAndFocus(next)
          return
        }
        case 'ArrowUp': {
          event.preventDefault()
          event.stopPropagation()
          const next = activeIndex.value >= 0 ? activeIndex.value : findLastEnabledIndex()
          setActiveAndFocus(next)
          return
        }
        case 'Enter': {
          if (activeIndex.value >= 0) {
            event.preventDefault()
            event.stopPropagation()
            selectActiveOption()
          }
          return
        }
        case 'Escape': {
          event.preventDefault()
          event.stopPropagation()
          closeDropdown()
          nextTick(() => {
            ;(triggerRef.value as HTMLButtonElement | null)?.focus()
          })
          return
        }
        default:
          return
      }
    }

    watch(
      isOpen,
      (open) => {
        if (open) {
          document.addEventListener('click', handleClickOutside)

          const selectedIndex = (() => {
            if (props.multiple && Array.isArray(props.modelValue)) {
              const values = props.modelValue
              if (values.length === 0) {
                return -1
              }
              return flatSelectableOptions.value.findIndex(
                (opt) => values.includes(opt.value) && !opt.disabled
              )
            }

            const value = Array.isArray(props.modelValue) ? undefined : props.modelValue
            if (value === undefined || value === null || value === '') {
              return -1
            }
            return flatSelectableOptions.value.findIndex(
              (opt) => opt.value === value && !opt.disabled
            )
          })()

          const nextActive = selectedIndex >= 0 ? selectedIndex : findFirstEnabledIndex()
          activeIndex.value = nextActive

          if (!props.searchable) {
            focusOptionAt(nextActive)
          }
        } else {
          document.removeEventListener('click', handleClickOutside)
        }
      },
      { immediate: true }
    )

    watch(flatSelectableOptions, () => {
      if (!isOpen.value) {
        return
      }

      activeIndex.value = findFirstEnabledIndex()
    })

    watch(
      () => props.searchDebounce,
      (delay) => {
        searchDebouncer.cancel()
        searchDebouncer = createSelectSearchDebouncer({
          delay,
          onSearchChange: (query) => emit('search-change', query)
        })
      }
    )

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
      searchDebouncer.cancel()
    })

    return () => {
      const triggerClasses = getSelectTriggerClasses(props.size, props.disabled, isOpen.value)

      return h('div', { class: selectBaseClasses }, [
        // Trigger button
        h(
          'button',
          {
            ref: triggerRef,
            type: 'button',
            class: classNames(triggerClasses, 'pr-16'),
            disabled: props.disabled,
            onClick: toggleDropdown,
            onKeydown: handleTriggerKeyDown,
            'aria-haspopup': 'listbox',
            'aria-expanded': isOpen.value,
            'aria-controls': listboxId,
            'aria-activedescendant':
              isOpen.value && activeIndex.value >= 0 ? getOptionId(activeIndex.value) : undefined,
            'data-state': isOpen.value ? 'open' : 'closed'
          },
          [
            h(
              'span',
              {
                class: classNames(
                  'flex-1 text-left truncate',
                  displayText.value === props.placeholder &&
                    'text-[var(--tiger-select-placeholder,var(--tiger-text-muted,#9ca3af))]'
                )
              },
              displayText.value
            )
          ]
        ),
        h(
          'span',
          { class: 'pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1' },
          [
            showClearButton.value &&
              h(
                'button',
                {
                  type: 'button',
                  class:
                    'pointer-events-auto inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-select-ring,var(--tiger-primary,#2563eb))]',
                  'data-tiger-select-clear': '',
                  'aria-label': resolveLocaleText(
                    'Clear selection',
                    mergedLocale.value?.common?.clearText
                  ),
                  onClick: clearSelection
                },
                CloseIcon
              ),
            h(
              'span',
              {
                class: classNames('inline-flex', isOpen.value && 'rotate-180'),
                'aria-hidden': 'true'
              },
              ChevronDownIcon
            )
          ]
        ),
        // Dropdown
        isOpen.value &&
          h(
            'div',
            {
              ref: dropdownRef,
              class: selectDropdownBaseClasses,
              role: 'listbox',
              id: listboxId,
              'aria-multiselectable': props.multiple ? true : undefined,
              onKeydown: handleDropdownKeyDown
            },
            [
              // Search input
              props.searchable &&
                h('input', {
                  ref: searchInputRef,
                  type: 'text',
                  class: selectSearchInputClasses,
                  placeholder: resolveLocaleText(
                    'Search...',
                    mergedLocale.value?.common?.searchPlaceholder
                  ),
                  value: searchQuery.value,
                  onInput: handleSearchInput,
                  onKeydown: handleSearchKeyDown
                }),
              // Options list
              filteredOptions.value.length > 0
                ? (() => {
                    let optionIndex = -1

                    const renderOptionItem = (
                      option: SelectOption,
                      idx: number,
                      displayLabel = option.label
                    ) => {
                      const selected = isSelected(option)
                      const active = idx === activeIndex.value
                      const optionAria = getPickerOptionAria({
                        selected,
                        disabled: !!option.disabled
                      })

                      return h(
                        'div',
                        {
                          key: option.value,
                          id: getOptionId(idx),
                          'data-option-index': idx,
                          ...optionAria,
                          tabindex: active ? 0 : -1,
                          class: getSelectOptionClasses(selected, !!option.disabled, props.size),
                          onMouseenter: () => {
                            if (!option.disabled) {
                              activeIndex.value = idx
                            }
                          },
                          onClick: () => selectOption(option)
                        },
                        [
                          h('span', { class: 'flex items-center justify-between w-full' }, [
                            h('span', displayLabel),
                            selected && h('span', CheckIcon)
                          ])
                        ]
                      )
                    }

                    const hasGroups = filteredOptions.value.some(isOptionGroup)

                    // Virtual mode: only for flat option lists (no groups).
                    if (props.virtual && !hasGroups) {
                      const flat = filteredOptions.value.filter(
                        (o): o is SelectOption => !isOptionGroup(o)
                      )
                      const all = creatableOption.value ? [...flat, creatableOption.value] : flat
                      const itemH = getSelectVirtualItemHeight(props.size)
                      const { startIndex, endIndex, totalHeight } = fixedSizeStrategy(
                        itemH
                      ).getRange(virtualScrollTop.value, props.listHeight, all.length, 5)
                      const visible = []
                      for (let i = startIndex; i <= endIndex; i++) {
                        const isCreate = creatableOption.value && i === all.length - 1
                        visible.push(
                          renderOptionItem(
                            all[i],
                            i,
                            isCreate
                              ? getCreateSelectOptionLabel(all[i], props.createOptionText)
                              : all[i].label
                          )
                        )
                      }
                      return h(
                        'div',
                        {
                          ref: virtualScrollRef,
                          'data-tiger-select-virtual': '',
                          style: { maxHeight: `${props.listHeight}px`, overflowY: 'auto' },
                          onScroll: (e: Event) => {
                            virtualScrollTop.value = (e.target as HTMLElement).scrollTop
                          }
                        },
                        [
                          h(
                            'div',
                            { style: { height: `${totalHeight}px`, position: 'relative' } },
                            [
                              h(
                                'div',
                                { style: { transform: `translateY(${startIndex * itemH}px)` } },
                                visible
                              )
                            ]
                          )
                        ]
                      )
                    }

                    const optionNodes = filteredOptions.value.map((item) => {
                      if (isOptionGroup(item)) {
                        return h('div', { key: item.label }, [
                          h('div', { class: selectGroupLabelClasses }, item.label),
                          item.options.map((option) => {
                            optionIndex += 1
                            return renderOptionItem(option, optionIndex)
                          })
                        ])
                      }

                      optionIndex += 1
                      return renderOptionItem(item, optionIndex)
                    })

                    if (creatableOption.value) {
                      optionIndex += 1
                      optionNodes.push(
                        renderOptionItem(
                          creatableOption.value,
                          optionIndex,
                          getCreateSelectOptionLabel(creatableOption.value, props.createOptionText)
                        )
                      )
                    }

                    return optionNodes
                  })()
                : creatableOption.value
                  ? (() => {
                      const optionLabel = getCreateSelectOptionLabel(
                        creatableOption.value,
                        props.createOptionText
                      )
                      return h(
                        'div',
                        {
                          key: creatableOption.value.value,
                          id: getOptionId(0),
                          'data-option-index': 0,
                          role: 'option',
                          'aria-selected': false,
                          tabindex: activeIndex.value === 0 ? 0 : -1,
                          class: getSelectOptionClasses(false, false, props.size),
                          onMouseenter: () => {
                            activeIndex.value = 0
                          },
                          onClick: () => selectOption(creatableOption.value!)
                        },
                        [
                          h(
                            'span',
                            { class: 'flex items-center justify-between w-full' },
                            optionLabel
                          )
                        ]
                      )
                    })()
                  : h(
                      'div',
                      { class: selectEmptyStateClasses },
                      resolveLocaleText(
                        'No options found',
                        props.emptyText,
                        mergedLocale.value?.common?.emptyText
                      )
                    ),
              h('div', { class: selectDoneActionClasses }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: selectDoneButtonClasses,
                    onClick: closeDropdown,
                    onKeydown: (event: KeyboardEvent) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation()
                      }
                    }
                  },
                  doneText.value
                )
              ])
            ]
          )
      ])
    }
  }
})

export default Select
