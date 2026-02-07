import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react'
import {
  classNames,
  type FormProps as CoreFormProps,
  type FormRules,
  type FormValues,
  type FormError,
  type FormLabelPosition,
  type FormLabelAlign,
  type FormSize,
  type FormRule,
  type FormRuleTrigger,
  validateForm,
  validateField as validateFieldUtil,
  getValueByPath
} from '@expcat/tigercat-core'

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
  registerFieldRules: (fieldName: string, rules?: FormRule | FormRule[]) => void
  validateField: (
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger
  ) => Promise<void>
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
  validateFields: (fieldNames: string[]) => Promise<boolean>
  validateField: (
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger
  ) => Promise<void>
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

export const Form = forwardRef<FormHandle, FormProps>(
  (
    {
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
    },
    ref
  ) => {
    const [errors, setErrors] = useState<FormError[]>([])
    const [formValues, setFormValues] = useState<FormValues>(model)
    const fieldRulesRef = React.useRef<FormRules>({})
    const formValuesRef = React.useRef<FormValues>(model)

    // Update form values when model changes
    React.useEffect(() => {
      setFormValues(model)
    }, [model])

    // Keep ref always in sync with the latest model for imperative methods
    formValuesRef.current = model

    const registerFieldRules = useCallback(
      (fieldName: string, nextRules?: FormRule | FormRule[]) => {
        if (!fieldName) {
          return
        }

        if (!nextRules) {
          delete fieldRulesRef.current[fieldName]
          return
        }

        fieldRulesRef.current[fieldName] = nextRules
      },
      []
    )

    const getEffectiveRules = useCallback((): FormRules | undefined => {
      const fromForm = rules ?? {}
      const fromItems = fieldRulesRef.current
      const merged = { ...fromForm, ...fromItems }
      return Object.keys(merged).length > 0 ? merged : undefined
    }, [rules])

    const resolveFieldRules = useCallback(
      (fieldName: string, rulesOverride?: FormRule | FormRule[]) => {
        return rulesOverride ?? fieldRulesRef.current[fieldName] ?? rules?.[fieldName]
      },
      [rules]
    )

    const runFieldValidation = useCallback(
      async (
        fieldName: string,
        rulesOverride?: FormRule | FormRule[],
        trigger?: FormRuleTrigger
      ): Promise<string | null> => {
        const fieldRules = resolveFieldRules(fieldName, rulesOverride)
        if (!fieldRules) {
          return null
        }

        const currentValues = formValuesRef.current
        const value = getValueByPath(currentValues, fieldName)
        return validateFieldUtil(fieldName, value, fieldRules, currentValues, trigger)
      },
      [resolveFieldRules]
    )

    const validateField = useCallback(
      async (
        fieldName: string,
        rulesOverride?: FormRule | FormRule[],
        trigger?: FormRuleTrigger
      ): Promise<void> => {
        const fieldRules = resolveFieldRules(fieldName, rulesOverride)
        if (!fieldRules) {
          return
        }

        const error = await runFieldValidation(fieldName, rulesOverride, trigger)

        setErrors((prevErrors) => {
          const existing = prevErrors.find((e) => e.field === fieldName)
          const existingMessage = existing?.message ?? null

          // Return same reference if error state for this field hasn't changed,
          // avoiding unnecessary re-renders for unrelated FormItems.
          if (!error && !existingMessage) return prevErrors
          if (error && error === existingMessage) return prevErrors

          const filtered = prevErrors.filter((e) => e.field !== fieldName)

          if (error) {
            return [...filtered, { field: fieldName, message: error }]
          }

          return filtered
        })

        onValidate?.(fieldName, !error, error)
      },
      [resolveFieldRules, runFieldValidation, onValidate]
    )

    const runValidation = useCallback(async (): Promise<{
      valid: boolean
      errors: FormError[]
    }> => {
      const effectiveRules = getEffectiveRules()
      if (!effectiveRules) {
        setErrors([])
        return { valid: true, errors: [] }
      }
      const result = await validateForm(formValuesRef.current, effectiveRules)
      setErrors(result.errors)
      return result
    }, [getEffectiveRules])

    const validate = useCallback(async (): Promise<boolean> => {
      const result = await runValidation()
      return result.valid
    }, [runValidation])

    const validateFields = useCallback(
      async (fieldNames: string[]): Promise<boolean> => {
        if (!fieldNames || fieldNames.length === 0) {
          return true
        }

        const nextErrors: FormError[] = []
        const fieldSet = new Set(fieldNames)

        for (const fieldName of fieldNames) {
          const fieldRules = resolveFieldRules(fieldName)
          if (!fieldRules) {
            onValidate?.(fieldName, true, null)
            continue
          }

          const error = await runFieldValidation(fieldName)

          if (error) {
            nextErrors.push({ field: fieldName, message: error })
          }

          onValidate?.(fieldName, !error, error)
        }

        setErrors((prevErrors) => {
          const filtered = prevErrors.filter((entry) => !fieldSet.has(entry.field))
          return [...filtered, ...nextErrors]
        })

        return nextErrors.length === 0
      },
      [resolveFieldRules, runFieldValidation, onValidate]
    )

    const clearValidate = useCallback((fieldNames?: string | string[]): void => {
      if (!fieldNames) {
        setErrors([])
        return
      }

      const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
      setErrors((prevErrors) => prevErrors.filter((error) => !fields.includes(error.field)))
    }, [])

    const resetFields = useCallback((): void => {
      clearValidate()
      setFormValues(model)
    }, [model, clearValidate])

    const updateValue = useCallback(
      (fieldName: string, value: unknown): void => {
        const setValueByPath = (
          target: FormValues,
          path: string,
          nextValue: unknown
        ): FormValues => {
          if (!path.includes('.')) {
            return { ...target, [path]: nextValue }
          }

          const segments = path.split('.').filter(Boolean)
          if (segments.length === 0) {
            return target
          }

          const clone: FormValues = { ...target }
          let cursor: Record<string, unknown> = clone

          for (let i = 0; i < segments.length; i++) {
            const key = segments[i]
            const isLast = i === segments.length - 1

            if (isLast) {
              cursor[key] = nextValue
              break
            }

            const existing = cursor[key]
            const next =
              existing && typeof existing === 'object' && !Array.isArray(existing)
                ? { ...(existing as Record<string, unknown>) }
                : {}

            cursor[key] = next
            cursor = next
          }

          return clone
        }

        setFormValues((prevValues) => {
          const newValues = setValueByPath(prevValues, fieldName, value)
          onChange?.(newValues)
          return newValues
        })
      },
      [onChange]
    )

    const handleSubmit = useCallback(
      async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const result = await runValidation()
        onSubmit?.({ ...result, values: formValuesRef.current })
      },
      [runValidation, onSubmit]
    )

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        validate,
        validateFields,
        validateField,
        clearValidate,
        resetFields
      }),
      [validate, validateFields, validateField, clearValidate, resetFields]
    )

    const contextValue: FormContextValue = useMemo(
      () => ({
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
        registerFieldRules,
        validateField,
        clearValidate,
        updateValue
      }),
      [
        formValues,
        rules,
        labelWidth,
        labelPosition,
        labelAlign,
        size,
        inlineMessage,
        showRequiredAsterisk,
        disabled,
        errors,
        registerFieldRules,
        validateField,
        clearValidate,
        updateValue
      ]
    )

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
  }
)

Form.displayName = 'TigerForm'
