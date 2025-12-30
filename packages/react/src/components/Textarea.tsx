import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react'
import { classNames, type TextareaProps as CoreTextareaProps } from '@tigercat/core'

export interface TextareaProps extends CoreTextareaProps {
  /**
   * Textarea value (controlled)
   */
  value?: string
  
  /**
   * Default value (uncontrolled)
   */
  defaultValue?: string
  
  /**
   * Input event handler
   */
  onInput?: (event: React.FormEvent<HTMLTextAreaElement>) => void
  
  /**
   * Change event handler
   */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  
  /**
   * Focus event handler
   */
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  
  /**
   * Blur event handler
   */
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Textarea name attribute
   */
  name?: string
  
  /**
   * Textarea id attribute
   */
  id?: string
}

const baseClasses = 'block w-full rounded-md border border-gray-300 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:border-[var(--tiger-primary,#2563eb)] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500'

const sizeClasses = {
  sm: 'px-2 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
} as const

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  size = 'md',
  disabled = false,
  readonly = false,
  placeholder = '',
  rows = 3,
  autoResize = false,
  maxRows,
  minRows,
  maxLength,
  showCount = false,
  value,
  defaultValue,
  onInput,
  onChange,
  onFocus,
  onBlur,
  className,
  name,
  id,
  ...props
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  
  // Expose the textarea element to parent components via ref
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)
  
  // Determine if component is controlled or uncontrolled - simple comparison, no need to memoize
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const textareaClasses = useMemo(() => classNames(
    baseClasses,
    sizeClasses[size],
    autoResize && 'resize-none',
    !autoResize && 'resize-y',
    className,
  ), [size, autoResize, className])

  const adjustHeight = useCallback(() => {
    if (!autoResize || !textareaRef.current) return

    const textarea = textareaRef.current
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    
    const computedStyle = getComputedStyle(textarea)
    const lineHeight = parseInt(computedStyle.lineHeight, 10)
    const paddingTop = parseInt(computedStyle.paddingTop, 10)
    const paddingBottom = parseInt(computedStyle.paddingBottom, 10)
    
    let newHeight = textarea.scrollHeight
    
    // Apply minRows constraint
    if (minRows) {
      const minHeight = lineHeight * minRows + paddingTop + paddingBottom
      newHeight = Math.max(newHeight, minHeight)
    }
    
    // Apply maxRows constraint
    if (maxRows) {
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom
      newHeight = Math.min(newHeight, maxHeight)
    }
    
    textarea.style.height = `${newHeight}px`
  }, [autoResize, maxRows, minRows])

  const handleInput = useCallback((event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement
    const newValue = target.value
    
    if (!isControlled) {
      setInternalValue(newValue)
    }
    
    onInput?.(event)
    
    if (autoResize) {
      adjustHeight()
    }
  }, [isControlled, onInput, autoResize, adjustHeight])

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event)
  }, [onChange])

  // Adjust height when value changes or on mount
  useEffect(() => {
    if (autoResize) {
      adjustHeight()
    }
  }, [currentValue, autoResize, adjustHeight])

  // Initialize height on mount
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      adjustHeight()
    }
  }, [autoResize, adjustHeight])

  const currentLength = useMemo(() => currentValue?.length || 0, [currentValue])

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        className={textareaClasses}
        value={currentValue}
        disabled={disabled}
        readOnly={readonly}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        onInput={handleInput}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        name={name}
        id={id}
        {...props}
      />
      
      {showCount && (
        <div className="mt-1 text-sm text-gray-500 text-right">
          {maxLength ? `${currentLength}/${maxLength}` : currentLength}
        </div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'
