import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  mergeAriaDescribedBy,
  mergeTigerLocale,
  moveNumberKeyboardIndex,
  numberKeyboardEmptyKeyClasses,
  numberKeyboardGridClasses,
  numberKeyboardRootClasses,
  numberKeyboardScrimClasses,
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
import { useTigerConfig } from './ConfigProvider'
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
      readonly = false,
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
    const describedBy = mergeAriaDescribedBy(
      typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
      formItemControl?.describedBy
    )
    const labelledby =
      typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
        ? rest['aria-labelledby']
        : formItemControl?.labelId
    const parsedValue = value !== undefined ? value : (formItemControl?.value as string | undefined)
    const overlayMode = open !== undefined || defaultOpen !== undefined

    const [currentValue, setCurrentValue] = useControlledState<
      string,
      [NumberKeyboardChangePayload]
    >({
      value: value !== undefined || formItemControl?.value !== undefined ? parsedValue : undefined,
      defaultValue: defaultValue ?? '',
      onChange: (next, payload) => {
        onChange?.(next, payload)
        formItemControl?.onChange?.(next)
      },
      postState: (next) => postNumberKeyboardValue(next, mode)
    })
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

    const keys = useMemo(
      () =>
        getNumberKeyboardKeys({
          mode,
          decimalSeparator,
          showConfirm,
          labels
        }),
      [decimalSeparator, labels, mode, showConfirm]
    )
    const interactive = useMemo(() => getNumberKeyboardInteractiveIndexes(keys), [keys])
    const [activeIndex, setActiveIndex] = useState(() => interactive[0] ?? 0)

    useEffect(() => {
      if (!interactive.includes(activeIndex)) setActiveIndex(interactive[0] ?? 0)
    }, [activeIndex, interactive])

    const overlayEnabled = overlayMode && isOpen && !effectiveDisabled
    useFocusTrap({ enabled: overlayEnabled, containerRef: sheetRef, inert: true })
    useBodyScrollLock({ enabled: overlayEnabled })
    useEscapeKey({
      enabled: overlayEnabled,
      onEscape: () => setOpen(false),
      layerRef: sheetRef
    })

    const inputOptions = {
      mode,
      maxLength,
      precision,
      decimalSeparator
    }

    const closeSheet = useCallback(() => {
      if (overlayMode) setOpen(false)
    }, [overlayMode, setOpen])

    function applyKey(key: NumberKeyboardKey) {
      if (effectiveDisabled || readonly || key.type === 'empty') return

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
        setActiveIndex((index) => moveNumberKeyboardIndex(keys, index, event.key))
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
        id={effectiveId}
        tabIndex={effectiveDisabled ? -1 : 0}
        aria-label={labelledby ? undefined : labels.ariaLabel}
        aria-labelledby={labelledby}
        aria-describedby={describedBy}
        aria-disabled={effectiveDisabled || undefined}
        aria-readonly={readonly || undefined}
        aria-invalid={status === 'error' ? true : undefined}
        aria-required={formItemControl?.required || undefined}
        data-tiger-number-keyboard=""
        onKeyDown={handleGroupKeyDown}
        onBlur={handleFocusOut}
        {...rootRest}>
        {effectiveName ? <input type="hidden" name={effectiveName} value={currentValue} /> : null}
        <div className={numberKeyboardGridClasses}>
          {keys.map((key, index) =>
            key.type === 'empty' ? (
              <div
                key={`${key.type}-${index}`}
                className={numberKeyboardEmptyKeyClasses}
                aria-hidden="true"
              />
            ) : (
              <button
                key={`${key.type}-${key.value}-${index}`}
                type="button"
                tabIndex={-1}
                className={getNumberKeyboardKeyClasses(key, effectiveDisabled)}
                disabled={effectiveDisabled}
                aria-label={key.ariaLabel}
                data-key={key.value}
                data-active={index === activeIndex ? '' : undefined}
                onClick={() => {
                  setActiveIndex(index)
                  applyKey(key)
                }}>
                {key.label}
              </button>
            )
          )}
        </div>
      </div>
    )

    if (!overlayMode) return group(false)

    const portalTarget = resolveAnchoredOverlayTarget(rootRef.current)
    return (
      <div ref={setRootRef} className={classNames('contents', className)} style={style}>
        {effectiveName ? <input type="hidden" name={effectiveName} value={currentValue} /> : null}
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
