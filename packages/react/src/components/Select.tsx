import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
  type SelectProps as CoreSelectProps,
} from '@tigercat/core'

export interface SelectProps extends CoreSelectProps {
  /**
   * Current selected value (single or multiple)
   */
  value?: string | number | (string | number)[]

  /**
   * Change event handler
   */
  onChange?: (value: string | number | (string | number)[] | undefined) => void

  /**
   * Search event handler
   */
  onSearch?: (query: string) => void

  /**
   * Additional CSS classes
   */
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  value,
  options = [],
  size = 'md',
  disabled = false,
  placeholder = 'Select an option',
  searchable = false,
  multiple = false,
  clearable = true,
  noOptionsText = 'No options found',
  noDataText = 'No options available',
  onChange,
  onSearch,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = useMemo(() => 
    searchable && searchQuery ? filterOptions(options, searchQuery) : options,
    [searchable, searchQuery, options]
  )

  const hasOptions = useMemo(() => filteredOptions.length > 0, [filteredOptions])

  const allOptions = useMemo((): SelectOption[] => {
    const result: SelectOption[] = []
    options.forEach((item) => {
      if (isOptionGroup(item)) {
        result.push(...(item as SelectOptionGroup).options)
      } else {
        result.push(item as SelectOption)
      }
    })
    return result
  }, [options])

  const displayText = useMemo((): string => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) {
        return placeholder
      }
      const selectedOptions = allOptions.filter((opt) => value.includes(opt.value))
      return selectedOptions.map((opt) => opt.label).join(', ')
    } else {
      if (value === undefined || value === null || value === '') {
        return placeholder
      }
      const option = allOptions.find((opt) => opt.value === value)
      return option ? option.label : placeholder
    }
  }, [multiple, value, placeholder, allOptions])

  const showClearButton = useMemo(() =>
    clearable &&
    !disabled &&
    value !== undefined &&
    value !== null &&
    value !== '' &&
    (!Array.isArray(value) || value.length > 0),
    [clearable, disabled, value]
  )

  const isSelected = useCallback((option: SelectOption): boolean => {
    if (multiple && Array.isArray(value)) {
      return value.includes(option.value)
    }
    return value === option.value
  }, [multiple, value])

  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }, [disabled, isOpen])

  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    setSearchQuery('')
  }, [])

  const selectOption = useCallback((option: SelectOption) => {
    if (option.disabled) {
      return
    }

    if (multiple) {
      const currentValue = Array.isArray(value) ? value : []
      let newValue: (string | number)[]

      if (currentValue.includes(option.value)) {
        newValue = currentValue.filter((v) => v !== option.value)
      } else {
        newValue = [...currentValue, option.value]
      }

      onChange?.(newValue)
    } else {
      onChange?.(option.value)
      closeDropdown()
    }
  }, [multiple, value, onChange, closeDropdown])

  const clearSelection = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    const newValue = multiple ? [] : undefined
    onChange?.(newValue)
  }, [multiple, onChange])

  const handleSearchInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }, [onSearch])

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeDropdown()
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [isOpen]) // closeDropdown is stable (memoized with no deps), no need to include it

  const triggerClasses = useMemo(() => 
    getSelectTriggerClasses(size, disabled, isOpen),
    [size, disabled, isOpen]
  )

  const renderOption = useCallback((option: SelectOption) => {
    const optionSelected = isSelected(option)

    return (
      <button
        key={option.value}
        type="button"
        className={getSelectOptionClasses(optionSelected, !!option.disabled, size)}
        disabled={option.disabled}
        onClick={() => selectOption(option)}
      >
        <span className="flex items-center justify-between w-full">
          <span>{option.label}</span>
          {optionSelected && (
            <svg
              className="w-5 h-5 text-[var(--tiger-primary,#2563eb)]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </button>
    )
  }, [isSelected, size, selectOption])

  const renderOptions = useCallback(() => {
    if (!hasOptions) {
      return (
        <div className={selectEmptyStateClasses}>
          {options.length === 0 ? noDataText : noOptionsText}
        </div>
      )
    }

    return filteredOptions.map((item) => {
      if (isOptionGroup(item)) {
        const group = item as SelectOptionGroup
        return (
          <div key={group.label}>
            <div className={selectGroupLabelClasses}>{group.label}</div>
            {group.options.map((option) => renderOption(option))}
          </div>
        )
      } else {
        return renderOption(item as SelectOption)
      }
    })
  }, [hasOptions, options.length, noDataText, noOptionsText, filteredOptions, renderOption])

  const containerClasses = useMemo(() => classNames(selectBaseClasses, className), [className])

  return (
    <div className={containerClasses} {...props}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        className={triggerClasses}
        disabled={disabled}
        onClick={toggleDropdown}
      >
        <span
          className={classNames(
            'flex-1 text-left truncate',
            displayText === placeholder && 'text-gray-400'
          )}
        >
          {displayText}
        </span>
        <span className="flex items-center gap-1">
          {showClearButton && (
            <span className="inline-flex" onClick={clearSelection}>
              <svg
                className="w-4 h-4 text-gray-400 hover:text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
          <span className={classNames('inline-flex', isOpen && 'rotate-180')}>
            <svg
              className="w-5 h-5 text-gray-400 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div ref={dropdownRef} className={selectDropdownBaseClasses}>
          {/* Search input */}
          {searchable && (
            <input
              ref={searchInputRef}
              type="text"
              className={selectSearchInputClasses}
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchInput}
            />
          )}
          {/* Options list */}
          {renderOptions()}
        </div>
      )}
    </div>
  )
}
