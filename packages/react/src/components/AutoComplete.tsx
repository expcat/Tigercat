import React, { useState, useRef, useEffect, useId, useMemo } from 'react'
import type {
  AutoCompleteOption,
  AutoCompleteProps as CoreAutoCompleteProps
} from '@expcat/tigercat-core'
import {
  autoCompleteBaseClasses,
  autoCompleteDropdownClasses,
  autoCompleteEmptyStateClasses,
  getAutoCompleteInputClasses,
  getAutoCompleteOptionClasses,
  filterAutoCompleteOptions,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  classNames,
  resolveLocaleText,
  mergeTigerLocale,
  icon20ViewBox,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface AutoCompleteProps
  extends
    CoreAutoCompleteProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onChange'> {
  /** Controlled value */
  value?: string | number
  /** Called when value changes (input or selection) */
  onChange?: (value: string | number) => void
  /** Called when an option is selected */
  onSelect?: (value: string | number, option: AutoCompleteOption) => void
  /** Called when search text changes */
  onSearchChange?: (value: string) => void
}

const AUTOCOMPLETE_KEYS = new Set<string>([
  'value',
  'options',
  'placeholder',
  'searchValue',
  'defaultSearchValue',
  'size',
  'disabled',
  'clearable',
  'emptyText',
  'filterOption',
  'defaultActiveFirstOption',
  'allowFreeInput',
  'locale',
  'onChange',
  'onSelect',
  'onSearchChange'
])

export const AutoComplete: React.FC<AutoCompleteProps> = (props) => {
  const {
    value = '',
    options = [],
    placeholder = '',
    searchValue,
    defaultSearchValue = '',
    size = 'md',
    disabled = false,
    clearable = false,
    emptyText,
    filterOption = true,
    defaultActiveFirstOption = true,
    allowFreeInput = true,
    locale,
    className,
    onChange,
    onSelect,
    onSearchChange,
    ...rest
  } = props
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const resolvedNotFoundText = resolveLocaleText(
    'No matches found',
    emptyText,
    mergedLocale?.common?.emptyText
  )

  // Filter out component-specific props from div props
  const divProps: Record<string, unknown> = {}
  for (const key of Object.keys(rest)) {
    if (!AUTOCOMPLETE_KEYS.has(key)) {
      divProps[key] = (rest as Record<string, unknown>)[key]
    }
  }

  const instanceId = useId()
  const listboxId = `tiger-autocomplete-listbox-${instanceId}`

  const [isOpen, setIsOpen] = useState(false)
  const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState(
    String(searchValue ?? value ?? defaultSearchValue ?? '')
  )
  const inputValue = searchValue ?? uncontrolledSearchValue
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value
  useEffect(() => {
    if (searchValue !== undefined) {
      return
    }
    setUncontrolledSearchValue(String(value ?? defaultSearchValue ?? ''))
  }, [defaultSearchValue, searchValue, value])

  const filteredOptions = useMemo(
    () => filterAutoCompleteOptions(options, inputValue, filterOption),
    [options, inputValue, filterOption]
  )

  const showClearButton = clearable && !disabled && inputValue !== ''

  function openDropdown() {
    if (disabled) return
    setIsOpen(true)
    setActiveIndex(getInitialPickerActiveIndex(filteredOptions, defaultActiveFirstOption))
  }

  function closeDropdown() {
    setIsOpen(false)
    setActiveIndex(-1)
  }

  // When free input is disallowed, snap the committed value to an existing
  // option on blur/Enter — reverting input that doesn't match any option.
  function constrainToOption() {
    if (allowFreeInput) return
    const match = options.find((o) => !o.disabled && o.label === inputValue)
    if (match) {
      if (String(match.value) !== String(value)) {
        onChange?.(match.value)
        onSelect?.(match.value, match)
      }
      return
    }
    const current = options.find((o) => String(o.value) === String(value))
    const revertLabel = current ? current.label : ''
    if (revertLabel !== inputValue) {
      setUncontrolledSearchValue(revertLabel)
      onChange?.(current ? current.value : '')
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (searchValue === undefined) {
      setUncontrolledSearchValue(val)
    }
    onChange?.(val)
    onSearchChange?.(val)
    if (!isOpen) {
      setIsOpen(true)
    }
    if (defaultActiveFirstOption) {
      const newFiltered = filterAutoCompleteOptions(options, val, filterOption)
      setActiveIndex(getInitialPickerActiveIndex(newFiltered, true))
    }
  }

  function handleSelect(option: AutoCompleteOption) {
    if (option.disabled) return
    if (searchValue === undefined) {
      setUncontrolledSearchValue(option.label)
    }
    onSearchChange?.(option.label)
    onChange?.(option.value)
    onSelect?.(option.value, option)
    closeDropdown()
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    if (searchValue === undefined) {
      setUncontrolledSearchValue('')
    }
    onChange?.('')
    onSearchChange?.('')
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        openDropdown()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        e.preventDefault()
        setActiveIndex((prev) => getPickerNavigationIndex(filteredOptions, prev, e.key))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelect(filteredOptions[activeIndex])
        } else {
          constrainToOption()
          closeDropdown()
        }
        break
      case 'Escape':
        e.preventDefault()
        closeDropdown()
        break
    }
  }

  // Click outside
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  const containerClasses = classNames(autoCompleteBaseClasses, className)

  return (
    <div ref={containerRef} className={containerClasses} {...divProps}>
      <input
        ref={inputRef}
        type="text"
        className={getAutoCompleteInputClasses(size, disabled, isOpen)}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        {...getPickerComboboxAria({ expanded: isOpen, listboxId, activeIndex })}
        autoComplete="off"
        onChange={handleInput}
        onFocus={openDropdown}
        onKeyDown={handleKeyDown}
        onBlur={constrainToOption}
      />

      {showClearButton && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tiger-autocomplete-clear,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-autocomplete-clear-hover,var(--tiger-text,#111827))] transition-colors"
          aria-label={resolveLocaleText('Clear', mergedLocale?.common?.clearText)}
          onClick={handleClear}>
          <svg
            className="w-4 h-4"
            viewBox={icon20ViewBox}
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path d={closeSolidIcon20PathD} fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {isOpen && filteredOptions.length > 0 && (
        <div {...getPickerListboxAria({ id: listboxId })} className={autoCompleteDropdownClasses}>
          {filteredOptions.map((option, index) => (
            <div
              key={String(option.value)}
              id={getPickerOptionId(listboxId, index)}
              {...getPickerOptionAria({
                selected: String(option.value) === String(value),
                disabled: !!option.disabled
              })}
              className={getAutoCompleteOptionClasses(
                String(option.value) === String(value),
                !!option.disabled,
                size
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setActiveIndex(index)}>
              {option.label}
            </div>
          ))}
        </div>
      )}

      {isOpen && inputValue && filteredOptions.length === 0 && (
        <div className={classNames(autoCompleteDropdownClasses, autoCompleteEmptyStateClasses)}>
          {resolvedNotFoundText}
        </div>
      )}
    </div>
  )
}
