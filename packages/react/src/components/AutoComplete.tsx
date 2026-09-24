import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type {
  AutoCompleteOption,
  AutoCompleteProps as CoreAutoCompleteProps,
  AutoCompleteValue
} from '@expcat/tigercat-core'
import { icon20ViewBox } from '@expcat/tigercat-core/icons/picker'
import {
  classNames,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  AUTO_COMPLETE_INVALID_VALUE,
  autoCompleteOptionIdentity,
  filterAutoCompleteOptions,
  getAutoCompleteInputClasses,
  getAutoCompleteOptionClasses,
  getAutoCompleteOptionKey,
  getAutoCompletePanelStyle,
  getAutoCompleteVirtualItemHeight,
  shouldVirtualizeAutoCompleteList,
  getAutoCompleteRootClasses,
  getAutoCompleteKeyIntent,
  getEmptyLabels,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  getSelectLabels,
  isAutoCompleteEmptyValue,
  isImeCompositionEvent,
  isSameAutoCompleteValue,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  resolveAutoCompleteBlurCommit,
  resolveAutoCompleteInitialQuery,
  resolveLocaleText,
  runShakeAnimation,
  sanitizeAutoCompleteExternalValue,
  shouldShowAutoCompleteClear,
  syncAutoCompleteHighlight,
  autoCompleteClearButtonClasses,
  autoCompleteClearIconClasses,
  autoCompleteDoneActionClasses,
  autoCompleteDoneButtonClasses,
  autoCompleteDropdownClasses,
  autoCompleteEmptyStateClasses,
  autoCompleteListboxClasses,
  autoCompleteTrailingSlotClasses
} from '@expcat/tigercat-core'
import { closeSolidIcon20PathD } from '@expcat/tigercat-core/icons/picker'
import { useControlledState } from '../hooks/useControlledState'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'
import { useFixedVirtualWindow } from './internal/useFixedVirtualWindow'
import { useFormItemControlContext } from './FormItemContext'
import { useInputGroupContext } from './InputGroup'

export type { AutoCompleteOption }

export interface AutoCompleteProps
  extends
    Omit<CoreAutoCompleteProps, 'value' | 'defaultValue'>,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'size' | 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'onFocus' | 'onBlur'
    > {
  value?: AutoCompleteValue
  defaultValue?: AutoCompleteValue
  onChange?: (value: AutoCompleteValue | undefined) => void
  onSelect?: (value: AutoCompleteValue, option: AutoCompleteOption) => void
  onSearchChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

function AutoCompleteClearIcon() {
  return (
    <svg
      className={autoCompleteClearIconClasses}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon20ViewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false">
      <path fillRule="evenodd" d={closeSolidIcon20PathD} clipRule="evenodd" />
    </svg>
  )
}

export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(
  function AutoComplete(props, ref) {
    const {
      value,
      defaultValue,
      options = [],
      placeholder = '',
      searchValue,
      defaultSearchValue,
      open,
      defaultOpen = false,
      size = 'md',
      disabled = false,
      clearable = false,
      emptyText,
      filterOption = true,
      defaultActiveFirstOption = true,
      allowFreeInput = true,
      locale,
      className,
      loading = false,
      readOnly = false,
      status: statusProp,
      name,
      id,
      placement = 'bottom-start',
      offset = 4,
      dropdownClassName,
      getPopupContainer,
      listHeight = 256,
      onChange,
      onSelect,
      onSearchChange,
      onOpenChange,
      onFocus,
      onBlur,
      style,
      ...rest
    } = props

    const inputGroup = useInputGroupContext()
    const formItemControl = useFormItemControlContext()
    const config = useTigerConfig()
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const emptyLabels = useMemo(() => getEmptyLabels(mergedLocale), [mergedLocale])
    const selectLabels = useMemo(() => getSelectLabels(mergedLocale), [mergedLocale])
    const resolvedEmptyText = resolveLocaleText(emptyLabels.noResults, emptyText)
    const loadingText = mergedLocale?.common?.loadingText ?? 'Loading...'
    const clearAriaLabel = mergedLocale?.common?.clearText ?? 'Clear'
    const doneText = selectLabels.doneText

    const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
    const isReadOnly = Boolean(readOnly)
    const canEdit = !effectiveDisabled && !isReadOnly
    const status = statusProp ?? formItemControl?.status ?? 'default'
    const shakeTrigger = formItemControl?.shakeTrigger
    const effectiveId = id ?? formItemControl?.id
    const effectiveName = name ?? formItemControl?.name
    const describedBy = mergeAriaDescribedBy(
      typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
      formItemControl?.describedBy
    )
    const labelledby =
      typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
        ? rest['aria-labelledby']
        : formItemControl?.labelId
    const ariaLabel =
      typeof rest['aria-label'] === 'string' && rest['aria-label'].trim()
        ? rest['aria-label']
        : undefined

    const formBound = value === undefined && Boolean(formItemControl?.name)
    const rawExternal = value !== undefined ? value : formBound ? formItemControl?.value : undefined
    const sanitized =
      value !== undefined || formBound ? sanitizeAutoCompleteExternalValue(rawExternal) : undefined
    const hasControlled = value !== undefined || formBound
    const [committed, setCommitted] = useControlledState<AutoCompleteValue | null>({
      value: hasControlled ? (sanitized?.value ?? null) : undefined,
      defaultValue: isAutoCompleteEmptyValue(defaultValue) ? null : (defaultValue ?? null),
      onChange: (next) => {
        const emitted = isAutoCompleteEmptyValue(next) ? undefined : next
        onChange?.(emitted)
        formItemControl?.onChange?.(emitted)
      }
    })
    const committedValue = isAutoCompleteEmptyValue(committed) ? undefined : committed

    const [isOpen, setOpen] = useControlledState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange
    })

    const [query, setQuery] = useControlledState({
      value: searchValue,
      defaultValue: resolveAutoCompleteInitialQuery({
        defaultSearchValue,
        committed: hasControlled
          ? sanitized?.value
          : isAutoCompleteEmptyValue(defaultValue)
            ? undefined
            : defaultValue,
        optionList: options
      }),
      onChange: onSearchChange
    })

    const instanceId = useId()
    const listboxId = `tiger-autocomplete-listbox-${instanceId}`
    const [activeIndex, setActiveIndex] = useState(-1)
    const isEditingRef = useRef(false)
    const composingRef = useRef(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const hiddenRef = useRef<HTMLInputElement>(null)
    const mountedRef = useRef(false)
    const seededRef = useRef(false)
    const explainedRef = useRef(false)
    const activeKeyRef = useRef<string | undefined>(undefined)
    const labelMemory = useRef<{ value: AutoCompleteValue; label: string } | null>(null)
    const wasOpenRef = useRef(false)
    const hadCommittedRef = useRef(!isAutoCompleteEmptyValue(committedValue))
    const committedRef = useRef(committedValue)
    committedRef.current = committedValue
    const queryRef = useRef(query)
    queryRef.current = query
    const optionsRef = useRef(options)
    optionsRef.current = options
    const allowFreeInputRef = useRef(allowFreeInput)
    allowFreeInputRef.current = allowFreeInput

    const filteredOptions = useMemo(
      () => filterAutoCompleteOptions(options, query, filterOption),
      [filterOption, options, query]
    )
    const hasOptions = filteredOptions.length > 0
    const optionItemHeight = getAutoCompleteVirtualItemHeight(size)
    const virtualizeOptions = shouldVirtualizeAutoCompleteList(
      filteredOptions.length,
      listHeight,
      size
    )
    const optionWindow = useFixedVirtualWindow({
      enabled: virtualizeOptions,
      activeIndex,
      itemHeight: optionItemHeight,
      viewport: listHeight,
      count: filteredOptions.length
    })
    const showClear = shouldShowAutoCompleteClear({
      clearable,
      disabled: effectiveDisabled || isReadOnly,
      query,
      committed: committedValue
    })
    const filteredIdentity = filteredOptions.map(autoCompleteOptionIdentity).join('\0')

    const setInputRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    useEffect(() => {
      if (!mountedRef.current) {
        mountedRef.current = true
        return
      }
      if (status === 'error') runShakeAnimation(rootRef.current)
    }, [status, shakeTrigger])

    const rememberLabel = useCallback((next: AutoCompleteValue | undefined, label: string) => {
      if (isAutoCompleteEmptyValue(next)) {
        labelMemory.current = null
        return
      }
      labelMemory.current = { value: next as AutoCompleteValue, label }
    }, [])

    const writeNative = useCallback((next: AutoCompleteValue | undefined) => {
      if (!hiddenRef.current) return
      hiddenRef.current.value = isAutoCompleteEmptyValue(next) ? '' : String(next)
    }, [])

    useEffect(() => {
      if (seededRef.current) return
      seededRef.current = true
      if (!formItemControl?.name || value !== undefined) return
      const raw = formItemControl.value
      if (raw !== '' && raw != null) return
      if (isAutoCompleteEmptyValue(defaultValue)) return
      formItemControl.onChange?.(defaultValue)
    }, [defaultValue, formItemControl, value])

    useEffect(() => {
      if (sanitized?.invalid) {
        formItemControl?.setError?.(AUTO_COMPLETE_INVALID_VALUE)
        if (!explainedRef.current) {
          explainedRef.current = true
          onChange?.(undefined)
          formItemControl?.onChange?.(undefined)
        }
        return
      }
      if (explainedRef.current && sanitized?.value !== undefined) {
        explainedRef.current = false
        formItemControl?.setError?.(null)
      }
    }, [formItemControl, onChange, sanitized?.invalid, sanitized?.value])

    useEffect(() => {
      if (searchValue !== undefined) return
      if (isEditingRef.current) return
      if (committedValue === undefined) {
        if (hadCommittedRef.current) setQuery('')
        hadCommittedRef.current = false
        return
      }
      hadCommittedRef.current = true
      const memory = labelMemory.current
      const label =
        memory && isSameAutoCompleteValue(memory.value, committedValue)
          ? memory.label
          : resolveAutoCompleteInitialQuery({ committed: committedValue, optionList: options })
      if (!(memory && isSameAutoCompleteValue(memory.value, committedValue))) {
        rememberLabel(committedValue, label)
      }
      setQuery(label)
    }, [committedValue, options, rememberLabel, searchValue, setQuery])

    useEffect(() => {
      const next = syncAutoCompleteHighlight(
        filteredOptions,
        activeKeyRef.current,
        defaultActiveFirstOption
      )
      activeKeyRef.current = next.key
      setActiveIndex((current) => (current === next.index ? current : next.index))
    }, [defaultActiveFirstOption, filteredIdentity, filteredOptions])

    useEffect(() => {
      writeNative(committedValue)
    }, [committedValue, writeNative])

    const openDropdown = useCallback(() => {
      if (!canEdit) return
      setOpen(true)
      const index = getInitialPickerActiveIndex(filteredOptions, defaultActiveFirstOption)
      activeKeyRef.current =
        index >= 0 ? autoCompleteOptionIdentity(filteredOptions[index]) : undefined
      setActiveIndex(index)
    }, [canEdit, defaultActiveFirstOption, filteredOptions, setOpen])

    const closeDropdown = useCallback(() => {
      activeKeyRef.current = undefined
      setActiveIndex(-1)
      setOpen(false)
    }, [setOpen])

    const applyQuery = useCallback(
      (next: string) => {
        setQuery(next)
      },
      [setQuery]
    )

    const commitValue = useCallback(
      (next: AutoCompleteValue | undefined, option?: AutoCompleteOption) => {
        const stored = isAutoCompleteEmptyValue(next) ? undefined : next
        if (option && stored !== undefined) rememberLabel(stored, option.label)
        else if (stored !== undefined) rememberLabel(stored, String(stored))
        else rememberLabel(undefined, '')
        writeNative(stored)
        setCommitted(stored ?? null)
        if (option && stored !== undefined) onSelect?.(option.value, option)
      },
      [onSelect, rememberLabel, setCommitted, writeNative]
    )

    const commitCurrentQuery = useCallback(() => {
      const result = resolveAutoCompleteBlurCommit({
        query: queryRef.current,
        committed: committedRef.current,
        optionList: optionsRef.current,
        allowFreeInput: allowFreeInputRef.current
      })
      if (result.option && !isAutoCompleteEmptyValue(result.value)) {
        rememberLabel(result.value as AutoCompleteValue, result.query)
      } else if (!isAutoCompleteEmptyValue(result.value)) {
        rememberLabel(result.value as AutoCompleteValue, result.query)
      } else {
        rememberLabel(undefined, '')
      }
      applyQuery(result.query)
      writeNative(result.value)
      if (result.didCommit) commitValue(result.value, result.option)
      return result
    }, [applyQuery, commitValue, rememberLabel, writeNative])

    const revertQuery = useCallback(() => {
      const committedNow = committedRef.current
      const memory = labelMemory.current
      const label =
        memory && isSameAutoCompleteValue(memory.value, committedNow)
          ? memory.label
          : resolveAutoCompleteInitialQuery({
              committed: committedNow,
              optionList: optionsRef.current
            })
      applyQuery(label)
    }, [applyQuery])

    const finishEdit = useCallback(() => {
      isEditingRef.current = false
      const result = commitCurrentQuery()
      writeNative(result.value)
      closeDropdown()
    }, [closeDropdown, commitCurrentQuery, writeNative])

    const handleDismiss = useCallback(
      (reason: 'outside' | 'escape') => {
        if (reason === 'escape') {
          isEditingRef.current = false
          revertQuery()
          closeDropdown()
          return
        }
        finishEdit()
      },
      [closeDropdown, finishEdit, revertQuery]
    )

    const overlay = useAnchoredOverlay({
      enabled: isOpen,
      referenceRef: inputRef,
      floatingRef: dropdownRef,
      containerRef: rootRef,
      placement,
      offset,
      layout: 'fullscreen-sm',
      matchReferenceWidth: true,
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: getPopupContainer,
      onDismiss: handleDismiss
    })

    useEffect(() => {
      if (wasOpenRef.current && !isOpen && isEditingRef.current) {
        isEditingRef.current = false
        commitCurrentQuery()
      }
      wasOpenRef.current = isOpen
    }, [commitCurrentQuery, isOpen])

    const handleSelect = (option: AutoCompleteOption) => {
      if (option.disabled || !canEdit) return
      isEditingRef.current = false
      applyQuery(isAutoCompleteEmptyValue(option.value) ? '' : option.label)
      commitValue(option.value, option)
      closeDropdown()
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!canEdit) return
      const next = event.target.value
      isEditingRef.current = true
      applyQuery(next)
      if (!isOpen) setOpen(true)
      const nextItems = filterAutoCompleteOptions(options, next, filterOption)
      const index = getInitialPickerActiveIndex(nextItems, defaultActiveFirstOption)
      activeKeyRef.current = index >= 0 ? autoCompleteOptionIdentity(nextItems[index]) : undefined
      setActiveIndex(index)
    }

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      if (!canEdit) return
      isEditingRef.current = true
      applyQuery('')
      commitValue(undefined)
      inputRef.current?.focus()
      if (!isOpen) setOpen(true)
      const index = getInitialPickerActiveIndex(options, defaultActiveFirstOption)
      activeKeyRef.current = index >= 0 ? autoCompleteOptionIdentity(options[index]) : undefined
      setActiveIndex(index)
    }

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (canEdit) {
        isEditingRef.current = true
        openDropdown()
      }
      onFocus?.(event)
    }

    const handleFocusOut = (event: React.FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null
      if (
        (rootRef.current && next && rootRef.current.contains(next)) ||
        (dropdownRef.current && next && dropdownRef.current.contains(next))
      ) {
        return
      }
      isEditingRef.current = false
      commitCurrentQuery()
      closeDropdown()
      formItemControl?.onBlur?.()
      onBlur?.(event as React.FocusEvent<HTMLInputElement>)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        composingRef.current ||
        isImeCompositionEvent(event.nativeEvent) ||
        !canEdit
      ) {
        return
      }
      const intent = getAutoCompleteKeyIntent(event.key, isOpen, activeIndex, filteredOptions.length)
      switch (intent.type) {
        case 'open':
          event.preventDefault()
          openDropdown()
          return
        case 'navigate':
          event.preventDefault()
          setActiveIndex((prev) => {
            const next = getPickerNavigationIndex(filteredOptions, prev, intent.key)
            activeKeyRef.current =
              next >= 0 ? autoCompleteOptionIdentity(filteredOptions[next]) : undefined
            return next
          })
          return
        case 'select-active': {
          event.preventDefault()
          const option = filteredOptions[activeIndex]
          if (option) handleSelect(option)
          return
        }
        case 'commit-query':
          if (!intent.allowDefault) event.preventDefault()
          finishEdit()
          return
        case 'close':
          event.preventDefault()
          isEditingRef.current = false
          revertQuery()
          closeDropdown()
          return
        default:
          return
      }
    }

    const listMounted = hasOptions
    const popupId = `${listboxId}-popup`
    const comboboxAria = {
      ...getPickerComboboxAria({
        expanded: isOpen,
        listboxId,
        activeIndex: listMounted && optionWindow.activeInWindow ? activeIndex : -1,
        listMounted
      }),
      'aria-controls': isOpen ? (listMounted ? listboxId : popupId) : undefined,
      'aria-autocomplete': 'list' as const,
      id: effectiveId,
      'aria-label': ariaLabel,
      'aria-labelledby': labelledby,
      'aria-describedby': describedBy,
      'aria-invalid': status === 'error' || sanitized?.invalid ? true : undefined,
      'aria-required': formItemControl?.required ? true : undefined,
      readOnly: isReadOnly || undefined
    }

    const renderAutoCompleteOption = (option: (typeof filteredOptions)[number], index: number) => {
      const selected = isSameAutoCompleteValue(option.value, committedValue)
      const isActive = index === activeIndex
      return (
        <div
          key={getAutoCompleteOptionKey(option, index)}
          id={getPickerOptionId(listboxId, index)}
          data-active={isActive || undefined}
          {...getPickerOptionAria({
            selected,
            disabled: !!option.disabled
          })}
          className={getAutoCompleteOptionClasses({
            isSelected: selected,
            isDisabled: !!option.disabled,
            isActive,
            size
          })}
          style={virtualizeOptions ? { height: optionItemHeight } : undefined}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleSelect(option)}
          onMouseEnter={() => {
            if (!option.disabled) setActiveIndex(index)
          }}>
          {option.label}
        </div>
      )
    }

    const dropdown = isOpen ? (
      <div
        ref={dropdownRef}
        className={classNames(
          autoCompleteDropdownClasses,
          overlay.floatingClasses,
          dropdownClassName
        )}
        style={overlay.floatingStyles}
        data-positioned={overlay.positioned}
        id={popupId}
        data-tiger-autocomplete-dropdown=""
        onMouseDown={(event) => event.preventDefault()}
        onBlur={handleFocusOut}>
        {hasOptions ? (
          <div
            className={autoCompleteListboxClasses}
            style={
              virtualizeOptions
                ? { height: listHeight, overflow: 'auto' }
                : getAutoCompletePanelStyle(listHeight)
            }
            ref={virtualizeOptions ? optionWindow.scrollerRef : undefined}
            onScroll={virtualizeOptions ? optionWindow.onScroll : undefined}
            data-tiger-autocomplete-virtual={virtualizeOptions ? '' : undefined}
            {...getPickerListboxAria({ id: listboxId })}>
            {(virtualizeOptions && optionWindow.range
              ? [
                  <div
                    key="window"
                    style={{ height: optionWindow.range.totalHeight, position: 'relative' }}>
                    <div style={{ transform: `translateY(${optionWindow.range.offsetTop}px)` }}>
                      {filteredOptions
                        .slice(optionWindow.range.startIndex, optionWindow.range.endIndex + 1)
                        .map((option, offset) => {
                          const index = optionWindow.range!.startIndex + offset
                          return renderAutoCompleteOption(option, index)
                        })}
                    </div>
                  </div>
                ]
              : filteredOptions.map((option, index) => renderAutoCompleteOption(option, index))
            )}
          </div>
        ) : (
          <div className={autoCompleteEmptyStateClasses} role="status" aria-live="polite">
            {loading ? loadingText : resolvedEmptyText}
          </div>
        )}
        <div className={autoCompleteDoneActionClasses}>
          <button type="button" className={autoCompleteDoneButtonClasses} onClick={finishEdit}>
            {doneText}
          </button>
        </div>
      </div>
    ) : null

    return (
      <div
        ref={rootRef}
        className={getAutoCompleteRootClasses(inputGroup != null, className)}
        style={style}
        {...{ [TIGER_CHROME_ATTR]: '' }}
        onAnimationEnd={() => rootRef.current?.classList.remove(SHAKE_CLASS)}>
        {effectiveName ? (
          <input
            ref={hiddenRef}
            type="hidden"
            name={effectiveName}
            value={committedValue === undefined ? '' : String(committedValue)}
            disabled={effectiveDisabled || undefined}
          />
        ) : null}
        {sanitized?.invalid && !formItemControl ? (
          <p role="status" aria-live="polite">
            {AUTO_COMPLETE_INVALID_VALUE}
          </p>
        ) : null}
        <div className="relative">
          <input
            {...rest}
            ref={setInputRefs}
            type="text"
            className={getAutoCompleteInputClasses({
              size,
              disabled: effectiveDisabled,
              isOpen,
              status,
              hasClear: showClear
            })}
            value={query}
            placeholder={placeholder}
            disabled={effectiveDisabled}
            autoComplete="off"
            {...comboboxAria}
            onChange={handleInput}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onBlur={handleFocusOut}
            onCompositionStart={() => {
              composingRef.current = true
            }}
            onCompositionEnd={() => {
              composingRef.current = false
            }}
          />
          {showClear ? (
            <span className={autoCompleteTrailingSlotClasses}>
              <button
                type="button"
                className={autoCompleteClearButtonClasses}
                data-tiger-autocomplete-clear=""
                aria-label={clearAriaLabel}
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClear}>
                <AutoCompleteClearIcon />
              </button>
            </span>
          ) : null}
        </div>
        {dropdown && renderOverlayPortal(dropdown, overlay.target)}
      </div>
    )
  }
)

AutoComplete.displayName = 'AutoComplete'
