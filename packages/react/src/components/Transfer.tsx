import React, { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef } from 'react'
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
  canMoveTransferItems,
  classNames,
  emptyTransferSelectedKeys,
  filterTransferItems,
  getCheckboxLabelClasses,
  getCheckboxVisualClasses,
  getInputClasses,
  getTransferItemClasses,
  getTransferLabels,
  getTransferSelectAllState,
  hasTransferKey,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  moveTransferItems,
  resolveLocaleText,
  resolveTransferTargetKeys,
  runShakeAnimation,
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
  devWarn,
  type InputStatus
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
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
    targetKeys,
    defaultValue,
    defaultTargetKeys,
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
  const resolved = resolveTransferTargetKeys(value, targetKeys)
  useEffect(() => {
    if (resolved.conflict) {
      devWarn(
        'Transfer.valueTargetKeys',
        'Transfer received both `value` and `targetKeys`. `value` wins.'
      )
    }
  }, [resolved.conflict])

  const [targetValue, setTargetValue] = useControlledState<(string | number)[]>({
    value: resolved.keys,
    defaultValue: defaultValue ?? defaultTargetKeys ?? [],
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

  const canMoveRight = canMoveTransferItems(selected.source, dataSource, effectiveDisabled)
  const canMoveLeft = canMoveTransferItems(selected.target, dataSource, effectiveDisabled)

  function updateSearch(panel: keyof TransferSearchValue, nextValue: string) {
    setSearch({ ...search, [panel]: nextValue })
  }

  function updateSelected(next: TransferSelectedKeys) {
    setSelected(next)
  }

  function toggle(panel: 'source' | 'target', key: string | number) {
    updateSelected({ ...selected, [panel]: toggleTransferKey(selected[panel], key) })
  }

  function selectAll(panel: 'source' | 'target', visible: TransferItem[], checked: boolean) {
    const state = getTransferSelectAllState(visible, selected[panel])
    updateSelected({
      ...selected,
      [panel]: applyTransferSelectAll(selected[panel], state.enabledKeys, checked)
    })
  }

  function move(direction: 'left' | 'right') {
    const selectedKeys = direction === 'right' ? selected.source : selected.target
    if (direction === 'right' && !canMoveRight) return
    if (direction === 'left' && !canMoveLeft) return
    const result = moveTransferItems(direction, targetValue, selectedKeys, dataSource)
    const movedIds = new Set(result.movedKeys.map(transferKeyId))
    setTargetValue(result.targetKeys)
    onChange?.(result.targetKeys, direction, result.movedKeys)
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
            <span className="font-medium text-[var(--tiger-text,#111827)]">
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
            aria-label={labels.searchAriaLabel.replace('{title}', title)}
            onChange={(event) => updateSearch(panel, event.target.value)}
          />
        ) : null}
        <div className={transferPanelBodyClasses}>
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => {
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
            })
          ) : (
            <div className={transferEmptyClasses}>
              {resolveLocaleText('No data', emptyText, mergedLocale?.common?.emptyText)}
            </div>
          )}
        </div>
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
        status === 'error' && 'ring-1 ring-[var(--tiger-error,#dc2626)]',
        className
      )}
      onBlur={handleFocusOut}>
      {fieldName
        ? targetValue.map((key) => (
            <input key={transferKeyId(key)} type="hidden" name={fieldName} value={String(key)} />
          ))
        : null}
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
