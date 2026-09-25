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
  autoResizeTextarea,
  classNames,
  clearTextareaAutoResize,
  formatInputCountText,
  getInputCountClasses,
  FIELD_EXTRA_ATTR,
  fieldExtraKind,
  getFieldExtrasHostClasses,
  getGroupedFieldExtraStackClasses,
  extractMentionQuery,
  filterMentionOptions,
  getEmptyLabels,
  getInitialMentionsActiveIndex,
  getInputErrorClasses,
  getMentionOptionKey,
  getMentionsKeyIntent,
  getMentionsOptionClasses,
  getAutoCompleteVirtualItemHeight,
  getMentionsPanelStyle,
  shouldVirtualizeAutoCompleteList,
  getMentionsTextareaClasses,
  getPickerComboboxAria,
  isImeCompositionEvent,
  readMentionSnapshot,
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
import { useTigerConfig } from './tiger-config'
import { useFixedVirtualWindow } from './internal/useFixedVirtualWindow'
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
  onSearch?: (query: string, prefix: string) => void
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
      autoResize = false,
      maxRows,
      minRows,
      maxLength,
      showCount = false,
      readOnly = false,
      clearable = false,
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
    const isReadOnly = Boolean(readOnly)
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
    const mentionPrefixRef = useRef('@')
    const snapshotRef = useRef<ReturnType<typeof readMentionSnapshot>>(null)
    const composingRef = useRef(false)
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
    const mentionActive = mentionStartRef.current >= 0
    const expanded = isOpen && mentionActive
    const listMounted = expanded && filteredOptions.length > 0
    const mentionItemHeight = getAutoCompleteVirtualItemHeight(effectiveSize)
    const virtualizeMentions = shouldVirtualizeAutoCompleteList(
      filteredOptions.length,
      listHeight,
      effectiveSize
    )
    const mentionWindow = useFixedVirtualWindow({
      enabled: virtualizeMentions,
      activeIndex,
      itemHeight: mentionItemHeight,
      viewport: listHeight,
      count: filteredOptions.length
    })

    const applyQuery = useCallback(
      (text: string, cursor: number) => {
        const result = extractMentionQuery(text, cursor, prefix)
        if (result) {
          mentionStartRef.current = result.startPos
          mentionPrefixRef.current = result.prefix
          snapshotRef.current = { ...result, text, cursor }
          setQuery(result.query)
          onSearch?.(result.query, result.prefix)
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
        snapshotRef.current = null
        setQuery('')
        setOpen(false)
        setActiveIndex(-1)
      },
      [filterOption, loading, onSearch, options, prefix, setOpen]
    )

    useEffect(() => {
      if (dismissedRef.current || isReadOnly) return
      if (liveTextRef.current && liveTextRef.current !== currentValue) return
      const textarea = textareaRef.current
      const text = textarea?.value ?? currentValue
      const cursor = textarea?.selectionStart ?? text.length
      const result = extractMentionQuery(text, cursor, prefix)
      if (!result) {
        if (mentionStartRef.current !== -1) mentionStartRef.current = -1
        return
      }
      if (
        mentionStartRef.current === result.startPos &&
        mentionPrefixRef.current === result.prefix &&
        query === result.query
      ) {
        return
      }
      mentionStartRef.current = result.startPos
      mentionPrefixRef.current = result.prefix
      setQuery(result.query)
      onSearch?.(result.query, result.prefix)
      setOpen(shouldOpenMentions({ query: result, loading }))
      setActiveIndex(
        getInitialMentionsActiveIndex(
          filterMentionOptions(options, result.query, filterOption as MentionsFilterOption)
        )
      )
    }, [currentValue, filterOption, isReadOnly, loading, onSearch, options, prefix, query, setOpen])

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
        if (option.disabled || effectiveDisabled || isReadOnly || composingRef.current) return
        const textarea = textareaRef.current
        const text = textarea?.value ?? liveTextRef.current ?? currentValue
        const cursor = textarea?.selectionStart ?? text.length
        const fresh = readMentionSnapshot(text, cursor, prefix)
        const snapshot = fresh ?? snapshotRef.current
        if (!snapshot) return
        const result = insertMention({
          text: snapshot.text,
          mentionStart: snapshot.startPos,
          cursor: snapshot.cursor,
          prefix: snapshot.prefix,
          value: option.value
        })
        commitValue(result.value, result.caret)
        onSelect?.(option)
        mentionStartRef.current = -1
        setQuery('')
        closeDropdown()
        textarea?.focus()
      },
      [
        closeDropdown,
        commitValue,
        currentValue,
        effectiveDisabled,
        isReadOnly,
        onSelect,
        prefix,
        setQuery
      ]
    )

    const syncFromField = (field?: HTMLTextAreaElement | null) => {
      const textarea = field ?? textareaRef.current
      const text = textarea?.value ?? currentValue
      const cursor = textarea?.selectionStart ?? text.length
      liveTextRef.current = text
      applyQuery(text, cursor)
    }

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (effectiveDisabled || isReadOnly) return
      dismissedRef.current = false
      const next = event.currentTarget.value
      liveTextRef.current = next
      setCurrentValue(next)
      applyQuery(next, event.currentTarget.selectionStart ?? next.length)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (composingRef.current || isImeCompositionEvent(event.nativeEvent) || isReadOnly) return
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
    const hasExtras =
      activeError || showCount || (clearable && currentValue.length > 0 && !effectiveDisabled)

    useLayoutEffect(() => {
      if (!textareaRef.current) return
      if (!autoResize) {
        clearTextareaAutoResize(textareaRef.current)
        return
      }
      autoResizeTextarea(textareaRef.current, { minRows: minRows ?? rows, maxRows })
    }, [autoResize, currentValue, minRows, maxRows, rows])
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
    const popupId = `${listboxId}-popup`
    const comboboxAria = {
      ...getPickerComboboxAria({
        expanded,
        listboxId: listMounted ? listboxId : popupId,
        activeIndex: listMounted && mentionWindow.activeInWindow ? activeIndex : -1,
        listMounted
      }),
      'aria-controls': expanded ? (listMounted ? listboxId : popupId) : undefined,
      'aria-autocomplete': 'list' as const
    }
    const clearLabel = mergedLocale?.common?.clearText ?? 'Clear'

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
          autoResize ? 'resize-none' : undefined,
          !hasExtras ? className : undefined
        )}
        style={!hasExtras ? style : undefined}
        value={currentValue}
        placeholder={placeholder}
        disabled={effectiveDisabled}
        readOnly={isReadOnly || undefined}
        maxLength={maxLength}
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
        onKeyUp={(event) => {
          if (isReadOnly || effectiveDisabled) return
          syncFromField(event.currentTarget)
        }}
        onClick={(event) => {
          if (isReadOnly || effectiveDisabled) return
          syncFromField(event.currentTarget)
        }}
        onCompositionStart={() => {
          composingRef.current = true
        }}
        onCompositionEnd={() => {
          composingRef.current = false
        }}
        onFocus={onFocus}
        onBlur={handleFocusOut}
        onAnimationEnd={() => textareaRef.current?.classList.remove(SHAKE_CLASS)}
        {...{ [TIGER_CHROME_ATTR]: '' }}
      />
    )

    const renderMentionOption = (option: MentionOption, index: number) => {
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
          style={virtualizeMentions ? { height: mentionItemHeight } : undefined}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => selectOption(option)}
          onMouseEnter={() => {
            if (!option.disabled) setActiveIndex(index)
          }}>
          {option.label}
        </div>
      )
    }

    const dropdown = renderOverlayPortal(
      expanded ? (
        <div
          ref={dropdownRef}
          id={listMounted ? undefined : popupId}
          className={classNames(
            mentionsDropdownClasses,
            overlay.floatingClasses,
            dropdownClassName
          )}
          style={overlay.floatingStyles}
          data-positioned={overlay.positioned}
          onMouseDown={(event) => event.preventDefault()}>
          {loading && filteredOptions.length === 0 ? (
            <div className={mentionsEmptyStateClasses} role="status" aria-live="polite">
              {loadingText}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className={mentionsEmptyStateClasses} role="status" aria-live="polite">
              {resolvedEmptyText}
            </div>
          ) : (
            <div
              className={mentionsListboxClasses}
              style={
                virtualizeMentions
                  ? { height: listHeight, overflow: 'auto' }
                  : getMentionsPanelStyle(listHeight)
              }
              ref={virtualizeMentions ? mentionWindow.scrollerRef : undefined}
              onScroll={virtualizeMentions ? mentionWindow.onScroll : undefined}
              data-tiger-mentions-virtual={virtualizeMentions ? '' : undefined}
              {...getPickerListboxAria({ id: listboxId })}>
              {virtualizeMentions && mentionWindow.range ? (
                <div style={{ height: mentionWindow.range.totalHeight, position: 'relative' }}>
                  <div style={{ transform: `translateY(${mentionWindow.range.offsetTop}px)` }}>
                    {filteredOptions
                      .slice(mentionWindow.range.startIndex, mentionWindow.range.endIndex + 1)
                      .map((option, offset) =>
                        renderMentionOption(option, mentionWindow.range!.startIndex + offset)
                      )}
                  </div>
                </div>
              ) : (
                filteredOptions.map((option, index) => renderMentionOption(option, index))
              )}
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

    const showClear = Boolean(clearable && currentValue && !effectiveDisabled && !isReadOnly)
    const messages = (
      <>
        {showClear ? (
          <button
            type="button"
            className="self-end text-sm text-[var(--tiger-text-secondary)]"
            aria-label={clearLabel}
            onClick={() => commitValue('')}>
            ×
          </button>
        ) : null}
        {activeError ? (
          <div id={errorMsgId} className={getInputErrorClasses(effectiveSize)} aria-live="polite">
            {errorMessage}
          </div>
        ) : null}
        {showCount ? (
          <div
            className={getInputCountClasses(
              maxLength !== undefined && currentValue.length > maxLength
            )}>
            {formatInputCountText(currentValue.length, maxLength)}
          </div>
        ) : null}
      </>
    )
    const messageCount = Number(showClear) + Number(activeError) + Number(showCount)
    const hostClassName = classNames(getFieldExtrasHostClasses(inGroup), className)
    if (!inGroup) {
      return (
        <div className={hostClassName} style={style}>
          {textarea}
          {messages}
          {dropdown}
        </div>
      )
    }

    return (
      <div className={hostClassName} style={style}>
        {textarea}
        <div
          className={getGroupedFieldExtraStackClasses()}
          {...{ [FIELD_EXTRA_ATTR]: fieldExtraKind(messageCount) }}>
          {messages}
        </div>
        {dropdown}
      </div>
    )
  }
)

Mentions.displayName = 'Mentions'

export default Mentions
