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
  classNames,
  icon20ViewBox,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core'

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
  onSearch?: (value: string) => void
}

const AUTOCOMPLETE_KEYS = new Set<string>([
  'value',
  'options',
  'placeholder',
  'size',
  'disabled',
  'clearable',
  'notFoundText',
  'filterOption',
  'defaultActiveFirstOption',
  'allowFreeInput',
  'onChange',
  'onSelect',
  'onSearch'
])

export const AutoComplete: React.FC<AutoCompleteProps> = (props) => {
  const {
    value = '',
    options = [],
    placeholder = '',
    size = 'md',
    disabled = false,
    clearable = false,
    notFoundText = 'No matches found',
    filterOption = true,
    defaultActiveFirstOption = true,
    className,
    onChange,
    onSelect,
    onSearch,
    ...rest
  } = props

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
  const [inputValue, setInputValue] = useState(String(value ?? ''))
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value
  useEffect(() => {
    setInputValue(String(value ?? ''))
  }, [value])

  const filteredOptions = useMemo(
    () => filterAutoCompleteOptions(options, inputValue, filterOption),
    [options, inputValue, filterOption]
  )

  const showClearButton = clearable && !disabled && inputValue !== ''

  function openDropdown() {
    if (disabled) return
    setIsOpen(true)
    if (defaultActiveFirstOption && filteredOptions.length > 0) {
      setActiveIndex(0)
    }
  }

  function closeDropdown() {
    setIsOpen(false)
    setActiveIndex(-1)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    onChange?.(val)
    onSearch?.(val)
    if (!isOpen) {
      setIsOpen(true)
    }
    if (defaultActiveFirstOption) {
      const newFiltered = filterAutoCompleteOptions(options, val, filterOption)
      setActiveIndex(newFiltered.length > 0 ? 0 : -1)
    }
  }

  function handleSelect(option: AutoCompleteOption) {
    if (option.disabled) return
    setInputValue(option.label)
    onChange?.(option.value)
    onSelect?.(option.value, option)
    closeDropdown()
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    setInputValue('')
    onChange?.('')
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
        e.preventDefault()
        if (filteredOptions.length > 0) {
          setActiveIndex((prev) => {
            let next = prev + 1
            while (next < filteredOptions.length && filteredOptions[next].disabled) next++
            return next < filteredOptions.length ? next : prev
          })
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (filteredOptions.length > 0) {
          setActiveIndex((prev) => {
            let p = prev - 1
            while (p >= 0 && filteredOptions[p].disabled) p--
            return p >= 0 ? p : prev
          })
        }
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelect(filteredOptions[activeIndex])
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
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        autoComplete="off"
        onChange={handleInput}
        onFocus={openDropdown}
        onKeyDown={handleKeyDown}
      />

      {showClearButton && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tiger-autocomplete-clear,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-autocomplete-clear-hover,var(--tiger-text,#111827))] transition-colors"
          aria-label="Clear"
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
        <div id={listboxId} role="listbox" className={autoCompleteDropdownClasses}>
          {filteredOptions.map((option, index) => (
            <div
              key={String(option.value)}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={String(option.value) === String(value)}
              aria-disabled={option.disabled}
              className={getAutoCompleteOptionClasses(
                String(option.value) === String(value),
                !!option.disabled,
                size
              )}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setActiveIndex(index)}>
              {option.label}
            </div>
          ))}
        </div>
      )}

      {isOpen && inputValue && filteredOptions.length === 0 && (
        <div className={classNames(autoCompleteDropdownClasses, autoCompleteEmptyStateClasses)}>
          {notFoundText}
        </div>
      )}
    </div>
  )
}
