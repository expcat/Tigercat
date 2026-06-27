import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getSelectTriggerClasses,
  selectBaseClasses,
  createSelectSearchDebouncer,
  flattenSelectOptions,
  resolveCreatableSelectOption,
  resolveSelectFilteredOptions,
  findFirstEnabledIndex as pickerFindFirstEnabledIndex,
  findLastEnabledIndex as pickerFindLastEnabledIndex,
  findNextEnabledIndex as pickerFindNextEnabledIndex,
  resolveLocaleText,
  mergeTigerLocale,
  type SelectOption,
  type SelectSearchDebouncer,
  type SelectValue,
  type SelectValues
} from '@expcat/tigercat-core'
import { useTigerConfig } from '../ConfigProvider'
import type { SelectContext, SelectProps } from './types'

const SELECT_KEYS = new Set([
  'options',
  'size',
  'disabled',
  'placeholder',
  'searchable',
  'clearable',
  'noOptionsText',
  'noDataText',
  'maxTagCount',
  'virtual',
  'remote',
  'searchDebounce',
  'creatable',
  'createOptionText',
  'listHeight',
  'onSearch',
  'onCreate',
  'className',
  'value',
  'onChange',
  'multiple',
  'locale'
])

export function useSelectState(props: SelectProps): SelectContext {
  const {
    options = [],
    size = 'md',
    disabled = false,
    placeholder = 'Select an option',
    searchable = false,
    clearable = true,
    noOptionsText,
    noDataText,
    maxTagCount,
    remote = false,
    searchDebounce = 0,
    creatable = false,
    createOptionText = 'Create',
    virtual = false,
    listHeight = 256,
    onSearch,
    onCreate,
    className,
    value,
    onChange,
    multiple,
    locale
  } = props

  const isMultiple = multiple === true
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )

  const divProps: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) {
    if (!SELECT_KEYS.has(k)) divProps[k] = v
  }

  const instanceId = useId()
  const listboxId = `tiger-select-listbox-${instanceId}`

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchDebouncerRef = useRef<SelectSearchDebouncer | null>(null)

  const filteredOptions = useMemo(
    () => resolveSelectFilteredOptions(options, searchQuery, { searchable, remote }),
    [options, remote, searchable, searchQuery]
  )

  const flatFilteredOptions = useMemo(
    () => flattenSelectOptions(filteredOptions),
    [filteredOptions]
  )

  const creatableOption = useMemo(
    () =>
      resolveCreatableSelectOption([...options, ...createdOptions], searchQuery, {
        creatable: creatable && searchable
      }),
    [creatable, createdOptions, options, searchable, searchQuery]
  )

  const flatSelectableOptions = useMemo(
    () => (creatableOption ? [...flatFilteredOptions, creatableOption] : flatFilteredOptions),
    [creatableOption, flatFilteredOptions]
  )

  const allOptions = useMemo(() => flattenSelectOptions(options), [options])

  const displayText = useMemo(() => {
    if (isMultiple) {
      const values = Array.isArray(value) ? value : []
      if (values.length === 0) return placeholder
      const labels = [...allOptions, ...createdOptions]
        .filter((opt) => values.includes(opt.value))
        .map((opt) => opt.label)
      if (maxTagCount !== undefined && labels.length > maxTagCount) {
        const visible = labels.slice(0, maxTagCount)
        return `${visible.join(', ')} +${labels.length - maxTagCount}`
      }
      return labels.join(', ')
    }

    if (value === undefined || value === null || value === '') return placeholder
    return (
      [...allOptions, ...createdOptions].find((opt) => opt.value === value)?.label ?? placeholder
    )
  }, [isMultiple, value, allOptions, createdOptions, placeholder, maxTagCount])

  const showClearButton = useMemo(
    () =>
      clearable &&
      !disabled &&
      value !== undefined &&
      value !== null &&
      value !== '' &&
      (!Array.isArray(value) || value.length > 0),
    [clearable, disabled, value]
  )

  const isSelected = (option: SelectOption): boolean => {
    if (isMultiple) {
      return (Array.isArray(value) ? value : []).includes(option.value)
    }
    return value === option.value
  }

  const getOptionId = (index: number) => `tiger-select-option-${instanceId}-${index}`

  const findFirstEnabledIndex = useCallback(
    (): number => pickerFindFirstEnabledIndex(flatSelectableOptions),
    [flatSelectableOptions]
  )

  const findLastEnabledIndex = (): number => pickerFindLastEnabledIndex(flatSelectableOptions)

  const findNextEnabledIndex = (current: number, direction: 1 | -1): number =>
    pickerFindNextEnabledIndex(flatSelectableOptions, current, direction)

  const focusOptionAt = useCallback((index: number) => {
    if (index < 0) {
      return
    }

    requestAnimationFrame(() => {
      const el = dropdownRef.current?.querySelector<HTMLElement>(`[data-option-index="${index}"]`)
      el?.focus()
      el?.scrollIntoView({ block: 'nearest' })
    })
  }, [])

  const setActiveAndFocus = (index: number) => {
    setActiveIndex(index)
    focusOptionAt(index)
  }

  const closeDropdown = () => {
    setIsOpen(false)
    setSearchQuery('')
    setActiveIndex(-1)
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev)
    }
  }

  const getActiveOption = (): SelectOption | undefined => {
    if (activeIndex < 0) {
      return undefined
    }
    return flatSelectableOptions[activeIndex]
  }

  const selectActiveOption = () => {
    const option = getActiveOption()
    if (!option || option.disabled) {
      return
    }
    selectOption(option)
  }

  const selectOption = (option: SelectOption) => {
    if (option.disabled) {
      return
    }

    if (creatableOption && option.value === creatableOption.value) {
      setCreatedOptions((current) => [...current, option])
      onCreate?.(option)
    }

    if (isMultiple) {
      const currentValue = Array.isArray(value) ? value : []
      const nextValue = currentValue.includes(option.value)
        ? currentValue.filter((v) => v !== option.value)
        : [...currentValue, option.value]

      ;(onChange as ((value: SelectValues) => void) | undefined)?.(nextValue)
      return
    }

    ;(onChange as ((value: SelectValue | undefined) => void) | undefined)?.(option.value)
    closeDropdown()
    requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }

  const clearSelection = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (isMultiple) {
      ;(onChange as ((value: SelectValues) => void) | undefined)?.([])
      return
    }

    ;(onChange as ((value: SelectValue | undefined) => void) | undefined)?.(undefined)
  }

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
    searchDebouncerRef.current?.schedule(query)
  }

  useEffect(() => {
    searchDebouncerRef.current?.cancel()
    searchDebouncerRef.current = createSelectSearchDebouncer({
      delay: searchDebounce,
      onSearch: (query) => onSearch?.(query)
    })

    return () => searchDebouncerRef.current?.cancel()
  }, [onSearch, searchDebounce])

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          return
        }
        const next = findNextEnabledIndex(activeIndex, 1)
        setActiveAndFocus(next)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          return
        }
        const next = findNextEnabledIndex(activeIndex, -1)
        setActiveAndFocus(next)
        return
      }
      case 'Enter':
      case ' ': {
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          return
        }
        selectActiveOption()
        return
      }
      case 'Escape': {
        if (isOpen) {
          event.preventDefault()
          closeDropdown()
        }
        return
      }
      default:
        return
    }
  }

  const handleDropdownKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        const next = findNextEnabledIndex(activeIndex, 1)
        setActiveAndFocus(next)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        const next = findNextEnabledIndex(activeIndex, -1)
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
        triggerRef.current?.focus()
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

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case ' ': {
        event.stopPropagation()
        return
      }
      case 'ArrowDown': {
        event.preventDefault()
        event.stopPropagation()
        const next = activeIndex >= 0 ? activeIndex : findFirstEnabledIndex()
        setActiveAndFocus(next)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        event.stopPropagation()
        const next = activeIndex >= 0 ? activeIndex : findLastEnabledIndex()
        setActiveAndFocus(next)
        return
      }
      case 'Enter': {
        if (activeIndex >= 0) {
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
        triggerRef.current?.focus()
        return
      }
      default:
        return
    }
  }

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus()
    }
  }, [isOpen, searchable])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (flatSelectableOptions.length === 0) {
      setActiveIndex(-1)
      return
    }

    const selectedIndex = (() => {
      if (isMultiple) {
        const values = Array.isArray(value) ? value : []
        if (values.length === 0) {
          return -1
        }
        return flatSelectableOptions.findIndex((opt) => values.includes(opt.value) && !opt.disabled)
      }

      if (value === undefined || value === null || value === '') {
        return -1
      }
      return flatSelectableOptions.findIndex((opt) => opt.value === value && !opt.disabled)
    })()

    const nextActive = selectedIndex >= 0 ? selectedIndex : findFirstEnabledIndex()
    setActiveIndex(nextActive)

    if (!searchable) {
      focusOptionAt(nextActive)
    }
  }, [
    isOpen,
    searchable,
    flatSelectableOptions,
    isMultiple,
    value,
    findFirstEnabledIndex,
    focusOptionAt
  ])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        closeDropdown()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return {
    listboxId,
    getOptionId,
    isOpen,
    searchQuery,
    activeIndex,
    setActiveIndex,
    dropdownRef,
    triggerRef,
    searchInputRef,
    isMultiple,
    size,
    virtual,
    listHeight,
    disabled,
    placeholder,
    searchable,
    clearable,
    noDataText: resolveLocaleText(
      'No options available',
      noDataText,
      mergedLocale?.common?.emptyText
    ),
    noOptionsText: resolveLocaleText(
      'No options found',
      noOptionsText,
      mergedLocale?.common?.emptyText
    ),
    createOptionText,
    className,
    divProps,
    searchPlaceholder: resolveLocaleText('Search...', mergedLocale?.common?.searchPlaceholder),
    clearAriaLabel: resolveLocaleText('Clear selection', mergedLocale?.common?.clearText),
    filteredOptions,
    flatSelectableOptions,
    creatableOption,
    hasOptions: filteredOptions.length > 0,
    optionsLength: options.length,
    displayText,
    showClearButton,
    containerClasses: classNames(selectBaseClasses, className),
    triggerClasses: getSelectTriggerClasses(size, disabled, isOpen),
    isSelected,
    selectOption,
    clearSelection,
    toggleDropdown,
    handleSearchInput,
    handleTriggerKeyDown,
    handleDropdownKeyDown,
    handleSearchKeyDown
  }
}
