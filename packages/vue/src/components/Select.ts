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
  isOptionGroup,
  filterOptions,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  checkSolidIcon20PathD,
  type SelectOption,
  type SelectOptions,
  type SelectSize,
  type SelectModelValue
} from '@expcat/tigercat-core'

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
      type: String as PropType<SelectSize>,
      default: 'md' as SelectSize
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
     * Text shown when no search results
     * @default 'No options found'
     */
    noOptionsText: {
      type: String,
      default: 'No options found'
    },
    /**
     * Text shown when no data available
     * @default 'No options available'
     */
    noDataText: {
      type: String,
      default: 'No options available'
    }
  },
  emits: ['update:modelValue', 'change', 'search'],
  setup(props, { emit }) {
    const instanceId = ++selectInstanceId
    const listboxId = `tiger-select-listbox-${instanceId}`
    const getOptionId = (index: number) => `tiger-select-option-${instanceId}-${index}`

    const isOpen = ref(false)
    const searchQuery = ref('')
    const activeIndex = ref(-1)
    const dropdownRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLInputElement | null>(null)

    const filteredOptions = computed(() => {
      if (!props.searchable || !searchQuery.value) {
        return props.options
      }
      return filterOptions(props.options, searchQuery.value)
    })

    function flattenOptions(options: SelectOptions): SelectOption[] {
      const allOptions: SelectOption[] = []
      options.forEach((item) => {
        if (isOptionGroup(item)) {
          allOptions.push(...item.options)
        } else {
          allOptions.push(item)
        }
      })
      return allOptions
    }

    const allOptions = computed(() => flattenOptions(props.options))
    const flatFilteredOptions = computed(() => flattenOptions(filteredOptions.value))

    const displayText = computed(() => {
      if (props.multiple && Array.isArray(props.modelValue)) {
        if (props.modelValue.length === 0) {
          return props.placeholder
        }
        const currentValue = props.modelValue
        const selectedOptions = allOptions.value.filter((opt) => currentValue.includes(opt.value))
        return selectedOptions.map((opt) => opt.label).join(', ')
      }

      const value = Array.isArray(props.modelValue) ? undefined : props.modelValue
      if (value === undefined || value === null || value === '') {
        return props.placeholder
      }
      const option = allOptions.value.find((opt) => opt.value === value)
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

    function isSelected(option: SelectOption): boolean {
      if (props.multiple && Array.isArray(props.modelValue)) {
        return props.modelValue.includes(option.value)
      }
      return props.modelValue === option.value
    }

    const findFirstEnabledIndex = (): number =>
      flatFilteredOptions.value.findIndex((opt) => !opt.disabled)

    const findLastEnabledIndex = (): number => {
      for (let i = flatFilteredOptions.value.length - 1; i >= 0; i--) {
        if (!flatFilteredOptions.value[i]?.disabled) {
          return i
        }
      }
      return -1
    }

    const findNextEnabledIndex = (current: number, direction: 1 | -1): number => {
      if (flatFilteredOptions.value.length === 0) {
        return -1
      }

      const start =
        current < 0
          ? direction === 1
            ? 0
            : flatFilteredOptions.value.length - 1
          : current + direction
      for (let i = start; i >= 0 && i < flatFilteredOptions.value.length; i += direction) {
        if (!flatFilteredOptions.value[i]?.disabled) {
          return i
        }
      }
      return current
    }

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
      searchQuery.value = ''
      activeIndex.value = -1
    }

    function selectOption(option: SelectOption) {
      if (option.disabled) {
        return
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
      searchQuery.value = target.value
      emit('search', target.value)
    }

    function getActiveOption(): SelectOption | undefined {
      if (activeIndex.value < 0) {
        return undefined
      }
      return flatFilteredOptions.value[activeIndex.value]
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
              return flatFilteredOptions.value.findIndex(
                (opt) => values.includes(opt.value) && !opt.disabled
              )
            }

            const value = Array.isArray(props.modelValue) ? undefined : props.modelValue
            if (value === undefined || value === null || value === '') {
              return -1
            }
            return flatFilteredOptions.value.findIndex(
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

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
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
            class: triggerClasses,
            disabled: props.disabled,
            onClick: toggleDropdown,
            onKeydown: handleTriggerKeyDown,
            'aria-haspopup': 'listbox',
            'aria-expanded': isOpen.value,
            'aria-controls': listboxId
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
            ),
            h('span', { class: 'flex items-center gap-1' }, [
              showClearButton.value &&
                h(
                  'span',
                  {
                    class: 'inline-flex',
                    'data-tiger-select-clear': '',
                    onClick: clearSelection
                  },
                  CloseIcon
                ),
              h(
                'span',
                {
                  class: classNames('inline-flex', isOpen.value && 'rotate-180')
                },
                ChevronDownIcon
              )
            ])
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
                  placeholder: 'Search...',
                  value: searchQuery.value,
                  onInput: handleSearchInput,
                  onKeydown: handleSearchKeyDown
                }),
              // Options list
              filteredOptions.value.length > 0
                ? (() => {
                    let optionIndex = -1

                    return filteredOptions.value.map((item) => {
                      if (isOptionGroup(item)) {
                        return h('div', { key: item.label }, [
                          h('div', { class: selectGroupLabelClasses }, item.label),
                          item.options.map((option) => {
                            optionIndex += 1
                            const selected = isSelected(option)
                            const active = optionIndex === activeIndex.value

                            return h(
                              'div',
                              {
                                key: option.value,
                                id: getOptionId(optionIndex),
                                'data-option-index': optionIndex,
                                role: 'option',
                                'aria-selected': selected,
                                'aria-disabled': option.disabled ? true : undefined,
                                tabindex: active ? 0 : -1,
                                class: getSelectOptionClasses(
                                  selected,
                                  !!option.disabled,
                                  props.size
                                ),
                                onMouseenter: () => {
                                  if (!option.disabled) {
                                    activeIndex.value = optionIndex
                                  }
                                },
                                onClick: () => selectOption(option)
                              },
                              [
                                h(
                                  'span',
                                  {
                                    class: 'flex items-center justify-between w-full'
                                  },
                                  [h('span', option.label), selected && h('span', CheckIcon)]
                                )
                              ]
                            )
                          })
                        ])
                      }

                      optionIndex += 1
                      const selected = isSelected(item)
                      const active = optionIndex === activeIndex.value

                      return h(
                        'div',
                        {
                          key: item.value,
                          id: getOptionId(optionIndex),
                          'data-option-index': optionIndex,
                          role: 'option',
                          'aria-selected': selected,
                          'aria-disabled': item.disabled ? true : undefined,
                          tabindex: active ? 0 : -1,
                          class: getSelectOptionClasses(selected, !!item.disabled, props.size),
                          onMouseenter: () => {
                            if (!item.disabled) {
                              activeIndex.value = optionIndex
                            }
                          },
                          onClick: () => selectOption(item)
                        },
                        [
                          h(
                            'span',
                            {
                              class: 'flex items-center justify-between w-full'
                            },
                            [h('span', item.label), selected && h('span', CheckIcon)]
                          )
                        ]
                      )
                    })
                  })()
                : h(
                    'div',
                    { class: selectEmptyStateClasses },
                    props.options.length === 0 ? props.noDataText : props.noOptionsText
                  )
            ]
          )
      ])
    }
  }
})

export default Select
