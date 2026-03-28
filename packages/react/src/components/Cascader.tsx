import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  classNames,
  cascaderBaseClasses,
  cascaderDropdownClasses,
  cascaderColumnClasses,
  cascaderSearchInputClasses,
  cascaderEmptyStateClasses,
  cascaderSearchResultClasses,
  getCascaderTriggerClasses,
  getCascaderOptionClasses,
  getCascaderColumns,
  getCascaderDisplayLabel,
  flattenCascaderOptions,
  filterCascaderOptions,
  isCascaderOptionExpandable,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  type CascaderOption,
  type CascaderValue,
  type CascaderProps as CoreCascaderProps
} from '@expcat/tigercat-core'

type CascaderDivProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>

export interface CascaderProps extends Omit<CoreCascaderProps, 'className'>, CascaderDivProps {
  /** Current selected value path */
  value?: CascaderValue
  /** Change handler */
  onChange?: (value: CascaderValue) => void
  /** Additional class name */
  className?: string
}

const CASCADER_KEYS = new Set([
  'options',
  'value',
  'onChange',
  'placeholder',
  'size',
  'disabled',
  'clearable',
  'showSearch',
  'expandTrigger',
  'changeOnSelect',
  'separator',
  'notFoundText',
  'className'
])

export const Cascader: React.FC<CascaderProps> = (props) => {
  const {
    options = [],
    value = [],
    onChange,
    placeholder = 'Please select',
    size = 'md',
    disabled = false,
    clearable = true,
    showSearch = false,
    expandTrigger = 'click',
    changeOnSelect = false,
    separator = ' / ',
    notFoundText = 'No results found',
    className
  } = props

  const divProps: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) {
    if (!CASCADER_KEYS.has(k)) divProps[k] = v
  }

  const instanceId = useId()
  const listboxId = `tiger-cascader-listbox-${instanceId}`

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePath, setActivePath] = useState<CascaderValue>([])

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayLabel = useMemo(
    () => getCascaderDisplayLabel(options, value, separator),
    [options, value, separator]
  )

  const columns = useMemo(() => getCascaderColumns(options, activePath), [options, activePath])

  const isSearchMode = showSearch && searchQuery.length > 0

  const flattenedOptions = useMemo(() => {
    if (!showSearch) return []
    return flattenCascaderOptions(options)
  }, [showSearch, options])

  const searchResults = useMemo(() => {
    if (!isSearchMode) return []
    return filterCascaderOptions(flattenedOptions, searchQuery, showSearch)
  }, [isSearchMode, flattenedOptions, searchQuery, showSearch])

  const triggerClasses = useMemo(
    () => classNames(getCascaderTriggerClasses(size, disabled, isOpen), className),
    [size, disabled, isOpen, className]
  )

  // Sync active path when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setActivePath(value ? [...value] : [])
      setSearchQuery('')
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [isOpen])

  const toggleOpen = useCallback(() => {
    if (disabled) return
    setIsOpen((prev) => !prev)
  }, [disabled])

  const handleOptionClick = useCallback(
    (option: CascaderOption, level: number) => {
      if (option.disabled) return

      const newPath = activePath.slice(0, level)
      newPath.push(option.value)
      setActivePath(newPath)

      const hasChildren = isCascaderOptionExpandable(option)

      if (!hasChildren) {
        onChange?.(newPath)
        setIsOpen(false)
      } else if (changeOnSelect) {
        onChange?.(newPath)
      }
    },
    [activePath, onChange, changeOnSelect]
  )

  const handleOptionHover = useCallback(
    (option: CascaderOption, level: number) => {
      if (expandTrigger !== 'hover' || option.disabled) return

      const newPath = activePath.slice(0, level)
      newPath.push(option.value)
      setActivePath(newPath)
    },
    [expandTrigger, activePath]
  )

  const handleSearchResultClick = useCallback(
    (valuePath: CascaderValue, itemDisabled: boolean) => {
      if (itemDisabled) return
      onChange?.(valuePath)
      setIsOpen(false)
    },
    [onChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.([])
    },
    [onChange]
  )

  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          toggleOpen()
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          if (!isOpen) setIsOpen(true)
          break
      }
    },
    [toggleOpen, isOpen]
  )

  const hasValue = value && value.length > 0
  const showClearBtn = clearable && hasValue && !disabled

  return (
    <div className={cascaderBaseClasses} data-testid="cascader" {...divProps}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={triggerClasses}
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}>
        <span
          className={classNames(
            'flex-1 text-left truncate',
            !hasValue && 'text-[var(--tiger-cascader-placeholder,var(--tiger-text-muted,#9ca3af))]'
          )}>
          {hasValue ? displayLabel : placeholder}
        </span>
        <span className="flex items-center gap-1">
          {showClearBtn && (
            <span
              className="flex items-center"
              role="button"
              aria-label="Clear selection"
              onClick={handleClear}>
              <svg
                className="w-4 h-4 text-[var(--tiger-cascader-icon,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-cascader-icon-hover,var(--tiger-text-muted,#6b7280))]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox={icon20ViewBox}
                fill="currentColor">
                <path fillRule="evenodd" d={closeSolidIcon20PathD} clipRule="evenodd" />
              </svg>
            </span>
          )}
          <svg
            className={classNames(
              'w-5 h-5 text-[var(--tiger-cascader-icon,var(--tiger-text-muted,#9ca3af))] transition-transform',
              isOpen && 'rotate-180'
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={icon20ViewBox}
            fill="currentColor">
            <path fillRule="evenodd" d={chevronDownSolidIcon20PathD} clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={classNames(cascaderDropdownClasses, isSearchMode && 'flex-col')}>
          {/* Search input */}
          {showSearch && (
            <input
              type="text"
              className={cascaderSearchInputClasses}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search options"
            />
          )}

          {isSearchMode ? (
            // Search results
            searchResults.length === 0 ? (
              <div className={cascaderEmptyStateClasses}>{notFoundText}</div>
            ) : (
              <div className="max-h-64 overflow-auto" role="listbox" id={listboxId}>
                {searchResults.map((item) => (
                  <div
                    key={item.valuePath.join(',')}
                    className={classNames(
                      cascaderSearchResultClasses,
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    role="option"
                    aria-selected={value?.join(',') === item.valuePath.join(',')}
                    aria-disabled={item.disabled}
                    onClick={() => handleSearchResultClick(item.valuePath, item.disabled)}>
                    {item.label}
                  </div>
                ))}
              </div>
            )
          ) : (
            // Cascading columns
            <div className="flex">
              {columns.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className={cascaderColumnClasses}
                  role="listbox"
                  id={colIndex === 0 ? listboxId : undefined}
                  aria-label={`Level ${colIndex + 1}`}>
                  {col.options.map((option) => {
                    const isSelected = col.selectedValue === option.value
                    const hasChildren = isCascaderOptionExpandable(option)

                    return (
                      <div
                        key={option.value}
                        className={getCascaderOptionClasses(isSelected, !!option.disabled, size)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        onClick={() => handleOptionClick(option, colIndex)}
                        onMouseEnter={() => handleOptionHover(option, colIndex)}>
                        <span className="flex-1 truncate">{option.label}</span>
                        {hasChildren && (
                          <svg
                            className="w-4 h-4 text-[var(--tiger-text-muted,#9ca3af)]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
