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
  getCascaderVirtualItemHeight,
  getCascaderVirtualRange,
  getCascaderVirtualAlignScrollTop,
  CASCADER_DEFAULT_LIST_HEIGHT,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionAria,
  getPickerTriggerKeyAction,
  getPickerNavigationIndex,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  resolveLocaleText,
  mergeTigerLocale,
  type CascaderOption,
  type CascaderValue,
  type CascaderFlattenedOption,
  type CascaderProps as CoreCascaderProps,
  type ComponentSize,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

type CascaderDivProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>

export interface CascaderProps extends Omit<CoreCascaderProps, 'className'>, CascaderDivProps {
  /** Current selected value path */
  value?: CascaderValue
  /** Change handler */
  onChange?: (value: CascaderValue) => void
  /** Called when search text changes */
  onSearchChange?: (value: string) => void
  /** Additional class name */
  className?: string
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
}

const CASCADER_KEYS = new Set([
  'options',
  'value',
  'onChange',
  'placeholder',
  'size',
  'disabled',
  'clearable',
  'searchable',
  'searchValue',
  'defaultSearchValue',
  'onSearchChange',
  'expandTrigger',
  'changeOnSelect',
  'separator',
  'emptyText',
  'virtual',
  'listHeight',
  'className',
  'locale'
])

const EMPTY_CASCADER_VALUE: CascaderValue = []

function selectedIndexInColumn(
  options: CascaderOption[],
  selectedValue: string | number | undefined
): number {
  if (selectedValue === undefined) return -1
  return options.findIndex((option) => option.value === selectedValue)
}

/**
 * Virtualized cascader column / search list. Mirrors Select's fixed-size
 * `fixedSizeStrategy` + `getRange` window, and keeps `activeIndex` in view.
 */
const VirtualCascaderList = <T extends { disabled?: boolean }>({
  items,
  size,
  listHeight,
  activeIndex,
  onActiveIndexChange,
  className,
  listboxProps,
  renderItem
}: {
  items: T[]
  size: ComponentSize
  listHeight: number
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  className?: string
  listboxProps?: Record<string, unknown>
  renderItem: (item: T, index: number) => React.ReactNode
}): React.ReactElement => {
  const itemHeight = getCascaderVirtualItemHeight(size)
  const itemCount = items.length
  const clampedActiveIndex = activeIndex >= 0 && activeIndex < itemCount ? activeIndex : -1
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(() =>
    getCascaderVirtualAlignScrollTop(0, clampedActiveIndex, itemHeight, listHeight)
  )
  const maxScrollTop = Math.max(0, itemCount * itemHeight - listHeight)
  const effectiveScrollTop = Math.min(Math.max(0, scrollTop), maxScrollTop)
  const { startIndex, endIndex, totalHeight } = getCascaderVirtualRange(
    effectiveScrollTop,
    listHeight,
    itemCount,
    itemHeight
  )
  const fromIndex = itemCount <= 0 ? 0 : Math.min(startIndex, endIndex, itemCount - 1)
  const toIndex = itemCount <= 0 ? -1 : Math.min(endIndex, itemCount - 1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (el.scrollTop !== effectiveScrollTop) el.scrollTop = effectiveScrollTop
  }, [effectiveScrollTop])

  useEffect(() => {
    const el = containerRef.current
    if (!el || clampedActiveIndex < 0) return
    const next = getCascaderVirtualAlignScrollTop(
      el.scrollTop,
      clampedActiveIndex,
      itemHeight,
      listHeight
    )
    if (next !== el.scrollTop) {
      el.scrollTop = next
      setScrollTop(next)
    }
  }, [clampedActiveIndex, itemHeight, listHeight])

  const visible: React.ReactNode[] = []
  if (fromIndex <= toIndex) {
    for (let i = fromIndex; i <= toIndex; i++) {
      visible.push(renderItem(items[i], i))
    }
  }

  return (
    <div
      ref={containerRef}
      data-tiger-cascader-virtual=""
      tabIndex={0}
      className={className}
      style={{ maxHeight: `${listHeight}px`, overflowY: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') {
          return
        }
        e.preventDefault()
        e.stopPropagation()
        onActiveIndexChange(getPickerNavigationIndex(items, clampedActiveIndex, e.key))
      }}
      {...listboxProps}>
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${fromIndex * itemHeight}px)` }}>{visible}</div>
      </div>
    </div>
  )
}

export const Cascader: React.FC<CascaderProps> = (props) => {
  const {
    options = [],
    value = EMPTY_CASCADER_VALUE,
    onChange,
    placeholder = 'Please select',
    size = 'md',
    disabled = false,
    clearable = true,
    searchable = false,
    searchValue,
    defaultSearchValue = '',
    onSearchChange,
    expandTrigger = 'click',
    changeOnSelect = false,
    separator = ' / ',
    emptyText,
    virtual = false,
    listHeight = CASCADER_DEFAULT_LIST_HEIGHT,
    className,
    locale
  } = props

  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )

  const divProps: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) {
    if (!CASCADER_KEYS.has(k)) divProps[k] = v
  }

  const instanceId = useId()
  const listboxId = `tiger-cascader-listbox-${instanceId}`

  const [isOpen, setIsOpen] = useState(false)
  const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState(defaultSearchValue)
  const searchQuery = searchValue ?? uncontrolledSearchValue
  const [activePath, setActivePath] = useState<CascaderValue>([])
  const [columnActiveIndices, setColumnActiveIndices] = useState<number[]>([])
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1)
  const [indexedSearchQuery, setIndexedSearchQuery] = useState(searchQuery)
  if (indexedSearchQuery !== searchQuery) {
    setIndexedSearchQuery(searchQuery)
    setSearchActiveIndex(-1)
  }
  const wasOpenRef = useRef(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const overlay = useAnchoredOverlay({
    enabled: isOpen,
    referenceRef: triggerRef,
    floatingRef: dropdownRef,
    placement: 'bottom-start',
    offset: 4,
    layout: 'fullscreen-sm',
    matchReferenceWidth: true,
    dismissOnOutside: true,
    dismissOnEscape: true,
    restoreFocusOnDismiss: true,
    onDismiss: () => setIsOpen(false)
  })

  const displayLabel = useMemo(
    () => getCascaderDisplayLabel(options, value, separator),
    [options, value, separator]
  )

  const columns = useMemo(() => getCascaderColumns(options, activePath), [options, activePath])

  const isSearchMode = searchable && searchQuery.length > 0

  const flattenedOptions = useMemo(() => {
    if (!searchable) return []
    return flattenCascaderOptions(options, [], [], changeOnSelect)
  }, [searchable, options, changeOnSelect])

  const searchResults = useMemo(() => {
    if (!isSearchMode) return []
    return filterCascaderOptions(flattenedOptions, searchQuery, searchable)
  }, [isSearchMode, flattenedOptions, searchQuery, searchable])

  const triggerClasses = useMemo(
    () => classNames(getCascaderTriggerClasses(size, disabled, isOpen), className),
    [size, disabled, isOpen, className]
  )

  const updateSearchValue = useCallback(
    (nextValue: string) => {
      if (searchValue === undefined) {
        setUncontrolledSearchValue(nextValue)
      }
      onSearchChange?.(nextValue)
    },
    [onSearchChange, searchValue]
  )

  // Sync active path when dropdown opens
  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false
      setColumnActiveIndices([])
      setSearchActiveIndex(-1)
      return
    }
    if (wasOpenRef.current) return

    wasOpenRef.current = true
    setActivePath(value ? [...value] : [])
    updateSearchValue('')
  }, [isOpen, updateSearchValue, value])

  useEffect(() => {
    if (!virtual || !isOpen) return
    setColumnActiveIndices((prev) =>
      columns.map((col, i) => {
        if (prev[i] !== undefined && prev[i] >= 0 && prev[i] < col.options.length) {
          return prev[i]
        }
        return selectedIndexInColumn(col.options, col.selectedValue)
      })
    )
  }, [virtual, isOpen, columns])

  const toggleOpen = useCallback(() => {
    if (disabled) return
    setIsOpen((prev) => !prev)
  }, [disabled])

  const handleOptionClick = useCallback(
    (option: CascaderOption, level: number) => {
      if (option.disabled) return

      const optionIndex = columns[level]?.options.findIndex((item) => item.value === option.value)
      const newPath = activePath.slice(0, level)
      newPath.push(option.value)
      setActivePath(newPath)
      if (optionIndex !== undefined && optionIndex >= 0) {
        setColumnActiveIndices((prev) => {
          const next = prev.slice()
          next[level] = optionIndex
          return next
        })
      }

      const hasChildren = isCascaderOptionExpandable(option)

      if (!hasChildren) {
        onChange?.(newPath)
        setIsOpen(false)
      } else if (changeOnSelect) {
        onChange?.(newPath)
      }
    },
    [activePath, onChange, changeOnSelect, columns]
  )

  const handleOptionHover = useCallback(
    (option: CascaderOption, level: number) => {
      const optionIndex = columns[level]?.options.findIndex((item) => item.value === option.value)
      if (optionIndex !== undefined && optionIndex >= 0 && !option.disabled) {
        setColumnActiveIndices((prev) => {
          const next = prev.slice()
          next[level] = optionIndex
          return next
        })
      }
      if (expandTrigger !== 'hover' || option.disabled) return

      const newPath = activePath.slice(0, level)
      newPath.push(option.value)
      setActivePath(newPath)
    },
    [expandTrigger, activePath, columns]
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
      const action = getPickerTriggerKeyAction(e.key, isOpen)
      if (action === 'none') return

      e.preventDefault()
      if (action === 'toggle') {
        toggleOpen()
      } else if (action === 'open') {
        setIsOpen(true)
      } else if (action === 'close') {
        setIsOpen(false)
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
        {...getPickerComboboxAria({ expanded: isOpen, listboxId })}
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
              aria-label={resolveLocaleText('Clear selection', mergedLocale?.common?.clearText)}
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
      {renderOverlayPortal(
        isOpen ? (
          <div
            ref={dropdownRef}
            className={classNames(
              cascaderDropdownClasses,
              isSearchMode && 'flex-col',
              overlay.floatingClasses
            )}
            style={overlay.floatingStyles}
            data-positioned={overlay.positioned}>
            {/* Search input */}
            {searchable && (
              <input
                type="text"
                className={cascaderSearchInputClasses}
                placeholder={resolveLocaleText(
                  'Search...',
                  mergedLocale?.common?.searchPlaceholder
                )}
                value={searchQuery}
                onChange={(e) => updateSearchValue(e.target.value)}
                aria-label={resolveLocaleText(
                  'Search options',
                  mergedLocale?.common?.searchPlaceholder
                )}
              />
            )}

            {isSearchMode ? (
              // Search results
              searchResults.length === 0 ? (
                <div className={cascaderEmptyStateClasses}>
                  {resolveLocaleText(
                    'No results found',
                    emptyText,
                    mergedLocale?.common?.emptyText
                  )}
                </div>
              ) : virtual ? (
                <VirtualCascaderList
                  key={searchQuery}
                  items={searchResults}
                  size={size}
                  listHeight={listHeight}
                  activeIndex={searchActiveIndex}
                  onActiveIndexChange={setSearchActiveIndex}
                  listboxProps={getPickerListboxAria({ id: listboxId })}
                  renderItem={(item: CascaderFlattenedOption, index) => (
                    <div
                      key={item.valuePath.join(',')}
                      data-option-index={index}
                      className={classNames(
                        cascaderSearchResultClasses,
                        item.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      {...getPickerOptionAria({
                        selected: value?.join(',') === item.valuePath.join(','),
                        disabled: item.disabled
                      })}
                      onMouseEnter={() => {
                        if (!item.disabled) setSearchActiveIndex(index)
                      }}
                      onClick={() => handleSearchResultClick(item.valuePath, item.disabled)}>
                      {typeof searchable === 'object' && searchable.render
                        ? searchable.render(searchQuery, item.path)
                        : item.label}
                    </div>
                  )}
                />
              ) : (
                <div
                  className="max-h-64 overflow-auto"
                  {...getPickerListboxAria({ id: listboxId })}>
                  {searchResults.map((item, index) => (
                    <div
                      key={item.valuePath.join(',')}
                      data-option-index={index}
                      className={classNames(
                        cascaderSearchResultClasses,
                        item.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      {...getPickerOptionAria({
                        selected: value?.join(',') === item.valuePath.join(','),
                        disabled: item.disabled
                      })}
                      onClick={() => handleSearchResultClick(item.valuePath, item.disabled)}>
                      {typeof searchable === 'object' && searchable.render
                        ? searchable.render(searchQuery, item.path)
                        : item.label}
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Cascading columns
              <div className="flex">
                {columns.map((col, colIndex) => {
                  const listboxProps = getPickerListboxAria({
                    id: colIndex === 0 ? listboxId : undefined,
                    label: `Level ${colIndex + 1}`
                  })
                  const renderColumnOption = (option: CascaderOption, optionIndex: number) => {
                    const isSelected = col.selectedValue === option.value
                    const hasChildren = isCascaderOptionExpandable(option)

                    return (
                      <div
                        key={option.value}
                        data-option-index={optionIndex}
                        className={getCascaderOptionClasses(isSelected, !!option.disabled, size)}
                        {...getPickerOptionAria({
                          selected: isSelected,
                          disabled: !!option.disabled
                        })}
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
                  }

                  if (virtual) {
                    return (
                      <VirtualCascaderList
                        key={colIndex}
                        items={col.options}
                        size={size}
                        listHeight={listHeight}
                        activeIndex={columnActiveIndices[colIndex] ?? -1}
                        onActiveIndexChange={(index) => {
                          setColumnActiveIndices((prev) => {
                            const next = prev.slice()
                            next[colIndex] = index
                            return next
                          })
                        }}
                        className={cascaderColumnClasses}
                        listboxProps={{
                          ...listboxProps,
                          'aria-label': `Level ${colIndex + 1}`
                        }}
                        renderItem={renderColumnOption}
                      />
                    )
                  }

                  return (
                    <div
                      key={colIndex}
                      className={cascaderColumnClasses}
                      {...listboxProps}
                      aria-label={`Level ${colIndex + 1}`}>
                      {col.options.map((option, optionIndex) =>
                        renderColumnOption(option, optionIndex)
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : null,
        overlay.target
      )}
    </div>
  )
}
