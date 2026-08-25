import React, { useState, useMemo, useRef, useId, useLayoutEffect, useCallback } from 'react'
import type { TreeNode } from '@expcat/tigercat-core'
import type {
  TreeSelectProps as CoreTreeSelectProps,
  TreeSelectValue,
  TigerLocale,
  FlatTreeSelectNode
} from '@expcat/tigercat-core'
import {
  resolveLocaleText,
  mergeTigerLocale,
  treeSelectBaseClasses,
  treeSelectSearchClasses,
  treeSelectEmptyClasses,
  getTreeSelectTriggerClasses,
  getTreeSelectNodeClasses,
  getTreeSelectDropdownClasses,
  getTreeSelectDisplayLabel,
  getAllTreeSelectKeys,
  flattenTreeSelectNodes,
  filterTreeSelectNodes,
  getTreeSelectVisibleIndex,
  alignTreeSelectVirtualScroll,
  TREE_SELECT_DEFAULT_HEIGHT,
  TREE_SELECT_DEFAULT_ITEM_HEIGHT,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionAria,
  getPickerTriggerKeyAction,
  getPickerNavigationIndex,
  getPickerOptionId,
  findFirstEnabledIndex,
  classNames,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { VirtualList } from './VirtualList'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

export interface TreeSelectProps
  extends CoreTreeSelectProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled value */
  value?: TreeSelectValue
  /** Called when value changes */
  onChange?: (value: TreeSelectValue) => void
  /** Called when search text changes */
  onSearchChange?: (value: string) => void
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
}

const TREESELECT_KEYS = new Set<string>([
  'value',
  'treeData',
  'placeholder',
  'size',
  'disabled',
  'clearable',
  'multiple',
  'searchable',
  'searchValue',
  'defaultSearchValue',
  'emptyText',
  'defaultExpandAll',
  'virtual',
  'height',
  'itemHeight',
  'onChange',
  'onSearchChange'
])

export const TreeSelect: React.FC<TreeSelectProps> = (props) => {
  const {
    value,
    treeData = [],
    placeholder = 'Please select',
    size = 'md',
    disabled = false,
    clearable = false,
    multiple = false,
    searchable = false,
    searchValue,
    defaultSearchValue = '',
    emptyText,
    defaultExpandAll = false,
    virtual = false,
    height = TREE_SELECT_DEFAULT_HEIGHT,
    itemHeight = TREE_SELECT_DEFAULT_ITEM_HEIGHT,
    className,
    onChange,
    onSearchChange,
    locale,
    ...rest
  } = props

  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )

  const divProps: Record<string, unknown> = {}
  for (const key of Object.keys(rest)) {
    if (!TREESELECT_KEYS.has(key)) {
      divProps[key] = (rest as Record<string, unknown>)[key]
    }
  }

  const instanceId = useId()
  const listboxId = `tiger-treeselect-listbox-${instanceId}`

  const [isOpen, setIsOpen] = useState(false)
  const [uncontrolledSearchValue, setUncontrolledSearchValue] = useState(defaultSearchValue)
  const searchQuery = searchValue ?? uncontrolledSearchValue
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(() =>
    defaultExpandAll ? new Set(getAllTreeSelectKeys(treeData)) : new Set()
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const virtualListWrapperRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const overlay = useAnchoredOverlay({
    enabled: isOpen,
    referenceRef: triggerRef,
    floatingRef: dropdownRef,
    containerRef,
    placement: 'bottom-start',
    offset: 4,
    matchReferenceWidth: true,
    dismissOnOutside: true,
    dismissOnEscape: true,
    restoreFocusOnDismiss: true,
    onDismiss: closeDropdown
  })

  const displayLabel = useMemo(() => getTreeSelectDisplayLabel(treeData, value), [treeData, value])

  const showClearButton =
    clearable &&
    !disabled &&
    value !== undefined &&
    (Array.isArray(value) ? value.length > 0 : value !== '')

  const matchedKeys = useMemo(() => {
    if (!searchQuery) return null
    return filterTreeSelectNodes(treeData, searchQuery)
  }, [treeData, searchQuery])

  const effectiveExpandedKeys = matchedKeys ?? expandedKeys

  const flatNodes = useMemo(
    () => flattenTreeSelectNodes(treeData, effectiveExpandedKeys),
    [treeData, effectiveExpandedKeys]
  )

  const visibleNodes = useMemo(() => {
    if (!matchedKeys) return flatNodes
    return flatNodes.filter((f) => matchedKeys.has(f.node.key))
  }, [flatNodes, matchedKeys])

  const isNodeDisabled = useCallback((item: FlatTreeSelectNode) => !!item.node.disabled, [])

  const visibleNodesRef = useRef(visibleNodes)
  visibleNodesRef.current = visibleNodes
  const valueRef = useRef(value)
  valueRef.current = value
  const lastActiveKeyRef = useRef<string | number | undefined>(undefined)

  const resolveActiveIndex = useCallback((): number => {
    const nodes = visibleNodesRef.current
    const selected = getTreeSelectVisibleIndex(nodes, valueRef.current)
    if (selected >= 0 && !nodes[selected]?.node.disabled) return selected
    return findFirstEnabledIndex(nodes, isNodeDisabled)
  }, [isNodeDisabled])

  const commitActiveIndex = useCallback((index: number) => {
    lastActiveKeyRef.current = index >= 0 ? visibleNodesRef.current[index]?.node.key : undefined
    setActiveIndex(index)
  }, [])

  const alignVirtualScroll = useCallback(
    (index: number) => {
      if (!virtual) return
      const wrapper = virtualListWrapperRef.current
      const el = (wrapper?.firstElementChild as HTMLElement | null) ?? wrapper
      alignTreeSelectVirtualScroll(el, index, itemHeight, height)
    },
    [virtual, itemHeight, height]
  )

  useLayoutEffect(() => {
    if (!isOpen) {
      commitActiveIndex(-1)
      return
    }
    commitActiveIndex(resolveActiveIndex())
  }, [isOpen, searchQuery, commitActiveIndex, resolveActiveIndex])

  useLayoutEffect(() => {
    if (!isOpen) return
    const remapped = getTreeSelectVisibleIndex(visibleNodesRef.current, lastActiveKeyRef.current)
    if (remapped >= 0) setActiveIndex(remapped)
    // Flatten identity can change while open (expand/collapse, parent re-render).
    // Re-resolve only on open/searchQuery; remap the previous key instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedKeys, treeData, isOpen])

  useLayoutEffect(() => {
    if (!isOpen) return
    alignVirtualScroll(activeIndex)
  }, [activeIndex, isOpen, alignVirtualScroll, visibleNodes.length])

  function handleVirtualListKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    setActiveIndex((current) => {
      const next = getPickerNavigationIndex(visibleNodes, current, e.key, isNodeDisabled)
      lastActiveKeyRef.current = visibleNodes[next]?.node.key
      return next
    })
  }

  function openDropdown() {
    if (disabled) return
    setIsOpen(true)
  }

  function closeDropdown() {
    setIsOpen(false)
    updateSearchValue('')
  }

  function updateSearchValue(value: string) {
    if (searchValue === undefined) {
      setUncontrolledSearchValue(value)
    }
    onSearchChange?.(value)
  }

  function toggleDropdown() {
    if (isOpen) closeDropdown()
    else openDropdown()
  }

  function toggleExpandKey(key: string | number) {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleExpand(key: string | number, e: React.MouseEvent) {
    e.stopPropagation()
    toggleExpandKey(key)
  }

  function isSelected(key: string | number): boolean {
    if (multiple && Array.isArray(value)) {
      return value.includes(key)
    }
    return value === key
  }

  function handleNodeSelect(node: TreeNode) {
    if (node.disabled) return

    if (multiple) {
      const current = Array.isArray(value) ? [...value] : []
      const idx = current.indexOf(node.key)
      if (idx >= 0) current.splice(idx, 1)
      else current.push(node.key)
      onChange?.(current)
    } else {
      onChange?.(node.key)
      closeDropdown()
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange?.(multiple ? [] : (undefined as unknown as TreeSelectValue))
  }

  function handleOpenListKeyDown(e: React.KeyboardEvent, fromSearchInput = false): boolean {
    const key = e.key
    if (fromSearchInput && key === ' ') return false

    if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
      e.preventDefault()
      e.stopPropagation()
      setActiveIndex((current) => {
        const next = getPickerNavigationIndex(visibleNodes, current, key, isNodeDisabled)
        lastActiveKeyRef.current = visibleNodes[next]?.node.key
        return next
      })
      return true
    }

    if (key === 'Enter' || key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      const item = visibleNodes[activeIndex]
      if (item && !item.node.disabled) {
        handleNodeSelect(item.node)
      }
      return true
    }

    if (key === 'ArrowRight') {
      e.preventDefault()
      e.stopPropagation()
      const item = visibleNodes[activeIndex]
      if (item?.hasChildren && !item.isExpanded) {
        toggleExpandKey(item.node.key)
      }
      return true
    }

    if (key === 'ArrowLeft') {
      e.preventDefault()
      e.stopPropagation()
      const item = visibleNodes[activeIndex]
      if (item?.hasChildren && item.isExpanded) {
        toggleExpandKey(item.node.key)
      }
      return true
    }

    return false
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (isOpen && handleOpenListKeyDown(e)) return

    const action = getPickerTriggerKeyAction(e.key, isOpen)
    if (action === 'none') return

    e.preventDefault()
    if (action === 'toggle') {
      if (isOpen) closeDropdown()
      else openDropdown()
    } else if (action === 'open') {
      openDropdown()
    } else if (action === 'close') {
      closeDropdown()
    }
  }

  function handleDropdownKeyDown(e: React.KeyboardEvent) {
    if (e.target instanceof HTMLInputElement) return
    if (!isOpen) return
    handleOpenListKeyDown(e)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case ' ':
        e.stopPropagation()
        return
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
        handleOpenListKeyDown(e, true)
        return
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        closeDropdown()
        triggerRef.current?.focus()
        return
      default:
        return
    }
  }

  function renderFlatNode(flatNode: FlatTreeSelectNode, index: number) {
    const { node, level, hasChildren, isExpanded } = flatNode
    const selected = isSelected(node.key)
    const isActive = index === activeIndex
    const indent = level * 20

    return (
      <div
        key={String(node.key)}
        id={getPickerOptionId(listboxId, index)}
        data-active={isActive || undefined}
        {...getPickerOptionAria({ selected, disabled: !!node.disabled })}
        className={getTreeSelectNodeClasses(selected || isActive, !!node.disabled, size)}
        style={{ paddingLeft: `${indent + 8}px`, height: virtual ? '100%' : undefined }}
        onClick={(e) => {
          e.stopPropagation()
          handleNodeSelect(node)
        }}>
        {hasChildren ? (
          <span
            className={classNames(
              'inline-flex items-center justify-center w-4 h-4 mr-1 transition-transform',
              isExpanded ? 'rotate-90' : ''
            )}
            onClick={(e) => toggleExpand(node.key, e)}>
            <svg className="w-3 h-3" viewBox={icon20ViewBox} fill="currentColor">
              <path d={chevronRightSolidIcon20PathD} fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </span>
        ) : (
          <span className="w-4 mr-1" />
        )}
        <span className="flex-1 truncate">{node.label}</span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={classNames(treeSelectBaseClasses, className)} {...divProps}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={classNames(
          getTreeSelectTriggerClasses(size, disabled, isOpen),
          showClearButton ? 'pr-14' : undefined
        )}
        {...getPickerComboboxAria({
          expanded: isOpen,
          listboxId,
          activeIndex: isOpen ? activeIndex : -1
        })}
        disabled={disabled}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}>
        <span
          className={classNames(
            'flex-1 truncate',
            !displayLabel
              ? 'text-[var(--tiger-treeselect-placeholder,var(--tiger-text-muted,#9ca3af))]'
              : ''
          )}>
          {displayLabel || placeholder}
        </span>
      </button>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1">
        {showClearButton && (
          <button
            type="button"
            className="pointer-events-auto inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-treeselect-ring,var(--tiger-primary,#2563eb))] text-[var(--tiger-treeselect-clear,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-treeselect-clear-hover,var(--tiger-text,#111827))]"
            data-tiger-treeselect-clear=""
            aria-label={resolveLocaleText('Clear selection', mergedLocale?.common?.clearText)}
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
        <span
          className={classNames(
            'inline-flex text-[var(--tiger-text-muted,#9ca3af)]',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true">
          <svg
            className="w-4 h-4 transition-transform"
            viewBox={icon20ViewBox}
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path d={chevronDownSolidIcon20PathD} fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </span>
      </span>

      {/* Dropdown */}
      {renderOverlayPortal(
        isOpen ? (
          <div
            ref={dropdownRef}
            {...getPickerListboxAria({ id: listboxId })}
            className={classNames(getTreeSelectDropdownClasses(virtual), overlay.floatingClasses)}
            style={overlay.floatingStyles}
            data-positioned={overlay.positioned}
            onKeyDown={handleDropdownKeyDown}>
            {searchable && (
              <input
                type="text"
                className={treeSelectSearchClasses}
                placeholder={resolveLocaleText(
                  'Search...',
                  mergedLocale?.common?.searchPlaceholder
                )}
                value={searchQuery}
                aria-label={resolveLocaleText(
                  'Search tree',
                  mergedLocale?.common?.searchPlaceholder
                )}
                onChange={(e) => updateSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            )}

            {visibleNodes.length > 0 ? (
              virtual ? (
                <div
                  ref={virtualListWrapperRef}
                  data-tiger-treeselect-virtual=""
                  tabIndex={0}
                  onKeyDown={handleVirtualListKeyDown}>
                  <VirtualList
                    itemCount={visibleNodes.length}
                    itemHeight={itemHeight}
                    height={height}
                    renderItem={({ index }) => {
                      const item = visibleNodes[index]
                      return item ? renderFlatNode(item, index) : null
                    }}
                  />
                </div>
              ) : (
                visibleNodes.map((flatNode, index) => renderFlatNode(flatNode, index))
              )
            ) : (
              <div className={treeSelectEmptyClasses}>
                {resolveLocaleText('No data', emptyText, mergedLocale?.common?.emptyText)}
              </div>
            )}
          </div>
        ) : null,
        overlay.target
      )}
    </div>
  )
}
