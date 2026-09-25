import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type {
  InputStatus,
  NumberKeyboardChangePayload,
  NumberKeyboardKey,
  NumberKeyboardProps as CoreNumberKeyboardProps
} from '@expcat/tigercat-core'
import {
  applyNumberKeyboardKey,
  classNames,
  getNumberKeyboardInteractiveIndexes,
  getNumberKeyboardKeyClasses,
  getNumberKeyboardKeys,
  getNumberKeyboardLabels,
  isNumberKeyboardValueRejected,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  moveNumberKeyboardIndex,
  numberKeyboardEmptyKeyClasses,
  numberKeyboardGridClasses,
  numberKeyboardRootClasses,
  numberKeyboardScrimClasses,
  NUMBER_KEYBOARD_INVALID_VALUE_TEXT,
  numberKeyboardSheetClasses,
  postNumberKeyboardValue,
  resolveAnchoredOverlayTarget,
  resolveNumberKeyboardPhysicalKey
} from '@expcat/tigercat-core'
import {
  renderOverlayPortal,
  useBodyScrollLock,
  useEscapeKey,
  useFocusTrap
} from '../utils/overlay'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './tiger-config'
import { useFormItemControlContext } from './FormItemContext'

export interface NumberKeyboardProps
  extends
    Omit<CoreNumberKeyboardProps, 'className'>,
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'defaultValue' | 'onChange' | 'onKeyPress' | 'onBlur'
    > {
  className?: string
  onKeyPress?: (key: NumberKeyboardKey, payload: NumberKeyboardChangePayload) => void
  onDelete?: (value: string, payload: NumberKeyboardChangePayload) => void
  onConfirm?: (value: string, payload: NumberKeyboardChangePayload) => void
  onBlur?: React.FocusEventHandler<HTMLElement>
}

export const NumberKeyboard = forwardRef<HTMLDivElement, NumberKeyboardProps>(
  function NumberKeyboard(
    {
      value,
      defaultValue,
      mode = 'number',
      maxLength,
      precision,
      decimalSeparator = '.',
      disabled = false,
      readOnly = false,
      confirmText,
      deleteText,
      ariaLabel,
      showConfirm = true,
      open,
      defaultOpen,
      name,
      id,
      status: statusProp,
      locale,
      labels: labelsOverride,
      className,
      style,
      onChange,
      onOpenChange,
      onKeyPress,
      onDelete,
      onConfirm,
      onBlur,
      ...rest
    },
    ref
  ) {
    const config = useTigerConfig()
    const formItemControl = useFormItemControlContext()
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const labels = useMemo(
      () =>
        getNumberKeyboardLabels(mergedLocale, {
          ...labelsOverride,
          ariaLabel: ariaLabel?.trim() || labelsOverride?.ariaLabel,
          deleteText: deleteText?.trim() || labelsOverride?.deleteText,
          confirmText: confirmText?.trim()
        }),
      [ariaLabel, confirmText, deleteText, labelsOverride, mergedLocale]
    )

    const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
    const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
    const effectiveId = id ?? formItemControl?.id
    const effectiveName = name ?? formItemControl?.name
    const labelledby =
      typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
        ? rest['aria-labelledby']
        : formItemControl?.labelId
    const parsedValue = value !== undefined ? value : (formItemControl?.value as string | undefined)
    const valueControlled = value !== undefined || formItemControl?.value !== undefined
    const overlayMode = open !== undefined || defaultOpen !== undefined
    const inputOptions = useMemo(
      () => ({ mode, maxLength, precision, decimalSeparator }),
      [decimalSeparator, maxLength, mode, precision]
    )

    const [currentValue, setCurrentValue] = useControlledState<
      string,
      [NumberKeyboardChangePayload]
    >({
      value: valueControlled ? parsedValue : undefined,
      defaultValue: defaultValue ?? '',
      onChange: (next, payload) => {
        onChange?.(next, payload)
        formItemControl?.onChange?.(next)
      },
      postState: (next) => postNumberKeyboardValue(next, mode, inputOptions)
    })
    const invalidValue = valueControlled
      ? isNumberKeyboardValueRejected(parsedValue, mode, inputOptions)
      : isNumberKeyboardValueRejected(defaultValue, mode, inputOptions) &&
        currentValue === postNumberKeyboardValue(defaultValue, mode, inputOptions)
    const [isOpen, setOpen] = useControlledState({
      value: open,
      defaultValue: defaultOpen ?? false,
      onChange: onOpenChange
    })

    const rootRef = useRef<HTMLDivElement | null>(null)
    const sheetRef = useRef<HTMLDivElement | null>(null)
    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    const keys = useMemo(() => {
      const layout = getNumberKeyboardKeys({
        mode,
        decimalSeparator,
        showConfirm,
        labels
      })
      if (!readOnly) return layout
      return layout.map((key) => (key.type === 'empty' ? key : { ...key, disabled: true }))
    }, [decimalSeparator, labels, mode, readOnly, showConfirm])
    const interactive = useMemo(() => getNumberKeyboardInteractiveIndexes(keys), [keys])
    const [activeIndex, setActiveIndex] = useState(() => interactive[0] ?? 0)
    const keyRefs = useRef<Array<HTMLButtonElement | null>>([])
    const errorId = `${useId()}-error`
    const describedBy = mergeAriaDescribedBy(
      mergeAriaDescribedBy(
        typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
        invalidValue ? errorId : undefined
      ),
      formItemControl?.describedBy
    )

    useEffect(() => {
      if (!interactive.includes(activeIndex)) setActiveIndex(interactive[0] ?? 0)
    }, [activeIndex, interactive])

    const reportedErrorRef = useRef<string | null>(null)
    useEffect(() => {
      const message = invalidValue ? NUMBER_KEYBOARD_INVALID_VALUE_TEXT : null
      if (message === reportedErrorRef.current) return
      const previous = reportedErrorRef.current
      reportedErrorRef.current = message
      if (message) formItemControl?.setError?.(message)
      else if (previous) formItemControl?.setError?.(null)
    }, [formItemControl, invalidValue])

    const overlayEnabled = overlayMode && isOpen && !effectiveDisabled
    useFocusTrap({ enabled: overlayEnabled, containerRef: sheetRef, inert: true, autoFocus: true })
    useEffect(() => {
      if (!overlayEnabled) return
      const active =
        sheetRef.current?.querySelector<HTMLElement>('[data-tiger-number-key-active]') ??
        sheetRef.current
      active?.focus()
    }, [overlayEnabled])
    useBodyScrollLock({ enabled: overlayEnabled })
    useEscapeKey({
      enabled: overlayEnabled,
      onEscape: () => setOpen(false),
      layerRef: sheetRef
    })

    const closeSheet = useCallback(() => {
      if (overlayMode) setOpen(false)
    }, [overlayMode, setOpen])

    function applyKey(key: NumberKeyboardKey) {
      if (effectiveDisabled || readOnly || key.disabled || key.type === 'empty') return

      const result = applyNumberKeyboardKey(currentValue, key, inputOptions)
      const payload: NumberKeyboardChangePayload = {
        value: result.nextValue,
        key: key.value,
        action: result.action,
        mode
      }
      onKeyPress?.(key, payload)

      if (result.action === 'confirm') {
        onConfirm?.(currentValue, { ...payload, value: currentValue })
        closeSheet()
        return
      }

      if (result.action === 'delete') onDelete?.(result.nextValue, payload)
      if (result.changed) setCurrentValue(result.nextValue, payload)
    }

    function handleGroupKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      if (effectiveDisabled) return
      if (
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        event.preventDefault()
        if (interactive.length === 0) return
        setActiveIndex((index) => {
          const next = moveNumberKeyboardIndex(keys, index, event.key)
          queueMicrotask(() => keyRefs.current[next]?.focus())
          return next
        })
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        const key = keys[activeIndex]
        if (key) applyKey(key)
        return
      }
      const physical = resolveNumberKeyboardPhysicalKey(event.key, inputOptions)
      if (!physical) return
      event.preventDefault()
      const match =
        keys.find((key) => key.type === physical.type && key.value === physical.value) ??
        ({
          type: physical.type,
          value: physical.value,
          label: physical.value,
          ariaLabel: physical.value
        } as NumberKeyboardKey)
      applyKey(match)
    }

    function handleFocusOut(event: React.FocusEvent<HTMLDivElement>) {
      const next = event.relatedTarget as Node | null
      const root = overlayMode ? sheetRef.current : rootRef.current
      if (root && next && root.contains(next)) return
      formItemControl?.onBlur?.()
      onBlur?.(event)
    }

    const { 'aria-describedby': _describedBy, 'aria-labelledby': _labelledby, ...rootRest } = rest

    const groupTabIndex = effectiveDisabled ? -1 : interactive.length > 0 ? -1 : 0
    const invalidNote = invalidValue ? (
      <p
        id={errorId}
        className="px-1 text-xs text-[var(--tiger-error)]"
        aria-live="polite"
        data-tiger-number-keyboard-error="">
        {NUMBER_KEYBOARD_INVALID_VALUE_TEXT}
      </p>
    ) : null

    const group = (sheet: boolean) => (
      <div
        ref={sheet ? sheetRef : setRootRef}
        className={classNames(
          sheet ? numberKeyboardSheetClasses : numberKeyboardRootClasses,
          className
        )}
        style={sheet ? undefined : style}
        role={sheet ? 'dialog' : 'group'}
        aria-modal={sheet || undefined}
        id={sheet ? undefined : effectiveId}
        tabIndex={groupTabIndex}
        aria-label={labelledby ? undefined : labels.ariaLabel}
        aria-labelledby={labelledby}
        aria-describedby={describedBy}
        aria-disabled={effectiveDisabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-invalid={status === 'error' || invalidValue ? true : undefined}
        aria-required={formItemControl?.required || undefined}
        data-tiger-number-keyboard=""
        onKeyDown={handleGroupKeyDown}
        onBlur={handleFocusOut}
        {...rootRest}>
        {!sheet && effectiveName ? (
          <input
            type="hidden"
            name={effectiveName}
            value={currentValue}
            disabled={effectiveDisabled || undefined}
          />
        ) : null}
        {sheet ? null : invalidNote}
        <div className={numberKeyboardGridClasses}>
          {keys.map((key, index) => {
            const active = interactive.includes(index) && index === activeIndex
            return key.type === 'empty' ? (
              <div
                key={`${key.type}-${index}`}
                className={numberKeyboardEmptyKeyClasses}
                aria-hidden="true"
              />
            ) : (
              <button
                key={`${key.type}-${key.value}-${index}`}
                ref={(node) => {
                  keyRefs.current[index] = node
                }}
                type="button"
                tabIndex={active ? 0 : -1}
                className={getNumberKeyboardKeyClasses(key, effectiveDisabled || !!key.disabled)}
                disabled={effectiveDisabled || !!key.disabled}
                aria-disabled={key.disabled || effectiveDisabled || undefined}
                aria-label={key.ariaLabel}
                data-key={key.value}
                data-active={index === activeIndex ? '' : undefined}
                data-tiger-number-key-active={active ? '' : undefined}
                onMouseDown={(event) => {
                  event.preventDefault()
                  ;(overlayMode ? sheetRef.current : rootRef.current)?.focus()
                }}
                onClick={() => {
                  if (key.disabled || readOnly) return
                  setActiveIndex(index)
                  applyKey(key)
                }}>
                {key.label}
              </button>
            )
          })}
        </div>
      </div>
    )

    if (!overlayMode) return group(false)

    const portalTarget = resolveAnchoredOverlayTarget(rootRef.current)
    return (
      <div ref={setRootRef} className={classNames('contents', className)} style={style}>
        {effectiveName || effectiveId ? (
          <input
            type="hidden"
            id={effectiveId}
            name={effectiveName}
            value={currentValue}
            disabled={effectiveDisabled || undefined}
          />
        ) : null}
        {invalidNote}
        {overlayEnabled
          ? renderOverlayPortal(
              <>
                <div className={numberKeyboardScrimClasses} onClick={closeSheet} />
                {group(true)}
              </>,
              portalTarget
            )
          : null}
      </div>
    )
  }
)

NumberKeyboard.displayName = 'NumberKeyboard'

export default NumberKeyboard
