import React, { useState, useRef, useEffect } from 'react'
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

  const filteredOptions = searchable && searchQuery
    ? filterOptions(options, searchQuery)
    : options

  const hasOptions = filteredOptions.length > 0

  const getAllOptions = (): SelectOption[] => {
    const allOptions: SelectOption[] = []
    options.forEach((item) => {
      if (isOptionGroup(item)) {
        allOptions.push(...(item as SelectOptionGroup).options)
      } else {
        allOptions.push(item as SelectOption)
      }
    })
    return allOptions
  }

  const getDisplayText = (): string => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) {
        return placeholder
      }
      const selectedOptions = getAllOptions().filter((opt) => value.includes(opt.value))
      return selectedOptions.map((opt) => opt.label).join(', ')
    } else {
      if (value === undefined || value === null || value === '') {
        return placeholder
      }
      const option = getAllOptions().find((opt) => opt.value === value)
      return option ? option.label : placeholder
    }
  }

  const displayText = getDisplayText()

  const showClearButton =
    clearable &&
    !disabled &&
    value !== undefined &&
    value !== null &&
    value !== '' &&
    (!Array.isArray(value) || value.length > 0)

  const isSelected = (option: SelectOption): boolean => {
    if (multiple && Array.isArray(value)) {
      return value.includes(option.value)
    }
    return value === option.value
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const closeDropdown = () => {
    setIsOpen(false)
    setSearchQuery('')
  }

  const selectOption = (option: SelectOption) => {
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
  }

  const clearSelection = (event: React.MouseEvent) => {
    event.stopPropagation()
    const newValue = multiple ? [] : undefined
    onChange?.(newValue)
  }

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen]) // Only re-run when dropdown opens/closes

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
  }, [isOpen])

  const triggerClasses = getSelectTriggerClasses(size, disabled, isOpen)

  const renderOption = (option: SelectOption) => {
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
  }

  const renderOptions = () => {
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
  }

  return (
    <div className={classNames(selectBaseClasses, className)} {...props}>
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
