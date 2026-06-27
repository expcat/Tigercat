import React, { useState, useMemo } from 'react'
import type {
  TransferItem,
  TransferProps as CoreTransferProps,
  TigerLocale
} from '@expcat/tigercat-core'
import {
  resolveLocaleText,
  mergeTigerLocale,
  transferBaseClasses,
  transferPanelClasses,
  transferPanelHeaderClasses,
  transferPanelBodyClasses,
  transferSearchClasses,
  transferEmptyClasses,
  transferOperationClasses,
  getTransferItemClasses,
  getTransferCheckboxClasses,
  getTransferButtonClasses,
  splitTransferData,
  filterTransferItems,
  moveTransferItems,
  getPickerListboxAria,
  getPickerOptionAria,
  classNames,
  icon20ViewBox,
  chevronLeftSolidIcon20PathD,
  chevronRightSolidIcon20PathD
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface TransferProps
  extends CoreTransferProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled target keys */
  value?: (string | number)[]
  /** Called when target keys change */
  onChange?: (
    targetKeys: (string | number)[],
    direction: 'left' | 'right',
    movedKeys: (string | number)[]
  ) => void
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
}

const TRANSFER_KEYS = new Set<string>([
  'value',
  'targetKeys',
  'dataSource',
  'size',
  'disabled',
  'showSearch',
  'sourceTitle',
  'targetTitle',
  'notFoundText',
  'filterOption',
  'onChange'
])

export const Transfer: React.FC<TransferProps> = (props) => {
  const {
    value,
    targetKeys,
    dataSource = [],
    size = 'md',
    disabled = false,
    showSearch = false,
    sourceTitle = 'Source',
    targetTitle = 'Target',
    notFoundText,
    filterOption,
    className,
    onChange,
    locale,
    ...rest
  } = props

  // `value` is the primary controlled prop; `targetKeys` (core/shared name) is
  // accepted as an alias with lower priority.
  const resolvedValue = value ?? targetKeys ?? []

  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )

  const divProps: Record<string, unknown> = {}
  for (const key of Object.keys(rest)) {
    if (!TRANSFER_KEYS.has(key)) {
      divProps[key] = (rest as Record<string, unknown>)[key]
    }
  }

  const [sourceSelectedKeys, setSourceSelectedKeys] = useState<Set<string | number>>(new Set())
  const [targetSelectedKeys, setTargetSelectedKeys] = useState<Set<string | number>>(new Set())
  const [sourceSearch, setSourceSearch] = useState('')
  const [targetSearch, setTargetSearch] = useState('')

  const { sourceItems, targetItems } = useMemo(
    () => splitTransferData(dataSource, resolvedValue),
    [dataSource, resolvedValue]
  )

  const filteredSourceItems = useMemo(
    () => filterTransferItems(sourceItems, sourceSearch, filterOption),
    [sourceItems, sourceSearch, filterOption]
  )

  const filteredTargetItems = useMemo(
    () => filterTransferItems(targetItems, targetSearch, filterOption),
    [targetItems, targetSearch, filterOption]
  )

  const canMoveRight =
    !disabled &&
    [...sourceSelectedKeys].some((key) => {
      const item = dataSource.find((d) => d.key === key)
      return item && !item.disabled
    })

  const canMoveLeft =
    !disabled &&
    [...targetSelectedKeys].some((key) => {
      const item = dataSource.find((d) => d.key === key)
      return item && !item.disabled
    })

  function toggleSourceItem(key: string | number) {
    setSourceSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleTargetItem(key: string | number) {
    setTargetSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function moveRight() {
    if (!canMoveRight) return
    const { targetKeys: newTargetKeys, movedKeys } = moveTransferItems(
      'right',
      resolvedValue,
      sourceSelectedKeys,
      dataSource
    )
    setSourceSelectedKeys(new Set())
    onChange?.(newTargetKeys, 'right', movedKeys)
  }

  function moveLeft() {
    if (!canMoveLeft) return
    const { targetKeys: newTargetKeys, movedKeys } = moveTransferItems(
      'left',
      resolvedValue,
      targetSelectedKeys,
      dataSource
    )
    setTargetSelectedKeys(new Set())
    onChange?.(newTargetKeys, 'left', movedKeys)
  }

  function renderPanel(
    title: string,
    items: TransferItem[],
    selectedKeys: Set<string | number>,
    toggleFn: (key: string | number) => void,
    searchValue: string,
    onSearch: (val: string) => void
  ) {
    return (
      <div className={transferPanelClasses} role="group" aria-label={title}>
        <div className={transferPanelHeaderClasses}>
          <span className="font-medium text-[var(--tiger-transfer-title,var(--tiger-text,#111827))]">
            {title} ({items.length})
          </span>
        </div>

        {showSearch && (
          <input
            type="text"
            className={transferSearchClasses}
            placeholder={resolveLocaleText('Search...', mergedLocale?.common?.searchPlaceholder)}
            value={searchValue}
            aria-label={`Search ${title}`}
            onChange={(e) => onSearch(e.target.value)}
          />
        )}

        <div
          className={transferPanelBodyClasses}
          {...getPickerListboxAria({ label: `${title} items` })}>
          {items.length > 0 ? (
            items.map((item) => {
              const isSelected = selectedKeys.has(item.key)
              const isDisabled = disabled || !!item.disabled
              return (
                <label
                  key={String(item.key)}
                  className={getTransferItemClasses(isSelected, isDisabled, size)}
                  {...getPickerOptionAria({ selected: isSelected, disabled: isDisabled })}>
                  <input
                    type="checkbox"
                    className={getTransferCheckboxClasses(size)}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => {
                      if (!isDisabled) toggleFn(item.key)
                    }}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                </label>
              )
            })
          ) : (
            <div className={transferEmptyClasses}>
              {resolveLocaleText('No data', notFoundText, mergedLocale?.common?.emptyText)}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={classNames(transferBaseClasses, className)} {...divProps}>
      {renderPanel(
        sourceTitle,
        filteredSourceItems,
        sourceSelectedKeys,
        toggleSourceItem,
        sourceSearch,
        setSourceSearch
      )}

      <div className={transferOperationClasses}>
        <button
          type="button"
          className={getTransferButtonClasses(!canMoveRight)}
          disabled={!canMoveRight}
          aria-label="Move selected to target"
          onClick={moveRight}>
          <svg
            className="w-4 h-4"
            viewBox={icon20ViewBox}
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path d={chevronRightSolidIcon20PathD} fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          className={getTransferButtonClasses(!canMoveLeft)}
          disabled={!canMoveLeft}
          aria-label="Move selected to source"
          onClick={moveLeft}>
          <svg
            className="w-4 h-4"
            viewBox={icon20ViewBox}
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path d={chevronLeftSolidIcon20PathD} fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {renderPanel(
        targetTitle,
        filteredTargetItems,
        targetSelectedKeys,
        toggleTargetItem,
        targetSearch,
        setTargetSearch
      )}
    </div>
  )
}
