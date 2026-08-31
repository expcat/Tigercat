import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type {
  AutoCompleteOption,
  AutoCompleteProps as CoreAutoCompleteProps,
  AutoCompleteValue
} from '@expcat/tigercat-core'
import {
  classNames,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  closeSolidIcon20PathD,
  coerceAutoCompleteFormValue,
  filterAutoCompleteOptions,
  getAutoCompleteInputClasses,
  getAutoCompleteOptionClasses,
  getAutoCompleteOptionKey,
  getAutoCompletePanelStyle,
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
  icon20ViewBox,
  isSameAutoCompleteValue,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  resolveAutoCompleteBlurCommit,
  resolveAutoCompleteIdleQuery,
  resolveAutoCompleteInitialQuery,
  resolveLocaleText,
  runShakeAnimation,
  shouldShowAutoCompleteClear,
  autoCompleteClearButtonClasses,
  autoCompleteClearIconClasses,
  autoCompleteDoneActionClasses,
  autoCompleteDoneButtonClasses,
  autoCompleteDropdownClasses,
  autoCompleteEmptyStateClasses,
  autoCompleteListboxClasses,
  autoCompleteTrailingSlotClasses
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'
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

    const incomingValue =
      value !== undefined ? value : coerceAutoCompleteFormValue(formItemControl?.value)
    const [committed, setCommitted] = useControlledState<AutoCompleteValue | undefined>({
      value: incomingValue,
      defaultValue,
      onChange: (next) => {
        onChange?.(next)
        formItemControl?.onChange?.(next)
      }
    })

    const [isOpen, setOpen] = useControlledState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange
    })

    const [query, setQuery] = useControlledState({
      value: searchValue,
      defaultValue: resolveAutoCompleteInitialQuery({
        defaultSearchValue,
        committed: incomingValue !== undefined ? incomingValue : defaultValue,
        optionList: options
      }),
      onChange: onSearchChange
    })

    const instanceId = useId()
    const listboxId = `tiger-autocomplete-listbox-${instanceId}`
    const [activeIndex, setActiveIndex] = useState(-1)
    const isEditingRef = useRef(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const mountedRef = useRef(false)
    const committedRef = useRef(committed)
    committedRef.current = committed
    const queryRef = useRef(query)
    queryRef.current = query
    const optionsRef = useRef(options)
    optionsRef.current = options
    const allowFreeInputRef = useRef(allowFreeInput)
    allowFreeInputRef.current = allowFreeInput
    const hadCommittedRef = useRef(committed !== undefined)

    const filteredOptions = useMemo(
      () => filterAutoCompleteOptions(options, query, filterOption),
      [filterOption, options, query]
    )
    const hasOptions = filteredOptions.length > 0
    const showClear = shouldShowAutoCompleteClear({
      clearable,
      disabled: effectiveDisabled,
      query,
      committed
    })

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

    useEffect(() => {
      if (searchValue !== undefined) return
      if (isEditingRef.current) return
      if (committed === undefined) {
        if (hadCommittedRef.current) setQuery('')
        hadCommittedRef.current = false
        return
      }
      hadCommittedRef.current = true
      setQuery(resolveAutoCompleteIdleQuery(committed, options))
    }, [committed, options, searchValue, setQuery])

    const openDropdown = useCallback(() => {
      if (effectiveDisabled) return
      setOpen(true)
      setActiveIndex(getInitialPickerActiveIndex(filteredOptions, defaultActiveFirstOption))
    }, [defaultActiveFirstOption, effectiveDisabled, filteredOptions, setOpen])

    const closeDropdown = useCallback(() => {
      setOpen(false)
      setActiveIndex(-1)
    }, [setOpen])

    const applyQuery = useCallback(
      (next: string) => {
        setQuery(next)
      },
      [setQuery]
    )

    const commitValue = useCallback(
      (next: AutoCompleteValue | undefined, option?: AutoCompleteOption) => {
        setCommitted(next)
        if (option) onSelect?.(option.value, option)
      },
      [onSelect, setCommitted]
    )

    const commitCurrentQuery = useCallback(() => {
      const result = resolveAutoCompleteBlurCommit({
        query: queryRef.current,
        committed: committedRef.current,
        optionList: optionsRef.current,
        allowFreeInput: allowFreeInputRef.current
      })
      applyQuery(result.query)
      if (result.didCommit) commitValue(result.value, result.option)
      return result
    }, [applyQuery, commitValue])

    const revertQuery = useCallback(() => {
      applyQuery(resolveAutoCompleteIdleQuery(committedRef.current, optionsRef.current))
    }, [applyQuery])

    const handleDismiss = useCallback(
      (reason: 'outside' | 'escape') => {
        if (reason === 'escape') {
          isEditingRef.current = false
          revertQuery()
          closeDropdown()
          return
        }
        isEditingRef.current = false
        commitCurrentQuery()
        closeDropdown()
      },
      [closeDropdown, commitCurrentQuery, revertQuery]
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

    const handleSelect = (option: AutoCompleteOption) => {
      if (option.disabled || effectiveDisabled) return
      isEditingRef.current = false
      applyQuery(option.label)
      commitValue(option.value, option)
      closeDropdown()
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (effectiveDisabled) return
      const next = event.target.value
      isEditingRef.current = true
      applyQuery(next)
      if (!isOpen) setOpen(true)
      setActiveIndex(
        getInitialPickerActiveIndex(
          filterAutoCompleteOptions(options, next, filterOption),
          defaultActiveFirstOption
        )
      )
    }

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      isEditingRef.current = true
      applyQuery('')
      commitValue(undefined)
      inputRef.current?.focus()
      if (!isOpen) setOpen(true)
      setActiveIndex(getInitialPickerActiveIndex(options, defaultActiveFirstOption))
    }

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      isEditingRef.current = true
      openDropdown()
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
      const intent = getAutoCompleteKeyIntent(event.key, isOpen, activeIndex)
      switch (intent.type) {
        case 'open':
          event.preventDefault()
          openDropdown()
          return
        case 'navigate':
          event.preventDefault()
          setActiveIndex((prev) => getPickerNavigationIndex(filteredOptions, prev, intent.key))
          return
        case 'select-active': {
          event.preventDefault()
          const option = filteredOptions[activeIndex]
          if (option) handleSelect(option)
          return
        }
        case 'commit-query':
          event.preventDefault()
          isEditingRef.current = false
          commitCurrentQuery()
          closeDropdown()
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

    const expanded = isOpen && hasOptions
    const comboboxAria = {
      ...getPickerComboboxAria({
        expanded,
        listboxId,
        activeIndex: expanded ? activeIndex : -1
      }),
      'aria-autocomplete': 'list' as const,
      id: effectiveId,
      name: effectiveName,
      'aria-label': ariaLabel,
      'aria-labelledby': labelledby,
      'aria-describedby': describedBy,
      'aria-invalid': status === 'error' ? true : undefined,
      'aria-required': formItemControl?.required ? true : undefined
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
        data-tiger-autocomplete-dropdown=""
        onMouseDown={(event) => event.preventDefault()}
        onBlur={handleFocusOut}>
        {hasOptions ? (
          <div
            className={autoCompleteListboxClasses}
            style={getAutoCompletePanelStyle(listHeight)}
            {...getPickerListboxAria({ id: listboxId })}>
            {filteredOptions.map((option, index) => {
              const selected = isSameAutoCompleteValue(option.value, committed)
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
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => {
                    if (!option.disabled) setActiveIndex(index)
                  }}>
                  {option.label}
                </div>
              )
            })}
          </div>
        ) : (
          <div className={autoCompleteEmptyStateClasses}>
            {loading ? loadingText : resolvedEmptyText}
          </div>
        )}
        <div className={autoCompleteDoneActionClasses}>
          <button type="button" className={autoCompleteDoneButtonClasses} onClick={closeDropdown}>
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
