import React, { useState, useMemo, useRef, useId } from 'react'
import type { TreeNode } from '@expcat/tigercat-core'
import type {
  TreeSelectProps as CoreTreeSelectProps,
  TreeSelectValue,
  TigerLocale
} from '@expcat/tigercat-core'
import {
  resolveLocaleText,
  mergeTigerLocale,
  treeSelectBaseClasses,
  treeSelectDropdownClasses,
  treeSelectSearchClasses,
  treeSelectEmptyClasses,
  getTreeSelectTriggerClasses,
  getTreeSelectNodeClasses,
  getTreeSelectDisplayLabel,
  getAllTreeSelectKeys,
  flattenTreeSelectNodes,
  filterTreeSelectNodes,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionAria,
  getPickerTriggerKeyAction,
  classNames,
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
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

  function toggleExpand(key: string | number, e: React.MouseEvent) {
    e.stopPropagation()
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
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

  function handleKeyDown(e: React.KeyboardEvent) {
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

  return (
    <div ref={containerRef} className={classNames(treeSelectBaseClasses, className)} {...divProps}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={getTreeSelectTriggerClasses(size, disabled, isOpen)}
        {...getPickerComboboxAria({ expanded: isOpen, listboxId })}
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

        {showClearButton ? (
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tiger-treeselect-clear,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-treeselect-clear-hover,var(--tiger-text,#111827))]"
            aria-label={resolveLocaleText('Clear selection', mergedLocale?.common?.clearText)}
            onClick={handleClear}>
            <svg
              className="w-4 h-4"
              viewBox={icon20ViewBox}
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg">
              <path d={closeSolidIcon20PathD} fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </span>
        ) : (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--tiger-text-muted,#9ca3af)] pointer-events-none">
            <svg
              className="w-4 h-4 transition-transform"
              viewBox={icon20ViewBox}
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg">
              <path d={chevronDownSolidIcon20PathD} fillRule="evenodd" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {renderOverlayPortal(
        isOpen ? (
          <div
            ref={dropdownRef}
            {...getPickerListboxAria({ id: listboxId })}
            className={classNames(treeSelectDropdownClasses, overlay.floatingClasses)}
            style={overlay.floatingStyles}
            data-positioned={overlay.positioned}>
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
              />
            )}

            {visibleNodes.length > 0 ? (
              visibleNodes.map((flatNode) => {
                const { node, level, hasChildren, isExpanded } = flatNode
                const selected = isSelected(node.key)
                const indent = level * 20

                return (
                  <div
                    key={String(node.key)}
                    {...getPickerOptionAria({ selected, disabled: !!node.disabled })}
                    className={getTreeSelectNodeClasses(selected, !!node.disabled, size)}
                    style={{ paddingLeft: `${indent + 8}px` }}
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
                          <path
                            d={chevronRightSolidIcon20PathD}
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : (
                      <span className="w-4 mr-1" />
                    )}
                    <span className="flex-1 truncate">{node.label}</span>
                  </div>
                )
              })
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
