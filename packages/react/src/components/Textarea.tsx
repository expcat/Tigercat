import React, { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import { useControlledState } from '../hooks/useControlledState'
import {
  autoResizeTextarea,
  clearTextareaAutoResize,
  classNames,
  formatInputCountText,
  getInputClasses,
  getInputCountClasses,
  getInputErrorClasses,
  mergeAriaDescribedBy,
  resolveReadOnlyFlag,
  runShakeAnimation,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  type TextareaProps as CoreTextareaProps
} from '@expcat/tigercat-core'
import { useInputGroupContext } from './InputGroup'
import { useFormItemControlContext } from './FormItemContext'

export interface TextareaProps
  extends
    CoreTextareaProps,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      'size' | 'value' | 'defaultValue' | 'onInput' | 'onChange' | 'onFocus' | 'onBlur' | 'readOnly'
    > {
  onInput?: (event: React.FormEvent<HTMLTextAreaElement>) => void
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  className?: string
  readOnly?: boolean
  /** @internal */
  _shakeTrigger?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size,
      status: statusProp,
      errorMessage: errorMessageProp,
      _shakeTrigger: shakeTriggerProp,
      disabled = false,
      readonly: readonlyProp,
      readOnly: readOnlyProp,
      required = false,
      placeholder = '',
      rows = 3,
      autoResize = false,
      maxRows,
      minRows,
      maxLength,
      minLength,
      showCount = false,
      value,
      defaultValue,
      name,
      id,
      'aria-invalid': ariaInvalidProp,
      onInput,
      onChange,
      onFocus,
      onBlur,
      className,
      ...props
    },
    ref
  ) => {
    const inputGroup = useInputGroupContext()
    const formItemControl = useFormItemControlContext()
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
        : typeof formBoundValue === 'string'
          ? formBoundValue
          : formBoundValue === undefined
            ? undefined
            : String(formBoundValue ?? '')

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const mountedRef = useRef(false)
    const reactId = useId()
    const errorMsgId = `tiger-textarea-error-${reactId}`
    const [currentValue, setValue] = useControlledState({
      value: resolvedValue,
      defaultValue: defaultValue || ''
    })

    const setRefs = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
    }

    const resolvedMinRows = minRows ?? rows

    useLayoutEffect(() => {
      if (!textareaRef.current) return
      if (!autoResize) {
        clearTextareaAutoResize(textareaRef.current)
        return
      }
      autoResizeTextarea(textareaRef.current, { minRows: resolvedMinRows, maxRows })
    }, [autoResize, currentValue, resolvedMinRows, maxRows, rows])

    useEffect(() => {
      if (!mountedRef.current) {
        mountedRef.current = true
        return
      }
      if (status === 'error') runShakeAnimation(textareaRef.current)
    }, [status, shakeTrigger])

    const activeError = status === 'error' && !!errorMessage
    const hasExtras = activeError || showCount

    const textareaClasses = useMemo(
      () =>
        classNames(
          'block',
          getInputClasses({
            size: effectiveSize,
            status,
            inGroup: inGroup && !hasExtras
          }),
          autoResize ? 'resize-none' : 'resize-y',
          !hasExtras ? className : undefined
        ),
      [effectiveSize, status, autoResize, className, inGroup, hasExtras]
    )

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      const next = event.currentTarget.value
      setValue(next)
      formItemControl?.onChange?.(next)
      onInput?.(event)
    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event)
    }

    const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      formItemControl?.onBlur?.()
      onBlur?.(event)
    }

    const currentLength = currentValue?.length ?? 0

    const textarea = (
      <textarea
        {...props}
        ref={setRefs}
        className={textareaClasses}
        value={currentValue}
        disabled={effectiveDisabled}
        readOnly={isReadOnly}
        required={required || Boolean(formItemControl?.required)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
        name={effectiveName}
        id={effectiveId}
        aria-invalid={status === 'error' ? true : ariaInvalidProp}
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
        onAnimationEnd={() => textareaRef.current?.classList.remove(SHAKE_CLASS)}
        {...{ [TIGER_CHROME_ATTR]: '' }}
      />
    )

    if (!hasExtras) return textarea

    return (
      <div
        className={classNames(
          inGroup ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
          className
        )}>
        {textarea}
        {activeError ? (
          <div id={errorMsgId} className={getInputErrorClasses(effectiveSize)} aria-live="polite">
            {errorMessage}
          </div>
        ) : null}
        {showCount ? (
          <div
            className={getInputCountClasses(maxLength !== undefined && currentLength > maxLength)}>
            {formatInputCountText(currentLength, maxLength)}
          </div>
        ) : null}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
