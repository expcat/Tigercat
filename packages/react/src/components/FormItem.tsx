import React, { useMemo, useEffect, useState, useCallback } from 'react'
import { classNames, type FormSize, type FormItemProps as CoreFormItemProps, getFieldError } from '@tigercat/core'
import { useFormContext } from './Form'

export interface FormItemProps extends CoreFormItemProps {
  /**
   * Form item content
   */
  children?: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string
}

export const FormItem: React.FC<FormItemProps> = ({
  name,
  label,
  labelWidth,
  required,
  rules,
  error: controlledError,
  showMessage = true,
  size,
  children,
  className,
}) => {
  const formContext = useFormContext()
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  // Simple logical operations - no need to memoize
  const actualSize: FormSize = size || formContext?.size || 'md'
  const labelPosition = formContext?.labelPosition || 'right'
  const labelAlign = formContext?.labelAlign || 'right'
  
  const actualLabelWidth = useMemo(() => {
    const width = labelWidth || formContext?.labelWidth
    if (typeof width === 'number') {
      return `${width}px`
    }
    return width
  }, [labelWidth, formContext?.labelWidth])
  
  const showRequiredAsterisk = useMemo(() => {
    if (required !== undefined) {
      return required
    }
    
    // Check if any rule has required: true
    if (rules) {
      const ruleArray = Array.isArray(rules) ? rules : [rules]
      return ruleArray.some(rule => rule.required)
    }
    
    // Check form-level rules
    if (name && formContext?.rules) {
      const fieldRules = formContext.rules[name]
      if (fieldRules) {
        const ruleArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules]
        return ruleArray.some(rule => rule.required)
      }
    }
    
    return false
  }, [required, rules, name, formContext?.rules])
  
  const isRequired = useMemo(() => 
    showRequiredAsterisk && (formContext?.showRequiredAsterisk ?? true),
    [showRequiredAsterisk, formContext?.showRequiredAsterisk]
  )
  
  // Watch for errors in form context
  useEffect(() => {
    if (name && formContext?.errors) {
      const error = getFieldError(name, formContext.errors)
      setErrorMessage(error || '')
    }
  }, [name, formContext?.errors])
  
  // Watch for controlled error prop
  useEffect(() => {
    if (controlledError !== undefined) {
      setErrorMessage(controlledError)
    }
  }, [controlledError])
  
  const handleBlur = useCallback(() => {
    if (name && formContext) {
      formContext.validateField(name)
    }
  }, [name, formContext])
  
  const handleChange = useCallback(() => {
    if (name && formContext) {
      formContext.validateField(name)
    }
  }, [name, formContext])
  
  const hasError = useMemo(() => !!errorMessage, [errorMessage])
  
  const formItemClasses = useMemo(() => classNames(
    'tiger-form-item',
    `tiger-form-item--${actualSize}`,
    `tiger-form-item--label-${labelPosition}`,
    hasError && 'tiger-form-item--error',
    formContext?.disabled && 'tiger-form-item--disabled',
    className
  ), [actualSize, labelPosition, hasError, formContext?.disabled, className])
  
  const labelClasses = useMemo(() => classNames(
    'tiger-form-item__label',
    `tiger-form-item__label--${labelAlign}`,
    isRequired && 'tiger-form-item__label--required'
  ), [labelAlign, isRequired])
  
  const labelStyles = useMemo((): React.CSSProperties => {
    if (labelPosition === 'top') {
      return {}
    }
    return actualLabelWidth ? { width: actualLabelWidth } : {}
  }, [labelPosition, actualLabelWidth])
  
  const errorClasses = useMemo(() => classNames(
    'tiger-form-item__error',
    hasError && 'tiger-form-item__error--show'
  ), [hasError])
  
  return (
    <div className={formItemClasses}>
      {label && (
        <label
          className={labelClasses}
          style={labelStyles}
          htmlFor={name}
        >
          {isRequired && <span className="tiger-form-item__asterisk">*</span>}
          {label}
        </label>
      )}
      <div className="tiger-form-item__content">
        <div
          className="tiger-form-item__field"
          onBlur={handleBlur}
          onChange={handleChange}
        >
          {children}
        </div>
        {showMessage && hasError && (
          <div className={errorClasses}>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}

FormItem.displayName = 'TigerFormItem'
