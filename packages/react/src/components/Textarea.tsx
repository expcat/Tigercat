import React, { forwardRef, useEffect, useRef, useState } from 'react'
import {
  autoResizeTextarea,
  classNames,
  getInputClasses,
  type TextareaProps as CoreTextareaProps
} from '@expcat/tigercat-core'

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
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      disabled = false,
      readonly = false,
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
      onInput,
      onChange,
      onFocus,
      onBlur,
      className,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [internalValue, setInternalValue] = useState(defaultValue || '')

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const setRefs = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
    }

    useEffect(() => {
      if (!autoResize || !textareaRef.current) return
      autoResizeTextarea(textareaRef.current, { minRows, maxRows })
    }, [autoResize, currentValue, minRows, maxRows])

    const textareaClasses = classNames(
      'block',
      getInputClasses({ size }),
      autoResize ? 'resize-none' : 'resize-y',
      className
    )

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setInternalValue(event.currentTarget.value)
      }

      onInput?.(event)

      if (autoResize) {
        autoResizeTextarea(event.currentTarget, { minRows, maxRows })
      }
    }

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event)
    }

    const currentLength = currentValue?.length ?? 0

    return (
      <div className="w-full">
        <textarea
          ref={setRefs}
          className={textareaClasses}
          value={currentValue}
          disabled={disabled}
          readOnly={readonly}
          required={required}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          minLength={minLength}
          onInput={handleInput}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />

        {showCount && (
          <div className="mt-1 text-sm text-gray-500 text-right">
            {maxLength ? `${currentLength}/${maxLength}` : currentLength}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
