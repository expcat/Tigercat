import React, { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  applyMaskInput,
  classNames,
  formatMaskValue,
  getInputClearButtonClasses,
  getInputErrorClasses,
  getInputFieldClasses,
  getInputLabels,
  getInputWrapperClasses,
  getMaskInputMode,
  mergeAriaDescribedBy,
  parseMask,
  resolveReadOnlyFlag,
  runShakeAnimation,
  shouldEmitMaskComplete,
  type MaskInputChangeDetail,
  type MaskInputProps as CoreMaskInputProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'
import { useInputGroupContext } from './InputGroup'
import { Icon } from './Icon'

export interface MaskInputProps
  extends
    CoreMaskInputProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      | 'size'
      | 'value'
      | 'defaultValue'
      | 'autoComplete'
      | 'onChange'
      | 'onInput'
      | 'onFocus'
      | 'onBlur'
      | 'readOnly'
    > {
  className?: string
  /** @internal */
  _shakeTrigger?: number
  onChange?: (value: string, detail: MaskInputChangeDetail) => void
  onComplete?: (value: string, maskedValue: string) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onClear?: () => void
  readOnly?: boolean
}

export const MaskInput = forwardRef<HTMLInputElement, MaskInputProps>(function MaskInput(
  {
    size,
    status: statusProp,
    errorMessage: errorMessageProp,
    _shakeTrigger: shakeTriggerProp,
    mask,
    tokens,
    value,
    defaultValue,
    placeholder = '',
    disabled = false,
    readonly: readonlyProp,
    readOnly: readOnlyProp,
    clearable = false,
    name,
    id,
    autoComplete,
    autoFocus = false,
    onChange,
    onComplete,
    onFocus,
    onBlur,
    onClear,
    className,
    style,
    type,
    inputMode,
    ...rest
  },
  ref
) {
  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const labels = useMemo(() => getInputLabels(config.locale), [config.locale])
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
    value !== undefined ? value : typeof formBoundValue === 'string' ? formBoundValue : undefined

  const chromeRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isComposing = useRef(false)
  const pendingCaret = useRef<number | null>(null)
  const mountedRef = useRef(false)
  const reactId = useId()
  const errorMsgId = `tiger-mask-input-error-${reactId}`

  const spec = useMemo(() => parseMask(mask, tokens), [mask, tokens])
  const [rawValue, setRawValue] = useControlledState<string, [MaskInputChangeDetail]>({
    value: resolvedValue,
    defaultValue: defaultValue ?? '',
    onChange: (next, detail) => {
      onChange?.(next, detail)
      formItemControl?.onChange?.(next)
    }
  })
  const formatted = useMemo(() => formatMaskValue(rawValue, spec), [rawValue, spec])
  const maskedValue = formatted.maskedValue
  const resolvedInputMode = inputMode ?? getMaskInputMode(mask, spec)

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
  }

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (status === 'error') runShakeAnimation(chromeRef.current ?? inputRef.current)
  }, [status, shakeTrigger])

  useLayoutEffect(() => {
    if (pendingCaret.current !== null && inputRef.current) {
      const caret = pendingCaret.current
      inputRef.current.setSelectionRange(caret, caret)
      pendingCaret.current = null
    }
  })

  const commit = (raw: string, detail: MaskInputChangeDetail, wasCompleted: boolean) => {
    setRawValue(raw, detail)
    if (shouldEmitMaskComplete(wasCompleted, detail.completed)) {
      onComplete?.(raw, detail.maskedValue)
    }
  }

  const applyValue = (inputValue: string, caret: number) => {
    const wasCompleted = formatted.completed
    const result = applyMaskInput(inputValue, caret, spec, maskedValue)
    if (inputRef.current) inputRef.current.value = result.maskedValue
    pendingCaret.current = result.caret
    commit(
      result.rawValue,
      { maskedValue: result.maskedValue, completed: result.completed },
      wasCompleted
    )
  }

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    if (isComposing.current) return
    const target = event.currentTarget
    applyValue(target.value, target.selectionStart ?? target.value.length)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (effectiveDisabled || isReadOnly) return
    event.preventDefault()
    const input = event.currentTarget
    const text = event.clipboardData.getData('text')
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? input.value.length
    applyValue(input.value.slice(0, start) + text + input.value.slice(end), start + text.length)
  }

  const handleClear = () => {
    setRawValue('', { maskedValue: '', completed: false })
    onClear?.()
    inputRef.current?.focus()
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const activeError = status === 'error' && !!errorMessage
  const showClear = clearable && !effectiveDisabled && !isReadOnly && rawValue.length > 0
  const hasExtras = activeError
  const describedBy = mergeAriaDescribedBy(
    mergeAriaDescribedBy(
      typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
      activeError ? errorMsgId : undefined
    ),
    formItemControl?.describedBy
  )

  const field = (
    <input
      {...rest}
      ref={setRefs}
      className={getInputFieldClasses({
        size: effectiveSize,
        status,
        hasSuffix: showClear,
        inGroup: false
      })}
      type={type ?? 'text'}
      inputMode={resolvedInputMode}
      value={maskedValue}
      placeholder={placeholder}
      disabled={effectiveDisabled}
      readOnly={isReadOnly}
      id={effectiveId}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      aria-invalid={status === 'error' ? true : rest['aria-invalid']}
      aria-required={formItemControl?.required ? true : rest['aria-required']}
      aria-describedby={describedBy}
      onInput={handleInput}
      onChange={() => {}}
      onPaste={handlePaste}
      onCompositionStart={() => {
        isComposing.current = true
      }}
      onCompositionEnd={(event) => {
        isComposing.current = false
        const target = event.currentTarget
        applyValue(target.value, target.selectionStart ?? target.value.length)
      }}
      onFocus={onFocus}
      onBlur={handleBlur}
    />
  )

  const chrome = (
    <div
      ref={chromeRef}
      {...{ [TIGER_CHROME_ATTR]: '' }}
      className={classNames(
        getInputWrapperClasses(status, { inGroup: inGroup && !hasExtras }),
        !hasExtras ? className : undefined
      )}
      style={!hasExtras ? style : undefined}
      onAnimationEnd={() => chromeRef.current?.classList.remove(SHAKE_CLASS)}>
      {field}
      {effectiveName ? (
        <input type="hidden" name={effectiveName} value={rawValue} disabled={effectiveDisabled} />
      ) : null}
      {showClear ? (
        <button
          type="button"
          className={getInputClearButtonClasses(effectiveSize)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleClear}
          aria-label={labels.clearAriaLabel}
          tabIndex={-1}>
          <Icon name="close" size="sm" aria-hidden />
        </button>
      ) : null}
    </div>
  )

  if (!hasExtras) return chrome

  return (
    <div
      className={classNames(
        inGroup ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
        className
      )}
      style={style}>
      {chrome}
      {activeError ? (
        <div id={errorMsgId} className={getInputErrorClasses(effectiveSize)} aria-live="polite">
          {errorMessage}
        </div>
      ) : null}
    </div>
  )
})

MaskInput.displayName = 'MaskInput'

export default MaskInput
