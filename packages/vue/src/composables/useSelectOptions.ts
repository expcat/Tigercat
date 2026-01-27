import { ref, computed, Ref, nextTick } from 'vue'
import {
  filterOptions,
  isOptionGroup,
  type SelectOption,
  type SelectOptions
} from '@expcat/tigercat-core'

export interface UseSelectOptionsOptions {
  /** Available options */
  options: Ref<SelectOptions>
  /** Whether searchable */
  searchable: Ref<boolean>
  /** Current model value */
  modelValue: Ref<string | number | (string | number)[] | undefined>
  /** Multiple selection mode */
  multiple: Ref<boolean>
  /** Placeholder text */
  placeholder: Ref<string>
  /** Dropdown ref for DOM queries */
  dropdownRef: Ref<HTMLElement | null>
  /** Search emit callback */
  onSearch?: (query: string) => void
}

export interface UseSelectOptionsReturn {
  /** Search query */
  searchQuery: Ref<string>
  /** Active option index */
  activeIndex: Ref<number>
  /** Filtered options based on search */
  filteredOptions: Ref<SelectOptions>
  /** Flattened all options (including from groups) */
  allOptions: Ref<SelectOption[]>
  /** Flattened filtered options */
  flatFilteredOptions: Ref<SelectOption[]>
  /** Display text for trigger */
  displayText: Ref<string>
  /** Handle search input */
  handleSearchInput: (event: Event) => void
  /** Reset search state */
  resetSearch: () => void
  /** Check if option is selected */
  isSelected: (option: SelectOption) => boolean
  /** Find first enabled option index */
  findFirstEnabledIndex: () => number
  /** Find last enabled option index */
  findLastEnabledIndex: () => number
  /** Find next enabled index from current */
  findNextEnabledIndex: (current: number, direction: 1 | -1) => number
  /** Focus option at index */
  focusOptionAt: (index: number) => void
  /** Set active index and focus */
  setActiveAndFocus: (index: number) => void
  /** Get option at active index */
  getActiveOption: () => SelectOption | undefined
}

export function useSelectOptions(options: UseSelectOptionsOptions): UseSelectOptionsReturn {
  const {
    options: optionsProp,
    searchable,
    modelValue,
    multiple,
    placeholder,
    dropdownRef,
    onSearch
  } = options

  const searchQuery = ref('')
  const activeIndex = ref(-1)

  const filteredOptions = computed(() => {
    if (!searchable.value || !searchQuery.value) {
      return optionsProp.value
    }
    return filterOptions(optionsProp.value, searchQuery.value)
  })

  function flattenOptions(opts: SelectOptions): SelectOption[] {
    const allOpts: SelectOption[] = []
    opts.forEach((item) => {
      if (isOptionGroup(item)) {
        allOpts.push(...item.options)
      } else {
        allOpts.push(item)
      }
    })
    return allOpts
  }

  const allOptions = computed(() => flattenOptions(optionsProp.value))
  const flatFilteredOptions = computed(() => flattenOptions(filteredOptions.value))

  const displayText = computed(() => {
    if (multiple.value && Array.isArray(modelValue.value)) {
      if (modelValue.value.length === 0) {
        return placeholder.value
      }
      const currentValue = modelValue.value
      const selectedOptions = allOptions.value.filter((opt) => currentValue.includes(opt.value))
      return selectedOptions.map((opt) => opt.label).join(', ')
    }

    const value = Array.isArray(modelValue.value) ? undefined : modelValue.value
    if (value === undefined || value === null || value === '') {
      return placeholder.value
    }
    const option = allOptions.value.find((opt) => opt.value === value)
    return option ? option.label : placeholder.value
  })

  const handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    searchQuery.value = target.value
    onSearch?.(target.value)
  }

  const resetSearch = () => {
    searchQuery.value = ''
    activeIndex.value = -1
  }

  const isSelected = (option: SelectOption): boolean => {
    if (multiple.value && Array.isArray(modelValue.value)) {
      return modelValue.value.includes(option.value)
    }
    return modelValue.value === option.value
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
    if (index < 0) return

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

  const getActiveOption = (): SelectOption | undefined => {
    if (activeIndex.value < 0) return undefined
    return flatFilteredOptions.value[activeIndex.value]
  }

  return {
    searchQuery,
    activeIndex,
    filteredOptions,
    allOptions,
    flatFilteredOptions,
    displayText,
    handleSearchInput,
    resetSearch,
    isSelected,
    findFirstEnabledIndex,
    findLastEnabledIndex,
    findNextEnabledIndex,
    focusOptionAt,
    setActiveAndFocus,
    getActiveOption
  }
}
