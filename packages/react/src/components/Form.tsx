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
  type FormConditions,
  type FormFieldCondition,
  type FormConditionState,
  type FormLabelPosition,
  type FormLabelAlign,
  type ComponentSize,
  type FormRule,
  type FormRuleTrigger,
  validateForm,
  validateField as validateFieldUtil,
  getValueByPath,
  createFormErrorMap,
  getDependentFields,
  createFormConditionDependencies,
  resolveConditionalFormRules,
  resolveFormFieldConditionState,
  createFormValidationDebouncer,
  createFormHistory,
  pushFormHistory,
  undoFormHistory,
  redoFormHistory,
  canUndo,
  canRedo,
  mergeTigerLocale,
  getFormValidationLabels,
  type FormValidationDebouncer
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

// Form context type
export interface FormContextValue {
  model: FormValues
  rules?: FormRules
  labelWidth?: string | number
  labelPosition: FormLabelPosition
  labelAlign: FormLabelAlign
  size: ComponentSize
  inlineMessage: boolean
  showRequiredAsterisk: boolean
  disabled: boolean
  loading: boolean
  errors: FormError[]
  errorsByField: Record<string, string | undefined>
  registerFieldRules: (fieldName: string, rules?: FormRule | FormRule[]) => void
  registerFieldCondition: (fieldName: string, condition?: FormFieldCondition) => void
  getFieldConditionState: (
    fieldName: string,
    conditionOverride?: FormFieldCondition
  ) => FormConditionState
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
  addField: (fieldName: string, defaultValue?: unknown) => void
  removeField: (fieldName: string) => void
  undo: () => void
  redo: () => void
  snapshotHistory: () => void
  canUndo: boolean
  canRedo: boolean
}

// Form submit event
export interface FormSubmitEvent {
  valid: boolean
  values: FormValues
  errors: FormError[]
}

export interface FormProps extends CoreFormProps {
  /**
   * Whether the form is in a loading state (prevents submit)
   */
  loading?: boolean

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

  /**
   * Field dependencies for cross-field validation
   */
  fieldDependencies?: Map<string, string[]>

  /**
   * Conditional field behavior DSL for visibility, disabled state, and dynamic required rules.
   */
  conditions?: FormConditions

  /**
   * Debounce delay for change-triggered field validation in milliseconds
   */
  validateDebounce?: number

  /**
   * Enable undo/redo for form values
   */
  undoable?: boolean

  /**
   * Maximum undo history size
   */
  maxHistorySize?: number
}

export const Form = forwardRef<FormHandle, FormProps>(
  (
    {
      model = {},
      rules,
      labelWidth,
      labelPosition = 'right',
      labelAlign,
      size = 'md',
      inlineMessage = true,
      showRequiredAsterisk = true,
      disabled = false,
      loading = false,
      children,
      onSubmit,
      onValidate,
      onChange,
      className,
      fieldDependencies,
      conditions,
      validateDebounce = 0,
      undoable = false,
      maxHistorySize = 50,
      locale,
      ...props
    },
    ref
  ) => {
    const resolvedLabelAlign = labelAlign ?? (labelPosition === 'top' ? 'left' : 'right')
    // Localized built-in validation messages (ConfigProvider locale + prop override)
    const config = useTigerConfig()
    const validationMessages = useMemo(
      () => getFormValidationLabels(mergeTigerLocale(config.locale, locale)),
      [config.locale, locale]
    )
    const [errors, setErrors] = useState<FormError[]>([])
    const fieldRulesRef = React.useRef<FormRules>({})
    const fieldConditionsRef = React.useRef<FormConditions>({})
    const formValuesRef = React.useRef<FormValues>(model)
    const initialValuesRef = React.useRef<FormValues>({ ...model })
    const validationDebouncerRef = React.useRef<FormValidationDebouncer>(
      createFormValidationDebouncer({ delay: validateDebounce })
    )
    const errorsByField = useMemo(() => createFormErrorMap(errors), [errors])

    // v0.6.0: undo/redo history
    const [historyState, setHistoryState] = useState(() => createFormHistory(model, maxHistorySize))

    React.useEffect(() => {
      validationDebouncerRef.current.cancel()
      validationDebouncerRef.current = createFormValidationDebouncer({ delay: validateDebounce })

      return () => validationDebouncerRef.current.cancel()
    }, [validateDebounce])

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

    const registerFieldCondition = useCallback(
      (fieldName: string, condition?: FormFieldCondition) => {
        if (!fieldName) {
          return
        }

        if (!condition) {
          delete fieldConditionsRef.current[fieldName]
          return
        }

        fieldConditionsRef.current[fieldName] = condition
      },
      []
    )

    const getEffectiveConditions = useCallback((): FormConditions | undefined => {
      const merged = { ...(conditions ?? {}), ...fieldConditionsRef.current }
      return Object.keys(merged).length > 0 ? merged : undefined
    }, [conditions])

    const getMergedFieldCondition = useCallback(
      (
        fieldName: string,
        conditionOverride?: FormFieldCondition
      ): FormFieldCondition | undefined => {
        const base = getEffectiveConditions()?.[fieldName]
        return base || conditionOverride
          ? { ...(base ?? {}), ...(conditionOverride ?? {}) }
          : undefined
      },
      [getEffectiveConditions]
    )

    const getFieldConditionState = useCallback(
      (fieldName: string, conditionOverride?: FormFieldCondition): FormConditionState => {
        return resolveFormFieldConditionState(
          formValuesRef.current,
          getMergedFieldCondition(fieldName, conditionOverride)
        )
      },
      [getMergedFieldCondition]
    )

    const getEffectiveRules = useCallback((): FormRules | undefined => {
      const fromForm = rules ?? {}
      const fromItems = fieldRulesRef.current
      const merged = { ...fromForm, ...fromItems }
      const nextRules = Object.keys(merged).length > 0 ? merged : undefined
      return resolveConditionalFormRules(formValuesRef.current, nextRules, getEffectiveConditions())
    }, [rules, getEffectiveConditions])

    const resolveFieldRules = useCallback(
      (fieldName: string, rulesOverride?: FormRule | FormRule[]) => {
        const fieldRules = rulesOverride ?? fieldRulesRef.current[fieldName] ?? rules?.[fieldName]
        const resolved = resolveConditionalFormRules(
          formValuesRef.current,
          fieldRules ? { [fieldName]: fieldRules } : undefined,
          getEffectiveConditions()
        )
        return resolved?.[fieldName]
      },
      [rules, getEffectiveConditions]
    )

    const getDependencyMap = useCallback((): Map<string, string[]> | undefined => {
      const conditionDependencies = createFormConditionDependencies(getEffectiveConditions())
      if (!fieldDependencies && conditionDependencies.size === 0) {
        return undefined
      }

      const merged = new Map<string, string[]>(fieldDependencies ?? [])
      for (const [fieldName, dependencies] of conditionDependencies.entries()) {
        const current = merged.get(fieldName) ?? []
        merged.set(fieldName, Array.from(new Set([...current, ...dependencies])))
      }
      return merged
    }, [fieldDependencies, getEffectiveConditions])

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
        return validateFieldUtil(
          fieldName,
          value,
          fieldRules,
          currentValues,
          trigger,
          validationMessages
        )
      },
      [resolveFieldRules, validationMessages]
    )

    const validateFieldNow = useCallback(
      async (
        fieldName: string,
        rulesOverride?: FormRule | FormRule[],
        trigger?: FormRuleTrigger
      ): Promise<void> => {
        const conditionState = getFieldConditionState(fieldName)
        if (!conditionState.shown || conditionState.disabled) {
          setErrors((prevErrors) => prevErrors.filter((error) => error.field !== fieldName))
          onValidate?.(fieldName, true, null)
          return
        }

        const fieldRules = resolveFieldRules(fieldName, rulesOverride)
        if (fieldRules) {
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
        }

        // v0.6.0: revalidate dependent fields (even if current field has no rules)
        const dependencyMap = getDependencyMap()
        if (dependencyMap) {
          const dependents = getDependentFields(fieldName, dependencyMap)
          for (const dep of dependents) {
            await validateFieldNow(dep)
          }
        }
      },
      [resolveFieldRules, runFieldValidation, onValidate, getFieldConditionState, getDependencyMap]
    )

    const validateField = useCallback(
      async (
        fieldName: string,
        rulesOverride?: FormRule | FormRule[],
        trigger?: FormRuleTrigger
      ): Promise<void> => {
        if (trigger === 'change' && validateDebounce > 0) {
          return validationDebouncerRef.current.schedule(fieldName, () =>
            validateFieldNow(fieldName, rulesOverride, trigger)
          )
        }

        validationDebouncerRef.current.cancel(fieldName)
        return validateFieldNow(fieldName, rulesOverride, trigger)
      },
      [validateDebounce, validateFieldNow]
    )

    const runValidation = useCallback(async (): Promise<{
      valid: boolean
      errors: FormError[]
    }> => {
      validationDebouncerRef.current.cancel()
      const effectiveRules = getEffectiveRules()
      if (!effectiveRules) {
        setErrors([])
        return { valid: true, errors: [] }
      }
      const result = await validateForm(formValuesRef.current, effectiveRules, validationMessages)
      setErrors(result.errors)
      return result
    }, [getEffectiveRules, validationMessages])

    const validate = useCallback(async (): Promise<boolean> => {
      const result = await runValidation()
      return result.valid
    }, [runValidation])

    const validateFields = useCallback(
      async (fieldNames: string[]): Promise<boolean> => {
        if (!fieldNames || fieldNames.length === 0) {
          return true
        }

        fieldNames.forEach((fieldName) => validationDebouncerRef.current.cancel(fieldName))

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
        validationDebouncerRef.current.cancel()
        setErrors([])
        return
      }

      const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
      fields.forEach((fieldName) => validationDebouncerRef.current.cancel(fieldName))
      setErrors((prevErrors) => prevErrors.filter((error) => !fields.includes(error.field)))
    }, [])

    const resetFields = useCallback((): void => {
      clearValidate()
      const next = { ...initialValuesRef.current }
      formValuesRef.current = next
      onChange?.(next)
      if (undoable) {
        setHistoryState(createFormHistory(next, maxHistorySize))
      }
    }, [clearValidate, onChange, undoable, maxHistorySize])

    const addField = useCallback(
      (fieldName: string, defaultValue?: unknown): void => {
        if (!fieldName) return
        const next = { ...formValuesRef.current, [fieldName]: defaultValue ?? null }
        formValuesRef.current = next
        onChange?.(next)
      },
      [onChange]
    )

    const removeField = useCallback(
      (fieldName: string): void => {
        if (!fieldName) return
        const { [fieldName]: _, ...next } = formValuesRef.current
        formValuesRef.current = next
        onChange?.(next)
        clearValidate(fieldName)
      },
      [onChange, clearValidate]
    )

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

        const newValues = setValueByPath(formValuesRef.current, fieldName, value)
        formValuesRef.current = newValues
        onChange?.(newValues)
      },
      [onChange]
    )

    // v0.6.0: undo/redo
    const snapshotHistory = useCallback((): void => {
      if (!undoable) return
      setHistoryState((prev) => pushFormHistory(prev, formValuesRef.current))
    }, [undoable])

    const undo = useCallback((): void => {
      if (!undoable) return
      setHistoryState((prev) => {
        const result = undoFormHistory(prev)
        if (result) {
          formValuesRef.current = result.present
          onChange?.(result.present)
          return result
        }
        return prev
      })
    }, [undoable, onChange])

    const redo = useCallback((): void => {
      if (!undoable) return
      setHistoryState((prev) => {
        const result = redoFormHistory(prev)
        if (result) {
          formValuesRef.current = result.present
          onChange?.(result.present)
          return result
        }
        return prev
      })
    }, [undoable, onChange])

    const handleSubmit = useCallback(
      async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        if (loading) return
        const result = await runValidation()
        onSubmit?.({ ...result, values: formValuesRef.current })
      },
      [runValidation, onSubmit, loading]
    )

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        validate,
        validateFields,
        validateField,
        clearValidate,
        resetFields,
        addField,
        removeField,
        undo,
        redo,
        snapshotHistory,
        canUndo: canUndo(historyState),
        canRedo: canRedo(historyState)
      }),
      [
        validate,
        validateFields,
        validateField,
        clearValidate,
        resetFields,
        addField,
        removeField,
        undo,
        redo,
        snapshotHistory,
        historyState
      ]
    )

    const contextValue: FormContextValue = useMemo(
      () => ({
        model,
        rules,
        labelWidth,
        labelPosition,
        labelAlign: resolvedLabelAlign,
        size,
        inlineMessage,
        showRequiredAsterisk,
        disabled,
        loading,
        errors,
        errorsByField,
        registerFieldRules,
        registerFieldCondition,
        getFieldConditionState,
        validateField,
        clearValidate,
        updateValue
      }),
      [
        model,
        rules,
        labelWidth,
        labelPosition,
        resolvedLabelAlign,
        size,
        inlineMessage,
        showRequiredAsterisk,
        disabled,
        loading,
        errors,
        errorsByField,
        registerFieldRules,
        registerFieldCondition,
        getFieldConditionState,
        validateField,
        clearValidate,
        updateValue
      ]
    )

    const formClasses = classNames(
      'tiger-form',
      `tiger-form--label-${labelPosition}`,
      disabled && 'tiger-form--disabled',
      loading && 'tiger-form--loading',
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
