import React, { useState, useEffect, useRef, useCallback, useId, forwardRef } from 'react'
import {
  classNames,
  mergeAriaDescribedBy,
  getInputFieldClasses,
  getInputWrapperClasses,
  getInputAffixClasses,
  getInputErrorClasses,
  getInputClearButtonClasses,
  getInputPasswordToggleClasses,
  getInputCountClasses,
  formatInputCountText,
  parseInputValue,
  runShakeAnimation,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  getInputLabels,
  resolveInputTrailingLayout,
  resolveReadOnlyFlag,
  type InputProps as CoreInputProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useInputGroupContext } from './InputGroup'
import { useFormItemControlContext } from './FormItemContext'
import { Icon } from './Icon'

export interface InputProps
  extends
    CoreInputProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      | 'size'
      | 'type'
      | 'value'
      | 'defaultValue'
      | 'autoComplete'
      | 'onInput'
      | 'onChange'
      | 'onFocus'
      | 'onBlur'
      | 'readOnly'
      | 'prefix'
    > {
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  className?: string
  /** @internal */
  _shakeTrigger?: number
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onClear?: () => void
  readOnly?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size,
    type = 'text',
    status: statusProp,
    errorMessage: errorMessageProp,
    _shakeTrigger: shakeTriggerProp,
    prefix,
    suffix,
    value,
    defaultValue,
    placeholder = '',
    disabled = false,
    readonly: readonlyProp,
    readOnly: readOnlyProp,
    required = false,
    maxLength,
    minLength,
    name,
    id,
    autoComplete,
    autoFocus = false,
    clearable = false,
    showPassword = false,
    showCount = false,
    onInput,
    onChange,
    onFocus,
    onBlur,
    onClear,
    className,
    style,
    ...props
  },
  ref
) {
  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const labels = getInputLabels(config.locale)
  const inGroup = inputGroup != null
  const effectiveSize = size ?? inputGroup?.size ?? 'md'
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const errorMessage = errorMessageProp
  const shakeTrigger = shakeTriggerProp ?? formItemControl?.shakeTrigger
  const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
  const isReadOnly = resolveReadOnlyFlag(readonlyProp, readOnlyProp)
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const formBoundValue = formItemControl?.value
  const resolvedValue =
    value !== undefined
      ? value
      : typeof formBoundValue === 'string' || typeof formBoundValue === 'number'
        ? formBoundValue
        : formBoundValue === undefined
          ? undefined
          : String(formBoundValue ?? '')

  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(false)
  const reactId = useId()
  const errorMsgId = `tiger-input-error-${reactId}`
  const [inputValue, setInputValue] = useControlledState<string | number>({
    value: resolvedValue,
    defaultValue: defaultValue ?? ''
  })
  const [passwordVisible, setPasswordVisible] = useState(false)

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
    if (status === 'error') runShakeAnimation(wrapperRef.current)
  }, [status, shakeTrigger])

  const handleAnimationEnd = useCallback(() => {
    wrapperRef.current?.classList.remove(SHAKE_CLASS)
  }, [])

  const currentValStr = String(inputValue)
  const trailing = resolveInputTrailingLayout({
    clearable,
    showPassword,
    type,
    disabled: effectiveDisabled,
    readOnly: isReadOnly,
    valueLength: currentValStr.length,
    hasCustomSuffix: !!suffix
  })

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    const next = parseInputValue(event.currentTarget, type)
    setInputValue(next)
    formItemControl?.onChange?.(next)
    onInput?.(event)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseInputValue(event.currentTarget, type)
    setInputValue(next)
    formItemControl?.onChange?.(next)
    onChange?.(event)
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  const handleClear = () => {
    setInputValue('')
    formItemControl?.onChange?.('')
    onClear?.()
    focusInput()
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible((v) => !v)
    focusInput()
  }

  const activeError = status === 'error' && !!errorMessage
  const hasExtras = activeError || showCount
  const effectiveType =
    showPassword && type === 'password' ? (passwordVisible ? 'text' : 'password') : type

  const inputClasses = getInputFieldClasses({
    size: effectiveSize,
    status,
    hasPrefix: !!prefix,
    hasSuffix: trailing.hasSuffix,
    hasDualSuffix: trailing.hasDualSuffix,
    hasTripleSuffix: trailing.hasTripleSuffix
  })

  const chrome = (
    <div
      ref={wrapperRef}
      {...{ [TIGER_CHROME_ATTR]: '' }}
      className={classNames(
        getInputWrapperClasses(status, { inGroup: inGroup && !hasExtras }),
        !hasExtras ? className : undefined
      )}
      style={!hasExtras ? style : undefined}
      onAnimationEnd={handleAnimationEnd}>
      {prefix ? (
        <div className={getInputAffixClasses('prefix', effectiveSize)}>{prefix}</div>
      ) : null}
      <input
        {...props}
        ref={setInputRefs}
        className={inputClasses}
        type={effectiveType}
        value={inputValue}
        placeholder={placeholder}
        disabled={effectiveDisabled}
        readOnly={isReadOnly}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        name={effectiveName}
        id={effectiveId}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={status === 'error' ? true : props['aria-invalid']}
        aria-required={formItemControl?.required || required ? true : undefined}
        aria-describedby={mergeAriaDescribedBy(
          mergeAriaDescribedBy(
            typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
            activeError ? errorMsgId : undefined
          ),
          formItemControl?.describedBy
        )}
        onInput={handleInput}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={handleBlur}
      />
      {trailing.showClear ? (
        <button
          type="button"
          className={getInputClearButtonClasses(effectiveSize, {
            offsetSlots: trailing.clearOffsetSlots
          })}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleClear}
          aria-label={labels.clearAriaLabel}>
          <Icon name="close" size="sm" aria-hidden />
        </button>
      ) : null}
      {trailing.showPasswordToggle ? (
        <button
          type="button"
          className={getInputPasswordToggleClasses(effectiveSize, {
            offsetSlots: trailing.passwordOffsetSlots
          })}
          onMouseDown={(event) => event.preventDefault()}
          onClick={togglePasswordVisibility}
          aria-label={
            passwordVisible ? labels.hidePasswordAriaLabel : labels.showPasswordAriaLabel
          }>
          <Icon name={passwordVisible ? 'eye-off' : 'eye'} size="sm" aria-hidden />
        </button>
      ) : null}
      {trailing.showCustomSuffix ? (
        <div
          className={getInputAffixClasses('suffix', effectiveSize, {
            offsetSlots: trailing.suffixOffsetSlots
          })}>
          {suffix}
        </div>
      ) : null}
    </div>
  )

  if (!hasExtras) return chrome

  const extras: React.ReactNode[] = []
  if (activeError) {
    extras.push(
      <div
        key="error"
        id={errorMsgId}
        className={getInputErrorClasses(effectiveSize)}
        aria-live="polite">
        {errorMessage}
      </div>
    )
  }
  if (showCount) {
    const count = currentValStr.length
    extras.push(
      <div
        key="count"
        className={getInputCountClasses(maxLength !== undefined && count > maxLength)}>
        {formatInputCountText(count, maxLength)}
      </div>
    )
  }

  return (
    <div
      className={classNames(
        inGroup ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
        className
      )}
      style={style}>
      {chrome}
      {extras}
    </div>
  )
})

Input.displayName = 'Input'
