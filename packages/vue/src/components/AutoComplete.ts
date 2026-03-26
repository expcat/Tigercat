import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onBeforeUnmount,
  nextTick,
  type PropType
} from 'vue'
import type { AutoCompleteOption, AutoCompleteSize } from '@expcat/tigercat-core'
import {
  autoCompleteBaseClasses,
  autoCompleteDropdownClasses,
  autoCompleteEmptyStateClasses,
  getAutoCompleteInputClasses,
  getAutoCompleteOptionClasses,
  filterAutoCompleteOptions,
  coerceClassValue,
  classNames,
  icon20ViewBox,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core'

let autoCompleteInstanceId = 0

const ClearIcon = h(
  'svg',
  {
    class: 'w-4 h-4',
    viewBox: icon20ViewBox,
    fill: 'currentColor',
    xmlns: 'http://www.w3.org/2000/svg'
  },
  [
    h('path', {
      d: closeSolidIcon20PathD,
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd'
    })
  ]
)

export type VueAutoCompleteProps = InstanceType<typeof AutoComplete>['$props']

export const AutoComplete = defineComponent({
  name: 'TigerAutoComplete',
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number>,
      default: ''
    },
    options: {
      type: Array as PropType<AutoCompleteOption[]>,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    },
    size: {
      type: String as PropType<AutoCompleteSize>,
      default: 'md'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    notFoundText: {
      type: String,
      default: 'No matches found'
    },
    filterOption: {
      type: [Boolean, Function] as PropType<
        boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
      >,
      default: true
    },
    defaultActiveFirstOption: {
      type: Boolean,
      default: true
    },
    allowFreeInput: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'select', 'search', 'change'],
  setup(props, { emit, attrs }) {
    const instanceId = ++autoCompleteInstanceId
    const listboxId = `tiger-autocomplete-listbox-${instanceId}`

    const isOpen = ref(false)
    const inputValue = ref(String(props.modelValue ?? ''))
    const activeIndex = ref(-1)
    const containerRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)

    const filteredOptions = computed(() =>
      filterAutoCompleteOptions(props.options, inputValue.value, props.filterOption)
    )

    const showClearButton = computed(
      () => props.clearable && !props.disabled && inputValue.value !== ''
    )

    // Sync external modelValue changes
    watch(
      () => props.modelValue,
      (val) => {
        inputValue.value = String(val ?? '')
      }
    )

    function openDropdown() {
      if (props.disabled) return
      isOpen.value = true
      if (props.defaultActiveFirstOption && filteredOptions.value.length > 0) {
        activeIndex.value = 0
      }
    }

    function closeDropdown() {
      isOpen.value = false
      activeIndex.value = -1
    }

    function handleInput(e: Event) {
      const val = (e.target as HTMLInputElement).value
      inputValue.value = val
      emit('update:modelValue', val)
      emit('search', val)
      emit('change', val)
      if (!isOpen.value) openDropdown()
      if (props.defaultActiveFirstOption) {
        activeIndex.value = filteredOptions.value.length > 0 ? 0 : -1
      }
    }

    function handleSelect(option: AutoCompleteOption) {
      if (option.disabled) return
      inputValue.value = option.label
      emit('update:modelValue', option.value)
      emit('select', option.value, option)
      emit('change', option.value)
      closeDropdown()
    }

    function handleClear(e: Event) {
      e.stopPropagation()
      inputValue.value = ''
      emit('update:modelValue', '')
      emit('change', '')
      nextTick(() => inputRef.value?.focus())
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen.value) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault()
          openDropdown()
        }
        return
      }

      const options = filteredOptions.value
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (options.length > 0) {
            let next = activeIndex.value + 1
            while (next < options.length && options[next].disabled) next++
            if (next < options.length) activeIndex.value = next
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (options.length > 0) {
            let prev = activeIndex.value - 1
            while (prev >= 0 && options[prev].disabled) prev--
            if (prev >= 0) activeIndex.value = prev
          }
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex.value >= 0 && activeIndex.value < options.length) {
            handleSelect(options[activeIndex.value])
          }
          break
        case 'Escape':
          e.preventDefault()
          closeDropdown()
          break
      }
    }

    // Click outside
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        closeDropdown()
      }
    }

    watch(isOpen, (val) => {
      if (val) {
        document.addEventListener('click', handleClickOutside)
      } else {
        document.removeEventListener('click', handleClickOutside)
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => {
      const containerClasses = classNames(autoCompleteBaseClasses, coerceClassValue(attrs.class))

      const options = filteredOptions.value

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses
        },
        [
          // Input
          h('input', {
            ref: inputRef,
            type: 'text',
            class: getAutoCompleteInputClasses(props.size, props.disabled, isOpen.value),
            value: inputValue.value,
            placeholder: props.placeholder,
            disabled: props.disabled,
            role: 'combobox',
            'aria-expanded': String(isOpen.value),
            'aria-haspopup': 'listbox',
            'aria-controls': isOpen.value ? listboxId : undefined,
            'aria-activedescendant':
              isOpen.value && activeIndex.value >= 0
                ? `${listboxId}-option-${activeIndex.value}`
                : undefined,
            autocomplete: 'off',
            onInput: handleInput,
            onFocus: openDropdown,
            onKeydown: handleKeyDown
          }),

          // Clear button
          showClearButton.value
            ? h(
                'button',
                {
                  type: 'button',
                  class:
                    'absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tiger-autocomplete-clear,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-autocomplete-clear-hover,var(--tiger-text,#111827))] transition-colors',
                  'aria-label': 'Clear',
                  onClick: handleClear
                },
                [ClearIcon]
              )
            : null,

          // Dropdown
          isOpen.value && options.length > 0
            ? h(
                'div',
                {
                  id: listboxId,
                  role: 'listbox',
                  class: autoCompleteDropdownClasses
                },
                options.map((option, index) =>
                  h(
                    'div',
                    {
                      id: `${listboxId}-option-${index}`,
                      role: 'option',
                      'aria-selected': String(option.value) === String(props.modelValue),
                      'aria-disabled': option.disabled,
                      class: getAutoCompleteOptionClasses(
                        String(option.value) === String(props.modelValue),
                        !!option.disabled,
                        props.size
                      ),
                      onClick: () => handleSelect(option),
                      onMouseenter: () => {
                        activeIndex.value = index
                      }
                    },
                    option.label
                  )
                )
              )
            : isOpen.value && inputValue.value && options.length === 0
              ? h(
                  'div',
                  {
                    class: classNames(autoCompleteDropdownClasses, autoCompleteEmptyStateClasses)
                  },
                  props.notFoundText
                )
              : null
        ]
      )
    }
  }
})

export default AutoComplete
