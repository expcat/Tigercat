import React, {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type {
  TransferItem,
  TransferProps as CoreTransferProps,
  TransferSearchValue,
  TransferSelectedKeys,
  TigerLocale,
  TigerLocaleTransfer
} from '@expcat/tigercat-core'
import {
  applyTransferSelectAll,
  coerceArrayFormValue,
  canMoveTransferItems,
  classNames,
  dedupeTransferKeys,
  emptyTransferSelectedKeys,
  filterTransferItems,
  getCheckboxLabelClasses,
  getCheckboxVisualClasses,
  getInputClasses,
  getTransferItemClasses,
  getTransferPanelBodyStyle,
  getTransferVirtualWindow,
  transferListNeedsWindow,
  getTransferLabels,
  getTransferSelectAllState,
  hasTransferKey,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  moveTransferItems,
  partitionTransferSelection,
  resolveFormItemSeed,
  resolveLocaleText,
  resolveTransferValue,
  runShakeAnimation,
  sameTransferKeys,
  splitTransferData,
  toggleTransferKey,
  transferBaseClasses,
  transferEmptyClasses,
  transferItemDescriptionClasses,
  transferKeyId,
  transferMoveToSourceIconClasses,
  transferMoveToTargetIconClasses,
  transferOperationClasses,
  transferPanelBodyClasses,
  transferPanelClasses,
  transferPanelHeaderClasses,
  checkboxCheckPathD,
  checkboxIconSizeClasses,
  checkboxIconViewBox,
  checkboxIndeterminatePathD,
  type InputStatus
} from '@expcat/tigercat-core'
import type { ComponentSize } from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

function TransferItemList({
  items,
  size,
  renderItem
}: {
  items: TransferItem[]
  size: ComponentSize
  renderItem: (item: TransferItem) => React.ReactNode
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const needsWindow = transferListNeedsWindow(items, size)
  const range = needsWindow ? getTransferVirtualWindow(items, scrollTop, size) : null
  const scrollerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (el && el.scrollTop !== scrollTop) el.scrollTop = scrollTop
  }, [scrollTop])
  const slice = needsWindow && range ? items.slice(range.startIndex, range.endIndex + 1) : items
  return (
    <div
      ref={scrollerRef}
      className={transferPanelBodyClasses}
      style={getTransferPanelBodyStyle()}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
      {needsWindow && range ? (
        <div style={{ height: range.totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${range.offsetTop}px)` }}>
            {slice.map((item) => renderItem(item))}
          </div>
        </div>
      ) : (
        slice.map((item) => renderItem(item))
      )}
    </div>
  )
}
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'
import { Button } from './Button'
import { Icon } from './Icon'

export interface TransferProps
  extends
    CoreTransferProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  onChange?: (
    targetKeys: (string | number)[],
    direction: 'left' | 'right',
    movedKeys: (string | number)[]
  ) => void
  onSelectChange?: (selected: TransferSelectedKeys) => void
  onSearchChange?: (value: TransferSearchValue) => void
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleTransfer>
}

export interface TransferRef {
  focus: () => void
}

function TransferCheckbox({
  checked,
  indeterminate,
  disabled,
  size,
  onChange,
  children
}: {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  size: 'sm' | 'md' | 'lg'
  onChange: () => void
  children?: React.ReactNode
}): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = Boolean(indeterminate)
  }, [indeterminate])

  return (
    <label className={getCheckboxLabelClasses(size, Boolean(disabled))}>
      <input
        ref={inputRef}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        aria-checked={indeterminate ? 'mixed' : checked}
        onChange={() => {
          if (!disabled) onChange()
        }}
      />
      <span
        className={getCheckboxVisualClasses({
          size,
          checked,
          indeterminate,
          disabled: Boolean(disabled)
        })}
        aria-hidden="true">
        {(checked || indeterminate) && (
          <svg
            className={checkboxIconSizeClasses[size]}
            viewBox={checkboxIconViewBox}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d={indeterminate ? checkboxIndeterminatePathD : checkboxCheckPathD} />
          </svg>
        )}
      </span>
      {children}
    </label>
  )
}

const TransferInner = forwardRef<HTMLDivElement, TransferProps>(function Transfer(props, ref) {
  const {
    value,
    defaultValue,
    readOnly = false,
    selectedKeys: selectedKeysProp,
    defaultSelectedKeys,
    dataSource = [],
    size = 'md',
    disabled = false,
    searchable = false,
    searchValue,
    defaultSearchValue,
    sourceTitle,
    targetTitle,
    emptyText,
    filterOption,
    className,
    name,
    status: statusProp,
    onChange,
    onSelectChange,
    onSearchChange,
    locale,
    labels: labelsOverride,
    onBlur,
    ...rest
  } = props

  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () =>
      getTransferLabels(mergedLocale, {
        ...labelsOverride,
        sourceTitle,
        targetTitle
      }),
    [mergedLocale, labelsOverride, sourceTitle, targetTitle]
  )
  const formBound = value === undefined && Boolean(formItemControl?.name)
  const seededValue = resolveFormItemSeed(
    value,
    formItemControl?.name,
    formItemControl?.value,
    coerceArrayFormValue<string | number>
  )
  const normalizedValueRef = useRef<(string | number)[] | undefined>(undefined)
  const normalizedValue = (() => {
    if (value === undefined && !formBound) return undefined
    const next = resolveTransferValue(seededValue ?? []) ?? []
    if (!normalizedValueRef.current || !sameTransferKeys(normalizedValueRef.current, next)) {
      normalizedValueRef.current = next
    }
    return normalizedValueRef.current
  })()
  const seededRef = useRef(false)

  const [targetValue, setTargetValue] = useControlledState<(string | number)[]>({
    value: normalizedValue,
    defaultValue: dedupeTransferKeys(defaultValue ?? []),
    onChange: (next) => {
      formItemControl?.onChange?.(next)
    }
  })
  const [selected, setSelected] = useControlledState<TransferSelectedKeys>({
    value: selectedKeysProp,
    defaultValue: defaultSelectedKeys ?? emptyTransferSelectedKeys(),
    onChange: onSelectChange
  })
  const [search, setSearch] = useControlledState<TransferSearchValue>({
    value: searchValue,
    defaultValue: defaultSearchValue ?? {},
    onChange: onSearchChange
  })

  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const isReadOnly = Boolean(readOnly)
  const canMutate = !effectiveDisabled && !isReadOnly
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const fieldName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(
    typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof rest['aria-labelledby'] === 'string' ? rest['aria-labelledby'] : formItemControl?.labelId
  const reactId = useId()
  const groupId = rest.id ?? formItemControl?.id ?? `tiger-transfer-${reactId}`

  const rootRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, [])
  useEffect(() => {
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, formItemControl?.shakeTrigger])

  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    if (!formItemControl?.name || value !== undefined) return
    const raw = formItemControl.value
    if (raw !== '' && raw != null) return
    if (defaultValue === undefined) return
    formItemControl.onChange?.(dedupeTransferKeys(defaultValue))
  }, [defaultValue, formItemControl, value])

  const { sourceItems, targetItems } = useMemo(
    () => splitTransferData(dataSource, targetValue),
    [dataSource, targetValue]
  )
  const sourceSearch = search.source ?? ''
  const targetSearch = search.target ?? ''
  const filteredSource = useMemo(
    () => filterTransferItems(sourceItems, sourceSearch, filterOption),
    [sourceItems, sourceSearch, filterOption]
  )
  const filteredTarget = useMemo(
    () => filterTransferItems(targetItems, targetSearch, filterOption),
    [targetItems, targetSearch, filterOption]
  )

  const sourceSelection = partitionTransferSelection(selected.source, filteredSource)
  const targetSelection = partitionTransferSelection(selected.target, filteredTarget)
  const canMoveRight = canMoveTransferItems(sourceSelection.visible, dataSource, !canMutate)
  const canMoveLeft = canMoveTransferItems(targetSelection.visible, dataSource, !canMutate)

  function updateSearch(panel: keyof TransferSearchValue, nextValue: string) {
    setSearch({ ...search, [panel]: nextValue })
  }

  function updateSelected(next: TransferSelectedKeys) {
    setSelected(next)
  }

  function toggle(panel: 'source' | 'target', key: string | number) {
    if (!canMutate) return
    updateSelected({ ...selected, [panel]: toggleTransferKey(selected[panel], key) })
  }

  function selectAll(panel: 'source' | 'target', visible: TransferItem[], checked: boolean) {
    if (!canMutate) return
    const state = getTransferSelectAllState(visible, selected[panel])
    updateSelected({
      ...selected,
      [panel]: applyTransferSelectAll(selected[panel], state.enabledKeys, checked)
    })
  }

  function move(direction: 'left' | 'right') {
    if (!canMutate) return
    const selectedKeys = direction === 'right' ? sourceSelection.visible : targetSelection.visible
    if (direction === 'right' && !canMoveRight) return
    if (direction === 'left' && !canMoveLeft) return
    const result = moveTransferItems(direction, targetValue, selectedKeys, dataSource)
    const movedIds = new Set(result.movedKeys.map(transferKeyId))
    if (!sameTransferKeys(result.targetKeys, targetValue)) {
      setTargetValue(result.targetKeys)
      onChange?.(result.targetKeys, direction, result.movedKeys)
    }
    updateSelected({
      source:
        direction === 'right'
          ? selected.source.filter((key) => !movedIds.has(transferKeyId(key)))
          : selected.source,
      target:
        direction === 'left'
          ? selected.target.filter((key) => !movedIds.has(transferKeyId(key)))
          : selected.target
    })
  }

  function handleFocusOut(event: React.FocusEvent<HTMLDivElement>) {
    onBlur?.(event)
    const next = event.relatedTarget as Node | null
    if (next && event.currentTarget.contains(next)) return
    formItemControl?.onBlur?.()
  }

  function renderPanel(
    panel: 'source' | 'target',
    title: string,
    allItems: TransferItem[],
    visibleItems: TransferItem[],
    query: string
  ) {
    const selectedKeys = selected[panel]
    const selectedCount = selectedKeys.filter((key) =>
      allItems.some((item) => transferKeyId(item.key) === transferKeyId(key))
    ).length
    const selectState = getTransferSelectAllState(visibleItems, selectedKeys)
    return (
      <div className={transferPanelClasses} role="group" aria-label={title}>
        <div className={transferPanelHeaderClasses}>
          <TransferCheckbox
            checked={selectState.checked}
            indeterminate={selectState.indeterminate}
            disabled={effectiveDisabled || selectState.enabledKeys.length === 0}
            size={size}
            onChange={() => selectAll(panel, visibleItems, !selectState.checked)}>
            <span className="font-medium text-[var(--tiger-text)]">
              {title} ({selectedCount}/{allItems.length})
            </span>
          </TransferCheckbox>
        </div>
        {searchable ? (
          <input
            type="search"
            className={getInputClasses({ status, size: 'sm' })}
            placeholder={resolveLocaleText('Search', mergedLocale?.common?.searchPlaceholder)}
            value={query}
            disabled={effectiveDisabled}
            readOnly={isReadOnly || undefined}
            aria-label={labels.searchAriaLabel.replace('{title}', title)}
            onChange={(event) => {
              if (!canMutate) return
              updateSearch(panel, event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault()
            }}
          />
        ) : null}
        {visibleItems.length > 0 ? (
          <TransferItemList
            items={visibleItems}
            size={size}
            renderItem={(item) => {
              const isSelected = hasTransferKey(selectedKeys, item.key)
              const itemDisabled = effectiveDisabled || Boolean(item.disabled)
              return (
                <div
                  key={transferKeyId(item.key)}
                  className={getTransferItemClasses(isSelected, itemDisabled, size)}>
                  <TransferCheckbox
                    checked={isSelected}
                    disabled={itemDisabled}
                    size={size}
                    onChange={() => toggle(panel, item.key)}>
                    <span className="min-w-0">
                      <span className="block truncate">{item.label}</span>
                      {item.description ? (
                        <span className={transferItemDescriptionClasses}>{item.description}</span>
                      ) : null}
                    </span>
                  </TransferCheckbox>
                </div>
              )
            }}
          />
        ) : (
          <div className={transferPanelBodyClasses} style={getTransferPanelBodyStyle()}>
            <div className={transferEmptyClasses}>
              {resolveLocaleText('No data', emptyText, mergedLocale?.common?.emptyText)}
            </div>
          </div>
        )}
        {(() => {
          const hidden = partitionTransferSelection(selectedKeys, visibleItems).hidden
          if (hidden.length === 0) return null
          const clearText = mergedLocale?.common?.clearText ?? 'Clear'
          return (
            <div className="flex items-center justify-between gap-2 border-t border-[var(--tiger-border)] px-3 py-1 text-xs">
              <span role="status">{hidden.length} selected hidden by search</span>
              <button
                type="button"
                className="text-[var(--tiger-primary)]"
                disabled={!canMutate}
                aria-label={clearText}
                onClick={() => {
                  const hiddenIds = new Set(hidden.map(transferKeyId))
                  updateSelected({
                    ...selected,
                    [panel]: selectedKeys.filter((key) => !hiddenIds.has(transferKeyId(key)))
                  })
                }}>
                {clearText}
              </button>
            </div>
          )
        })()}
      </div>
    )
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      id={groupId}
      role="group"
      aria-labelledby={labelledby}
      aria-describedby={describedBy}
      aria-invalid={status === 'error' ? true : rest['aria-invalid']}
      aria-required={formItemControl?.required || rest['aria-required'] ? true : undefined}
      aria-disabled={effectiveDisabled || undefined}
      className={classNames(
        transferBaseClasses,
        status === 'error' && 'ring-1 ring-[var(--tiger-error)]',
        className
      )}
      onBlur={handleFocusOut}>
      {fieldName ? (
        targetValue.length > 0 ? (
          targetValue.map((key) => (
            <input
              key={transferKeyId(key)}
              type="hidden"
              name={fieldName}
              value={String(key)}
              disabled={effectiveDisabled || undefined}
            />
          ))
        ) : (
          <input
            type="hidden"
            name={fieldName}
            value=""
            disabled={effectiveDisabled || undefined}
          />
        )
      ) : null}
      {renderPanel('source', labels.sourceTitle, sourceItems, filteredSource, sourceSearch)}
      <div className={transferOperationClasses}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canMoveRight}
          aria-label={labels.moveToTargetAriaLabel}
          onClick={() => move('right')}>
          <Icon name="chevron-right" className={transferMoveToTargetIconClasses} aria-hidden />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canMoveLeft}
          aria-label={labels.moveToSourceAriaLabel}
          onClick={() => move('left')}>
          <Icon name="chevron-left" className={transferMoveToSourceIconClasses} aria-hidden />
        </Button>
      </div>
      {renderPanel('target', labels.targetTitle, targetItems, filteredTarget, targetSearch)}
    </div>
  )
})

export const Transfer = markFormItemGroupControl(TransferInner)
Transfer.displayName = 'Transfer'
