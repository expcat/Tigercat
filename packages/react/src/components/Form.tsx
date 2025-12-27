import React, { createContext, useContext, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react'
import { classNames, type FormProps as CoreFormProps, type FormRules, type FormValues, type FormError, type FormLabelPosition, type FormLabelAlign, type FormSize, validateForm } from '@tigercat/core'

// Form context type
export interface FormContextValue {
  model: FormValues
  rules?: FormRules
  labelWidth?: string | number
  labelPosition: FormLabelPosition
  labelAlign: FormLabelAlign
  size: FormSize
  inlineMessage: boolean
  showRequiredAsterisk: boolean
  disabled: boolean
  errors: FormError[]
  validateField: (fieldName: string) => Promise<void>
  clearValidate: (fieldNames?: string | string[]) => void
  updateValue: (fieldName: string, value: unknown) => void
}

// Form context
const FormContext = createContext<FormContextValue | null>(null)

export const useFormContext = () => {
  const context = useContext(FormContext)
  return context
}

// Form handle type for imperative methods
export interface FormHandle {
  validate: () => Promise<boolean>
  validateField: (fieldName: string) => Promise<void>
  clearValidate: (fieldNames?: string | string[]) => void
  resetFields: () => void
}

// Form submit event
export interface FormSubmitEvent {
  valid: boolean
  values: FormValues
  errors: FormError[]
}

export interface FormProps extends CoreFormProps {
  /**
   * Form content
   */
  children?: React.ReactNode
  
  /**
   * Submit handler
   */
  onSubmit?: (event: FormSubmitEvent) => void
  
  /**
   * Validation handler
   */
  onValidate?: (fieldName: string, valid: boolean, error?: string | null) => void
  
  /**
   * Value change handler
   */
  onChange?: (values: FormValues) => void
  
  /**
   * Additional CSS classes
   */
  className?: string
}

export const Form = forwardRef<FormHandle, FormProps>(({
  model = {},
  rules,
  labelWidth,
  labelPosition = 'right',
  labelAlign = 'right',
  size = 'md',
  inlineMessage = true,
  showRequiredAsterisk = true,
  disabled = false,
  children,
  onSubmit,
  onValidate,
  onChange,
  className,
  ...props
}, ref) => {
  const [errors, setErrors] = useState<FormError[]>([])
  const [formValues, setFormValues] = useState<FormValues>(model)
  
  // Update form values when model changes
  React.useEffect(() => {
    setFormValues(model)
  }, [model])
  
  const validateField = useCallback(async (fieldName: string): Promise<void> => {
    if (!rules || !rules[fieldName]) {
      return
    }
    
    const { validateField: validateFieldUtil } = await import('@tigercat/core')
    const value = formValues[fieldName]
    const fieldRules = rules[fieldName]
    
    const error = await validateFieldUtil(fieldName, value, fieldRules, formValues)
    
    setErrors(prevErrors => {
      // Remove existing errors for this field
      const filtered = prevErrors.filter(e => e.field !== fieldName)
      
      // Add new error if validation failed
      if (error) {
        return [...filtered, { field: fieldName, message: error }]
      }
      
      return filtered
    })
    
    onValidate?.(fieldName, !error, error)
  }, [rules, formValues, onValidate])
  
  const validate = useCallback(async (): Promise<boolean> => {
    if (!rules) {
      return true
    }
    
    const result = await validateForm(formValues, rules)
    setErrors(result.errors)
    
    return result.valid
  }, [rules, formValues])
  
  const clearValidate = useCallback((fieldNames?: string | string[]): void => {
    if (!fieldNames) {
      setErrors([])
      return
    }
    
    const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
    setErrors(prevErrors => prevErrors.filter(error => !fields.includes(error.field)))
  }, [])
  
  const resetFields = useCallback((): void => {
    clearValidate()
    setFormValues(model)
  }, [model, clearValidate])
  
  const updateValue = useCallback((fieldName: string, value: unknown): void => {
    setFormValues(prevValues => {
      const newValues = { ...prevValues, [fieldName]: value }
      onChange?.(newValues)
      return newValues
    })
  }, [onChange])
  
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    
    const valid = await validate()
    
    onSubmit?.({
      valid,
      values: formValues,
      errors,
    })
  }, [validate, formValues, errors, onSubmit])
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    validate,
    validateField,
    clearValidate,
    resetFields,
  }), [validate, validateField, clearValidate, resetFields])
  
  const contextValue: FormContextValue = useMemo(() => ({
    model: formValues,
    rules,
    labelWidth,
    labelPosition,
    labelAlign,
    size,
    inlineMessage,
    showRequiredAsterisk,
    disabled,
    errors,
    validateField,
    clearValidate,
    updateValue,
  }), [formValues, rules, labelWidth, labelPosition, labelAlign, size, inlineMessage, showRequiredAsterisk, disabled, errors, validateField, clearValidate, updateValue])
  
  const formClasses = classNames(
    'tiger-form',
    `tiger-form--label-${labelPosition}`,
    disabled && 'tiger-form--disabled',
    className
  )
  
  return (
    <FormContext.Provider value={contextValue}>
      <form className={formClasses} onSubmit={handleSubmit} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  )
})

Form.displayName = 'TigerForm'
