import React, { useMemo, useState } from 'react'
import {
  applyNumberKeyboardInput,
  classNames,
  deleteNumberKeyboardValue,
  getNumberKeyboardAction,
  getNumberKeyboardKeyClasses,
  getNumberKeyboardKeys,
  mergeTigerLocale,
  normalizeNumberKeyboardValue,
  numberKeyboardGridClasses,
  numberKeyboardRootClasses,
  resolveLocaleText,
  type NumberKeyboardChangePayload,
  type NumberKeyboardKey,
  type NumberKeyboardProps as CoreNumberKeyboardProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface NumberKeyboardProps
  extends
    Omit<CoreNumberKeyboardProps, 'modelValue' | 'className'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'onKeyPress'> {
  className?: string
  onChange?: (value: string, payload: NumberKeyboardChangePayload) => void
  onKeyPress?: (key: NumberKeyboardKey, payload: NumberKeyboardChangePayload) => void
  onDelete?: (value: string, payload: NumberKeyboardChangePayload) => void
  onConfirm?: (value: string, payload: NumberKeyboardChangePayload) => void
}

export const NumberKeyboard: React.FC<NumberKeyboardProps> = ({
  value,
  defaultValue = '',
  mode = 'number',
  maxLength,
  precision,
  decimalSeparator = '.',
  disabled = false,
  readonly = false,
  confirmText,
  deleteText = 'Delete',
  ariaLabel = 'Number keyboard',
  showConfirm = true,
  locale,
  className,
  style,
  onChange,
  onKeyPress,
  onDelete,
  onConfirm,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const confirmLabel = resolveLocaleText('Done', confirmText, mergedLocale?.common?.okText)
  const isControlled = value !== undefined
  const [innerValue, setInnerValue] = useState(() => normalizeNumberKeyboardValue(defaultValue))
  const currentValue = isControlled ? normalizeNumberKeyboardValue(value) : innerValue
  const isDisabled = disabled || readonly

  const keys = useMemo(
    () =>
      getNumberKeyboardKeys({
        mode,
        decimalSeparator,
        deleteText,
        confirmText: confirmLabel,
        showConfirm
      }),
    [confirmLabel, decimalSeparator, deleteText, mode, showConfirm]
  )

  function emitChange(nextValue: string, payload: NumberKeyboardChangePayload) {
    if (!isControlled) setInnerValue(nextValue)
    onChange?.(nextValue, payload)
  }

  function handleKeyClick(key: NumberKeyboardKey) {
    if (isDisabled || key.type === 'empty') return

    const action = getNumberKeyboardAction(key)
    const nextValue =
      action === 'delete'
        ? deleteNumberKeyboardValue(currentValue)
        : action === 'input'
          ? applyNumberKeyboardInput(currentValue, key.value, {
              mode,
              maxLength,
              precision,
              decimalSeparator
            })
          : currentValue

    const payload: NumberKeyboardChangePayload = {
      value: nextValue,
      key: key.value,
      action,
      mode
    }

    onKeyPress?.(key, payload)

    if (action === 'confirm') {
      onConfirm?.(currentValue, { ...payload, value: currentValue })
      return
    }

    if (action === 'delete') onDelete?.(nextValue, payload)
    if (nextValue !== currentValue) emitChange(nextValue, payload)
  }

  return (
    <div
      className={classNames(numberKeyboardRootClasses, className)}
      style={style}
      role="group"
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      {...rest}>
      <div className={numberKeyboardGridClasses}>
        {keys.map((key, index) => (
          <button
            key={`${key.type}-${key.value}-${index}`}
            type="button"
            className={getNumberKeyboardKeyClasses(key, isDisabled)}
            disabled={isDisabled || key.disabled}
            aria-label={key.ariaLabel}
            data-key={key.value}
            onClick={() => handleKeyClick(key)}>
            {key.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default NumberKeyboard
