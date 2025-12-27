import { defineComponent, computed, ref, h, PropType, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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
  type SelectOption,
  type SelectOptionGroup,
  type SelectSize,
} from '@tigercat/core'

// Chevron down icon
const ChevronDownIcon = h(
  'svg',
  {
    class: 'w-5 h-5 text-gray-400 transition-transform',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 20 20',
    fill: 'currentColor',
  },
  [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z',
      'clip-rule': 'evenodd',
    }),
  ]
)

// Close icon (X)
const CloseIcon = h(
  'svg',
  {
    class: 'w-4 h-4 text-gray-400 hover:text-gray-600',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 20 20',
    fill: 'currentColor',
  },
  [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
      'clip-rule': 'evenodd',
    }),
  ]
)

// Check icon
const CheckIcon = h(
  'svg',
  {
    class: 'w-5 h-5 text-[var(--tiger-primary,#2563eb)]',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 20 20',
    fill: 'currentColor',
  },
  [
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      'clip-rule': 'evenodd',
    }),
  ]
)

export const Select = defineComponent({
  name: 'TigerSelect',
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<string | number | (string | number)[]>,
      default: undefined,
    },
    options: {
      type: Array as PropType<SelectOption[] | SelectOptionGroup[]>,
      default: () => [],
    },
    size: {
      type: String as PropType<SelectSize>,
      default: 'md',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: 'Select an option',
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    noOptionsText: {
      type: String,
      default: 'No options found',
    },
    noDataText: {
      type: String,
      default: 'No options available',
    },
  },
  emits: ['update:modelValue', 'change', 'search'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const searchQuery = ref('')
    const dropdownRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const searchInputRef = ref<HTMLInputElement | null>(null)

    const selectedValue = computed(() => props.modelValue)

    const filteredOptions = computed(() => {
      if (!props.searchable || !searchQuery.value) {
        return props.options
      }
      return filterOptions(props.options, searchQuery.value)
    })

    const hasOptions = computed(() => {
      return filteredOptions.value.length > 0
    })

    const displayText = computed(() => {
      if (props.multiple && Array.isArray(selectedValue.value)) {
        if (selectedValue.value.length === 0) {
          return props.placeholder
        }
        const currentValue = selectedValue.value as (string | number)[]
        const selectedOptions = getAllOptions().filter((opt) =>
          currentValue.includes(opt.value)
        )
        return selectedOptions.map((opt) => opt.label).join(', ')
      } else {
        if (selectedValue.value === undefined || selectedValue.value === null || selectedValue.value === '') {
          return props.placeholder
        }
        const option = getAllOptions().find((opt) => opt.value === selectedValue.value)
        return option ? option.label : props.placeholder
      }
    })

    const showClearButton = computed(() => {
      return (
        props.clearable &&
        !props.disabled &&
        selectedValue.value !== undefined &&
        selectedValue.value !== null &&
        selectedValue.value !== '' &&
        (!Array.isArray(selectedValue.value) || selectedValue.value.length > 0)
      )
    })

    function getAllOptions(): SelectOption[] {
      const allOptions: SelectOption[] = []
      props.options.forEach((item) => {
        if (isOptionGroup(item)) {
          allOptions.push(...(item as SelectOptionGroup).options)
        } else {
          allOptions.push(item as SelectOption)
        }
      })
      return allOptions
    }

    function isSelected(option: SelectOption): boolean {
      if (props.multiple && Array.isArray(selectedValue.value)) {
        return selectedValue.value.includes(option.value)
      }
      return selectedValue.value === option.value
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
    }

    function selectOption(option: SelectOption) {
      if (option.disabled) {
        return
      }

      if (props.multiple) {
        const currentValue = Array.isArray(selectedValue.value) ? selectedValue.value : []
        let newValue: (string | number)[]
        
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

    watch(isOpen, (newValue) => {
      if (newValue) {
        document.addEventListener('click', handleClickOutside)
      } else {
        document.removeEventListener('click', handleClickOutside)
      }
    })

    onMounted(() => {
      if (isOpen.value) {
        document.addEventListener('click', handleClickOutside)
      }
    })

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
          },
          [
            h(
              'span',
              {
                class: classNames(
                  'flex-1 text-left truncate',
                  displayText.value === props.placeholder && 'text-gray-400'
                ),
              },
              displayText.value
            ),
            h('span', { class: 'flex items-center gap-1' }, [
              showClearButton.value &&
                h(
                  'span',
                  {
                    class: 'inline-flex',
                    onClick: clearSelection,
                  },
                  CloseIcon
                ),
              h(
                'span',
                {
                  class: classNames('inline-flex', isOpen.value && 'rotate-180'),
                },
                ChevronDownIcon
              ),
            ]),
          ]
        ),
        // Dropdown
        isOpen.value &&
          h(
            'div',
            {
              ref: dropdownRef,
              class: selectDropdownBaseClasses,
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
                }),
              // Options list
              hasOptions.value
                ? filteredOptions.value.map((item) => {
                    if (isOptionGroup(item)) {
                      const group = item as SelectOptionGroup
                      return h('div', { key: group.label }, [
                        h('div', { class: selectGroupLabelClasses }, group.label),
                        group.options.map((option) =>
                          h(
                            'button',
                            {
                              key: option.value,
                              type: 'button',
                              class: getSelectOptionClasses(
                                isSelected(option),
                                !!option.disabled,
                                props.size
                              ),
                              disabled: option.disabled,
                              onClick: () => selectOption(option),
                            },
                            [
                              h('span', { class: 'flex items-center justify-between w-full' }, [
                                h('span', option.label),
                                isSelected(option) && h('span', CheckIcon),
                              ]),
                            ]
                          )
                        ),
                      ])
                    } else {
                      const option = item as SelectOption
                      return h(
                        'button',
                        {
                          key: option.value,
                          type: 'button',
                          class: getSelectOptionClasses(
                            isSelected(option),
                            !!option.disabled,
                            props.size
                          ),
                          disabled: option.disabled,
                          onClick: () => selectOption(option),
                        },
                        [
                          h('span', { class: 'flex items-center justify-between w-full' }, [
                            h('span', option.label),
                            isSelected(option) && h('span', CheckIcon),
                          ]),
                        ]
                      )
                    }
                  })
                : // Empty state
                  h(
                    'div',
                    { class: selectEmptyStateClasses },
                    props.options.length === 0 ? props.noDataText : props.noOptionsText
                  ),
            ]
          ),
      ])
    }
  },
})

export default Select
