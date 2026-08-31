import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type {
  MentionOption,
  MentionsFilterOption,
  MentionsProps as CoreMentionsProps
} from '@expcat/tigercat-core'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  classNames,
  extractMentionQuery,
  filterMentionOptions,
  getEmptyLabels,
  getInitialMentionsActiveIndex,
  getInputErrorClasses,
  getMentionOptionKey,
  getMentionsKeyIntent,
  getMentionsOptionClasses,
  getMentionsPanelStyle,
  getMentionsTextareaClasses,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  insertMention,
  mentionsDropdownClasses,
  mentionsEmptyStateClasses,
  mentionsListboxClasses,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  resolveLocaleText,
  runShakeAnimation,
  shouldOpenMentions
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'
import { useInputGroupContext } from './InputGroup'

export type { MentionOption }

export interface MentionsProps
  extends
    Omit<CoreMentionsProps, 'value' | 'defaultValue' | 'open'>,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'onFocus' | 'onBlur' | 'prefix' | 'size'
    > {
  value?: string
  defaultValue?: string
  open?: boolean
  onChange?: (value: string) => void
  onSelect?: (option: MentionOption) => void
  onSearch?: (query: string) => void
  onOpenChange?: (open: boolean) => void
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
}

export const Mentions = forwardRef<HTMLTextAreaElement, MentionsProps>(
  function Mentions(props, ref) {
    const {
      value,
      defaultValue = '',
      open,
      defaultOpen = false,
      prefix = '@',
      options = [],
      placeholder,
      disabled = false,
      size = 'md',
      rows = 3,
      status: statusProp,
      errorMessage: errorMessageProp,
      name,
      id,
      loading = false,
      filterOption = true,
      placement = 'bottom-start',
      offset = 4,
      dropdownClassName,
      getPopupContainer,
      listHeight = 256,
      locale,
      className,
      onChange,
      onSelect,
      onSearch,
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
    const loadingText = mergedLocale?.common?.loadingText ?? 'Loading...'
    const resolvedEmptyText = resolveLocaleText(emptyLabels.noResults)

    const inGroup = inputGroup != null
    const effectiveSize = size ?? inputGroup?.size ?? 'md'
    const status = statusProp ?? formItemControl?.status ?? 'default'
    const errorMessage = errorMessageProp
    const shakeTrigger = formItemControl?.shakeTrigger
    const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
    const effectiveId = id ?? formItemControl?.id
    const effectiveName = name ?? formItemControl?.name
    const formBoundValue = formItemControl?.value
    const resolvedValue =
      value !== undefined ? value : typeof formBoundValue === 'string' ? formBoundValue : undefined

    const instanceId = useId()
    const listboxId = `tiger-mentions-listbox-${instanceId}`
    const errorMsgId = `tiger-mentions-error-${instanceId}`
    const mountedRef = useRef(false)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const mentionStartRef = useRef(-1)
    const mentionEndRef = useRef(-1)
    const mentionPrefixRef = useRef('@')
    const pendingCaret = useRef<number | null>(null)
    const dismissedRef = useRef(false)
    const liveTextRef = useRef(resolvedValue ?? defaultValue)

    const [currentValue, setCurrentValue] = useControlledState({
      value: resolvedValue,
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
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(-1)

    const setRefs = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
    }

    const filteredOptions = useMemo(
      () => filterMentionOptions(options, query, filterOption as MentionsFilterOption),
      [options, query, filterOption]
    )
    const expanded =
      isOpen &&
      shouldOpenMentions({
        query:
          mentionStartRef.current >= 0
            ? { query, startPos: mentionStartRef.current, prefix: mentionPrefixRef.current }
            : null,
        filteredCount: filteredOptions.length,
        loading
      })

    const applyQuery = useCallback(
      (text: string, cursor: number) => {
        const result = extractMentionQuery(text, cursor, prefix)
        if (result) {
          mentionStartRef.current = result.startPos
          mentionEndRef.current = cursor
          mentionPrefixRef.current = result.prefix
          setQuery(result.query)
          onSearch?.(result.query)
          const nextFiltered = filterMentionOptions(
            options,
            result.query,
            filterOption as MentionsFilterOption
          )
          setOpen(
            shouldOpenMentions({
              query: result,
              filteredCount: nextFiltered.length,
              loading
            })
          )
          setActiveIndex(getInitialMentionsActiveIndex(nextFiltered))
          return
        }
        mentionStartRef.current = -1
        mentionEndRef.current = -1
        setQuery('')
        setOpen(false)
        setActiveIndex(-1)
      },
      [filterOption, loading, onSearch, options, prefix, setOpen]
    )

    useEffect(() => {
      if (dismissedRef.current) return
      const textarea = textareaRef.current
      const text = textarea?.value ?? currentValue
      const result = extractMentionQuery(text, textarea?.selectionStart ?? text.length, prefix)
      if (!result) return
      const nextFiltered = filterMentionOptions(
        options,
        result.query,
        filterOption as MentionsFilterOption
      )
      setOpen(
        shouldOpenMentions({
          query: result,
          filteredCount: nextFiltered.length,
          loading
        })
      )
    }, [currentValue, filterOption, loading, options, prefix, setOpen])

    useLayoutEffect(() => {
      if (pendingCaret.current === null || !textareaRef.current) return
      const caret = pendingCaret.current
      textareaRef.current.setSelectionRange(caret, caret)
      pendingCaret.current = null
    })

    useEffect(() => {
      if (!mountedRef.current) {
        mountedRef.current = true
        return
      }
      if (status === 'error') runShakeAnimation(textareaRef.current)
    }, [status, shakeTrigger])

    const closeDropdown = useCallback(() => {
      dismissedRef.current = true
      setOpen(false)
      setActiveIndex(-1)
    }, [setOpen])

    const overlay = useAnchoredOverlay({
      enabled: expanded,
      referenceRef: textareaRef,
      floatingRef: dropdownRef,
      containerRef: textareaRef,
      placement,
      offset,
      layout: 'fullscreen-sm',
      matchReferenceWidth: true,
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: getPopupContainer,
      onDismiss: closeDropdown
    })

    const commitValue = useCallback(
      (next: string, caret?: number) => {
        liveTextRef.current = next
        if (textareaRef.current) textareaRef.current.value = next
        if (caret !== undefined) pendingCaret.current = caret
        setCurrentValue(next)
      },
      [setCurrentValue]
    )

    const selectOption = useCallback(
      (option: MentionOption) => {
        if (option.disabled || effectiveDisabled) return
        const textarea = textareaRef.current
        const text = liveTextRef.current || textarea?.value || currentValue
        const cursor =
          mentionEndRef.current >= 0
            ? mentionEndRef.current
            : (textarea?.selectionStart ?? text.length)
        const result = insertMention({
          text,
          mentionStart: mentionStartRef.current,
          cursor,
          prefix: mentionPrefixRef.current,
          value: option.value
        })
        commitValue(result.value, result.caret)
        onSelect?.(option)
        mentionStartRef.current = -1
        mentionEndRef.current = -1
        setQuery('')
        closeDropdown()
        textarea?.focus()
      },
      [closeDropdown, commitValue, currentValue, effectiveDisabled, onSelect, setQuery]
    )

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (effectiveDisabled) return
      dismissedRef.current = false
      const next = event.currentTarget.value
      liveTextRef.current = next
      setCurrentValue(next)
      applyQuery(next, event.currentTarget.selectionStart ?? next.length)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const intent = getMentionsKeyIntent(event.key, expanded)
      switch (intent.type) {
        case 'navigate':
          event.preventDefault()
          setActiveIndex((prev) => getPickerNavigationIndex(filteredOptions, prev, intent.key))
          return
        case 'select-active': {
          const option = filteredOptions[activeIndex]
          if (!option || option.disabled) return
          event.preventDefault()
          selectOption(option)
          return
        }
        case 'close':
          event.preventDefault()
          closeDropdown()
          return
        default:
          return
      }
    }

    const handleFocusOut = (event: React.FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null
      if (
        (textareaRef.current && next && textareaRef.current.contains(next)) ||
        (dropdownRef.current && next && dropdownRef.current.contains(next))
      ) {
        return
      }
      closeDropdown()
      formItemControl?.onBlur?.()
      onBlur?.(event as React.FocusEvent<HTMLTextAreaElement>)
    }

    const activeError = status === 'error' && !!errorMessage
    const hasExtras = activeError
    const labelledby =
      typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
        ? rest['aria-labelledby']
        : formItemControl?.labelId
    const describedBy = mergeAriaDescribedBy(
      mergeAriaDescribedBy(
        typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
        activeError ? errorMsgId : undefined
      ),
      formItemControl?.describedBy
    )
    const comboboxAria = {
      ...getPickerComboboxAria({
        expanded,
        listboxId,
        activeIndex: expanded ? activeIndex : -1
      }),
      'aria-autocomplete': 'list' as const
    }

    const textarea = (
      <textarea
        {...rest}
        {...comboboxAria}
        ref={setRefs}
        className={classNames(
          getMentionsTextareaClasses({
            size: effectiveSize,
            status,
            inGroup: inGroup && !hasExtras
          }),
          !hasExtras ? className : undefined
        )}
        style={!hasExtras ? style : undefined}
        value={currentValue}
        placeholder={placeholder}
        disabled={effectiveDisabled}
        rows={rows}
        name={effectiveName}
        id={effectiveId}
        aria-label={typeof rest['aria-label'] === 'string' ? rest['aria-label'] : undefined}
        aria-labelledby={labelledby}
        aria-invalid={status === 'error' ? true : rest['aria-invalid']}
        aria-required={formItemControl?.required ? true : rest['aria-required']}
        aria-describedby={describedBy}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={handleFocusOut}
        onAnimationEnd={() => textareaRef.current?.classList.remove(SHAKE_CLASS)}
        {...{ [TIGER_CHROME_ATTR]: '' }}
      />
    )

    const dropdown = renderOverlayPortal(
      expanded ? (
        <div
          ref={dropdownRef}
          className={classNames(
            mentionsDropdownClasses,
            overlay.floatingClasses,
            dropdownClassName
          )}
          style={overlay.floatingStyles}
          data-positioned={overlay.positioned}
          onMouseDown={(event) => event.preventDefault()}>
          {loading && filteredOptions.length === 0 ? (
            <div className={mentionsEmptyStateClasses}>{loadingText}</div>
          ) : filteredOptions.length === 0 ? (
            <div className={mentionsEmptyStateClasses}>{resolvedEmptyText}</div>
          ) : (
            <div
              className={mentionsListboxClasses}
              style={getMentionsPanelStyle(listHeight)}
              {...getPickerListboxAria({ id: listboxId })}>
              {filteredOptions.map((option, index) => {
                const isActive = index === activeIndex
                return (
                  <div
                    key={getMentionOptionKey(option, index)}
                    id={getPickerOptionId(listboxId, index)}
                    data-active={isActive || undefined}
                    {...getPickerOptionAria({
                      selected: false,
                      disabled: !!option.disabled
                    })}
                    className={getMentionsOptionClasses({
                      isActive,
                      isDisabled: !!option.disabled,
                      size: effectiveSize
                    })}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => {
                      if (!option.disabled) setActiveIndex(index)
                    }}>
                    {option.label}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : null,
      overlay.target
    )

    if (!hasExtras) {
      return (
        <>
          {textarea}
          {dropdown}
        </>
      )
    }

    return (
      <div
        className={classNames(
          inGroup ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
          className
        )}
        style={style}>
        {textarea}
        {activeError ? (
          <div id={errorMsgId} className={getInputErrorClasses(effectiveSize)} aria-live="polite">
            {errorMessage}
          </div>
        ) : null}
        {dropdown}
      </div>
    )
  }
)

Mentions.displayName = 'Mentions'

export default Mentions
