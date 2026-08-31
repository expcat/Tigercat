import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  classNames,
  TIGER_CHROME_ATTR,
  createSelectSearchDebouncer,
  createSelectTypeaheadBuffer,
  flattenSelectOptions,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionId,
  getSelectLabels,
  getSelectRootClasses,
  getSelectTriggerClasses,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  normalizeSelectValue,
  pruneCreatedSelectOptions,
  rememberSelectOptions,
  resolveCreatableSelectOption,
  resolveLocaleText,
  resolveSelectActiveIndex,
  resolveSelectDisplayText,
  resolveSelectFilteredOptions,
  commitSelectOption,
  clearSelectValue,
  getSelectSelectedValues,
  getSelectTriggerKeyIntent,
  findSelectTypeaheadIndex,
  isSelectTypeaheadCharacter,
  isSelectOptionSelected,
  shouldShowSelectClear,
  navigateSelectActiveIndex,
  getSelectClosedHomeEndIndex,
  serializeSelectFormValues,
  coerceSelectFormValue,
  type InputStatus,
  type SelectModelValue,
  type SelectOption,
  type SelectSearchDebouncer,
  type SelectValue
} from '@expcat/tigercat-core'
import { useControlledState } from '../../hooks/useControlledState'
import { useTigerConfig } from '../ConfigProvider'
import { useInputGroupContext } from '../InputGroup'
import { useFormItemControlContext } from '../FormItemContext'
import { isMultipleSelect, type SelectProps, type SelectRenderContext } from './types'

export function useSelectController(props: SelectProps) {
  const isMultiple = isMultipleSelect(props)
  const {
    options = [],
    size = 'md',
    disabled = false,
    placeholder,
    searchable = false,
    searchValue,
    defaultSearchValue = '',
    clearable = true,
    emptyText,
    maxTagCount,
    remote = false,
    searchDebounce = 0,
    creatable = false,
    createOptionText,
    virtual = false,
    listHeight = 256,
    labels: labelsOverride,
    onSearchChange,
    onSearchValueChange,
    onCreate,
    onOpenChange,
    className,
    value,
    defaultValue,
    onChange,
    open,
    defaultOpen = false,
    autoClearSearchValue = true,
    loading = false,
    status: statusProp,
    name,
    filterOption,
    locale,
    id,
    onBlur,
    renderOption
  } = props

  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getSelectLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )

  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const shakeTrigger = formItemControl?.shakeTrigger
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(
    typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof props['aria-labelledby'] === 'string' && props['aria-labelledby'].trim()
      ? props['aria-labelledby']
      : formItemControl?.labelId
  const ariaLabel =
    typeof props['aria-label'] === 'string' && props['aria-label'].trim()
      ? props['aria-label']
      : undefined

  const incomingValue =
    value !== undefined ? value : coerceSelectFormValue(formItemControl?.value, options, isMultiple)
  const [selected, setSelected] = useControlledState<SelectModelValue>({
    value: incomingValue,
    defaultValue: defaultValue ?? (isMultiple ? [] : undefined),
    onChange: (next) => {
      const normalized = normalizeSelectValue(next, isMultiple)
      if (isMultiple) {
        ;(onChange as ((value: SelectValue[]) => void) | undefined)?.(
          (Array.isArray(normalized) ? normalized : []) as SelectValue[]
        )
      } else {
        ;(onChange as ((value: SelectValue | undefined) => void) | undefined)?.(
          normalized as SelectValue | undefined
        )
      }
      formItemControl?.onChange?.(normalized)
    },
    postState: (next) => normalizeSelectValue(next, isMultiple)
  })

  const [isOpen, setOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const [searchQuery, setSearchQuery] = useControlledState({
    value: searchValue,
    defaultValue: defaultSearchValue,
    onChange: onSearchValueChange
  })

  const instanceId = useId()
  const listboxId = `tiger-select-listbox-${instanceId}`
  const getOptionId = (index: number) => getPickerOptionId(listboxId, index)

  const [activeIndex, setActiveIndex] = useState(-1)
  const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([])
  const optionCacheRef = useRef(new Map<SelectValue, SelectOption>())
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchDebouncerRef = useRef<SelectSearchDebouncer | null>(null)
  const activeValueRef = useRef<SelectValue | undefined>(undefined)
  const typeaheadRef = useRef(
    createSelectTypeaheadBuffer({
      onQuery: (query) => {
        const index = findSelectTypeaheadIndex(flatSelectableOptionsRef.current, query, -1)
        if (index >= 0) setActiveIndex(index)
      }
    })
  )

  const liveCreated = useMemo(
    () => pruneCreatedSelectOptions(createdOptions, options),
    [createdOptions, options]
  )
  const allOptions = useMemo(
    () => [...flattenSelectOptions(options), ...liveCreated],
    [options, liveCreated]
  )
  const filteredOptions = useMemo(
    () =>
      resolveSelectFilteredOptions(options, searchQuery, {
        searchable,
        remote,
        filterOption
      }),
    [filterOption, options, remote, searchable, searchQuery]
  )
  const creatableOption = useMemo(
    () =>
      resolveCreatableSelectOption([...options, ...liveCreated], searchQuery, {
        creatable: creatable && searchable
      }),
    [creatable, liveCreated, options, searchable, searchQuery]
  )
  const flatSelectableOptions = useMemo(() => {
    const flat = flattenSelectOptions(filteredOptions)
    return creatableOption ? [...flat, creatableOption] : flat
  }, [creatableOption, filteredOptions])
  const flatSelectableOptionsRef = useRef(flatSelectableOptions)
  flatSelectableOptionsRef.current = flatSelectableOptions

  const selectedValues = getSelectSelectedValues(selected, isMultiple)
  optionCacheRef.current = rememberSelectOptions(optionCacheRef.current, allOptions, selectedValues)

  const displayText = resolveSelectDisplayText({
    value: selected,
    multiple: isMultiple,
    options,
    createdOptions: liveCreated,
    optionCache: optionCacheRef.current,
    placeholder: resolveLocaleText(labels.placeholder, placeholder),
    maxTagCount,
    moreCountText: labels.moreCountText
  })
  const showClear = shouldShowSelectClear({
    clearable,
    disabled: effectiveDisabled,
    value: selected,
    multiple: isMultiple
  })
  const createOptionLabel = createOptionText
    ? createOptionText.includes('{label}')
      ? createOptionText
      : `${createOptionText} "{label}"`
    : labels.createOptionLabel

  const closeDropdown = useCallback(() => {
    setOpen(false)
    setSearchQuery('')
    searchDebouncerRef.current?.schedule('')
    setActiveIndex(-1)
  }, [setOpen, setSearchQuery])

  const openDropdown = useCallback(() => {
    if (effectiveDisabled) return
    setOpen(true)
  }, [effectiveDisabled, setOpen])

  const toggleDropdown = useCallback(() => {
    if (effectiveDisabled) return
    if (isOpen) closeDropdown()
    else openDropdown()
  }, [closeDropdown, effectiveDisabled, isOpen, openDropdown])

  const selectOption = useCallback(
    (option: SelectOption) => {
      if (option.disabled || effectiveDisabled) return
      if (creatableOption && option.value === creatableOption.value) {
        setCreatedOptions((current) =>
          current.some((item) => item.value === option.value) ? current : [...current, option]
        )
        onCreate?.(option)
      }
      const next = commitSelectOption({ option, value: selected, multiple: isMultiple })
      setSelected(next)
      activeValueRef.current = option.value
      if (isMultiple) {
        const nextIndex = flatSelectableOptions.findIndex((item) => item.value === option.value)
        setActiveIndex(nextIndex)
        if (autoClearSearchValue) {
          setSearchQuery('')
          searchDebouncerRef.current?.schedule('')
        }
        return
      }
      closeDropdown()
      requestAnimationFrame(() => triggerRef.current?.focus())
    },
    [
      autoClearSearchValue,
      closeDropdown,
      creatableOption,
      effectiveDisabled,
      flatSelectableOptions,
      isMultiple,
      onCreate,
      selected,
      setSearchQuery,
      setSelected
    ]
  )

  const clearSelection = useCallback(
    (event?: { stopPropagation: () => void }) => {
      event?.stopPropagation()
      setSelected(clearSelectValue(isMultiple))
      requestAnimationFrame(() => triggerRef.current?.focus())
    },
    [isMultiple, setSelected]
  )

  const updateSearchValue = useCallback(
    (query: string) => {
      setSearchQuery(query)
      searchDebouncerRef.current?.schedule(query)
    },
    [setSearchQuery]
  )

  useEffect(() => {
    searchDebouncerRef.current?.cancel()
    searchDebouncerRef.current = createSelectSearchDebouncer({
      delay: searchDebounce,
      onSearchChange: (query) => onSearchChange?.(query)
    })
    return () => searchDebouncerRef.current?.cancel()
  }, [onSearchChange, searchDebounce])

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1)
      activeValueRef.current = undefined
      return
    }
    setActiveIndex((previous) => {
      const next = resolveSelectActiveIndex({
        items: flatSelectableOptions,
        previousIndex: previous,
        previousValue: activeValueRef.current,
        selectedValues,
        reason: previous >= 0 ? 'filter' : 'open'
      })
      activeValueRef.current = flatSelectableOptions[next]?.value
      return next
    })
  }, [flatSelectableOptions, isOpen, selectedValues])

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus()
    }
  }, [isOpen, searchable])

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (effectiveDisabled) return
    const fromSearchInput = event.currentTarget.tagName === 'INPUT'
    if (!isOpen && isSelectTypeaheadCharacter(event.key, event)) {
      event.preventDefault()
      openDropdown()
      if (searchable) updateSearchValue(event.key)
      else typeaheadRef.current.push(event.key)
      return
    }
    const intent = getSelectTriggerKeyIntent({
      key: event.key,
      open: isOpen,
      searchable,
      clearable,
      hasValue: shouldShowSelectClear({
        clearable: true,
        disabled: false,
        value: selected,
        multiple: isMultiple
      }),
      fromSearchInput
    })
    switch (intent.type) {
      case 'open':
        event.preventDefault()
        openDropdown()
        return
      case 'close':
        if (event.key !== 'Tab') event.preventDefault()
        closeDropdown()
        triggerRef.current?.focus()
        return
      case 'clear':
        event.preventDefault()
        clearSelection()
        return
      case 'prevent-scroll': {
        event.preventDefault()
        openDropdown()
        const next = getSelectClosedHomeEndIndex(flatSelectableOptions, event.key as 'Home' | 'End')
        setActiveIndex(next)
        return
      }
      case 'navigate': {
        event.preventDefault()
        setActiveIndex((current) => {
          const next = navigateSelectActiveIndex(flatSelectableOptions, current, intent.key)
          activeValueRef.current = flatSelectableOptions[next]?.value
          return next
        })
        return
      }
      case 'select-active': {
        event.preventDefault()
        const option = flatSelectableOptions[activeIndex]
        if (option) selectOption(option)
        return
      }
      default:
        return
    }
  }

  const handleFocusOut = (event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null
    if (
      (rootRef.current && next && rootRef.current.contains(next)) ||
      (dropdownRef.current && next && dropdownRef.current.contains(next))
    ) {
      return
    }
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const comboboxAria = getPickerComboboxAria({
    expanded: isOpen,
    listboxId,
    activeIndex
  })
  const listboxAria = getPickerListboxAria({ id: listboxId })

  const renderCtx: SelectRenderContext = {
    listboxId,
    listboxAria,
    multiple: isMultiple,
    loading,
    getOptionId,
    activeIndex,
    setActiveIndex,
    size,
    virtual,
    listHeight,
    emptyText: resolveLocaleText(labels.emptyText, emptyText),
    loadingText: labels.loadingText,
    createOptionLabel,
    selectOption,
    isSelected: (option) => isSelectOptionSelected(option, selected, isMultiple),
    filteredOptions,
    creatableOption,
    renderOption
  }

  return {
    rootRef,
    triggerRef,
    searchInputRef,
    dropdownRef,
    listboxId,
    comboboxAria,
    listboxAria,
    isOpen,
    isMultiple,
    searchable,
    effectiveDisabled,
    status,
    shakeTrigger,
    effectiveId,
    effectiveName,
    describedBy,
    labelledby,
    ariaLabel,
    required: formItemControl?.required,
    displayText,
    placeholder: resolveLocaleText(labels.placeholder, placeholder),
    showClear,
    searchQuery,
    searchPlaceholder: resolveLocaleText(labels.searchPlaceholder),
    clearAriaLabel: labels.clearAriaLabel,
    doneText: labels.doneText,
    loading,
    size,
    className: getSelectRootClasses(inputGroup != null, className),
    triggerClasses: getSelectTriggerClasses({
      size,
      disabled: effectiveDisabled,
      isOpen,
      status,
      hasClear: showClear
    }),
    chromeAttr: TIGER_CHROME_ATTR,
    hiddenValues: effectiveName ? serializeSelectFormValues(selected, isMultiple) : [],
    renderCtx,
    toggleDropdown,
    closeDropdown,
    openDropdown,
    clearSelection,
    updateSearchValue,
    handleTriggerKeyDown,
    handleFocusOut,
    rootClassName: classNames,
    focusCombobox: () => {
      if (searchable && isOpen) searchInputRef.current?.focus()
      else triggerRef.current?.focus()
    }
  }
}
