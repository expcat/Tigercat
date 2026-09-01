import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  useReducer,
  forwardRef
} from 'react'
import {
  classNames,
  createFormEngine,
  createFormErrorMap,
  focusFirstInvalidField,
  mergeTigerLocale,
  getFormValidationLabels,
  type FormProps as CoreFormProps,
  type FormRules,
  type FormValues,
  type FormError,
  type FormFieldCondition,
  type FormConditionState,
  type FormLabelPosition,
  type FormLabelAlign,
  type ComponentSize,
  type FormRule,
  type FormRuleTrigger,
  type FormController,
  type FormEngine,
  type FormHandle,
  type FormSubmitEvent
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type { FormHandle, FormSubmitEvent }

export interface FormContextValue {
  model: FormValues
  rules?: FormRules
  labelWidth?: string | number
  labelPosition: FormLabelPosition
  labelAlign?: FormLabelAlign
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
  getFieldValue: (fieldName: string) => unknown
  updateValue: (fieldName: string, value: unknown) => void
  validate: () => Promise<boolean>
  validateFields: (fieldNames: string[]) => Promise<boolean>
  getValues: () => FormValues
  submit: () => Promise<boolean>
}

const FormContext = createContext<FormContextValue | null>(null)

export const useFormContext = (): FormContextValue | null => useContext(FormContext)

export interface FormProps
  extends
    Omit<CoreFormProps, 'controller'>,
    Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onChange' | 'onSubmit' | 'onReset'> {
  controller?: FormController
  children?: React.ReactNode
  onSubmit?: (event: FormSubmitEvent) => void
  onValidate?: (fieldName: string, valid: boolean, error?: string | null) => void
  onChange?: (values: FormValues) => void
}

function isFormEngine(controller: FormController): controller is FormEngine {
  return typeof (controller as FormEngine).replaceValues === 'function'
}

export const Form = forwardRef<FormHandle, FormProps>(
  (
    {
      model,
      controller,
      rules,
      labelWidth,
      labelPosition = 'left',
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
      ...domProps
    },
    ref
  ) => {
    const config = useTigerConfig()
    const validationMessages = useMemo(
      () => getFormValidationLabels(mergeTigerLocale(config.locale, locale)),
      [config.locale, locale]
    )

    const optionsRef = useRef({
      rules,
      conditions,
      fieldDependencies,
      validateDebounce,
      onValidate,
      onChange,
      validationMessages
    })
    optionsRef.current = {
      rules,
      conditions,
      fieldDependencies,
      validateDebounce,
      onValidate,
      onChange,
      validationMessages
    }

    const ownedEngineRef = useRef<FormEngine | null>(null)
    if (!controller && ownedEngineRef.current === null) {
      ownedEngineRef.current = createFormEngine({
        initialValues: model ?? {},
        undoable,
        maxHistorySize,
        getRules: () => optionsRef.current.rules,
        getConditions: () => optionsRef.current.conditions,
        getFieldDependencies: () => optionsRef.current.fieldDependencies,
        getMessages: () => optionsRef.current.validationMessages,
        getValidateDebounce: () => optionsRef.current.validateDebounce,
        onValidate: (fieldName, valid, error) =>
          optionsRef.current.onValidate?.(fieldName, valid, error),
        onValuesChange: (next) => optionsRef.current.onChange?.(next)
      })
    }

    const engine: FormEngine | null =
      controller && isFormEngine(controller) ? controller : ownedEngineRef.current
    if (!engine) {
      throw new Error('Form is missing a form engine')
    }

    if (!controller && model !== undefined) {
      engine.replaceValues(model, { emit: false })
    }

    if (controller && isFormEngine(controller)) {
      controller.setOptions({
        rules,
        conditions,
        fieldDependencies,
        messages: validationMessages,
        validateDebounce,
        onValidate
      })
    }

    const [, rerender] = useReducer((count: number) => count + 1, 0)
    useEffect(() => {
      const unsubscribe = engine.subscribe(rerender)
      return unsubscribe
    }, [engine])

    useEffect(() => {
      const owned = ownedEngineRef.current
      return () => {
        owned?.dispose()
        ownedEngineRef.current = null
      }
    }, [])

    const formElementRef = useRef<HTMLFormElement>(null)
    const values = engine.getValues()
    const errors = engine.getErrors()
    const errorsByField = useMemo(() => createFormErrorMap(errors), [errors])

    const validateField = useCallback(
      async (
        fieldName: string,
        rulesOverride?: FormRule | FormRule[],
        trigger?: FormRuleTrigger
      ): Promise<void> => {
        await engine.validateField(fieldName, rulesOverride, trigger)
      },
      [engine]
    )

    const submitForm = useCallback(async (): Promise<boolean> => {
      if (loading) return false
      const valid = await engine.validate()
      if (!valid) {
        focusFirstInvalidField(formElementRef.current)
      }
      onSubmit?.({ valid, values: engine.getValues(), errors: engine.getErrors() })
      return valid
    }, [engine, loading, onSubmit])

    useImperativeHandle(
      ref,
      () => ({
        validate: () => engine.validate(),
        validateFields: (fieldNames) => engine.validateFields(fieldNames),
        validateField,
        clearValidate: (fieldNames) => engine.clearValidate(fieldNames),
        resetFields: () => engine.reset(),
        addField: (fieldName, defaultValue) => engine.addField(fieldName, defaultValue),
        removeField: (fieldName) => engine.removeField(fieldName),
        undo: () => engine.undo(),
        redo: () => engine.redo(),
        snapshotHistory: () => engine.snapshotHistory(),
        get canUndo() {
          return engine.canUndo
        },
        get canRedo() {
          return engine.canRedo
        }
      }),
      [engine, validateField]
    )

    const contextValue = useMemo<FormContextValue>(
      () => ({
        model: values,
        rules,
        labelWidth,
        labelPosition,
        labelAlign,
        size,
        inlineMessage,
        showRequiredAsterisk,
        disabled,
        loading,
        errors,
        errorsByField,
        registerFieldRules: engine.registerFieldRules,
        registerFieldCondition: engine.registerFieldCondition,
        getFieldConditionState: engine.getFieldConditionState,
        validateField,
        clearValidate: engine.clearValidate,
        getFieldValue: engine.getFieldValue,
        updateValue: engine.setFieldValue,
        validate: () => engine.validate(),
        validateFields: (fieldNames) => engine.validateFields(fieldNames),
        getValues: () => engine.getValues(),
        submit: submitForm
      }),
      [
        values,
        rules,
        labelWidth,
        labelPosition,
        labelAlign,
        size,
        inlineMessage,
        showRequiredAsterisk,
        disabled,
        loading,
        errors,
        errorsByField,
        engine,
        submitForm,
        validateField
      ]
    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()
      await submitForm()
    }

    const handleReset = (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault()
      engine.reset()
    }

    const formClasses = classNames(
      'tiger-form',
      `tiger-form--label-${labelPosition}`,
      disabled && 'tiger-form--disabled',
      loading && 'tiger-form--loading',
      className
    )

    return (
      <FormContext.Provider value={contextValue}>
        <form
          {...domProps}
          ref={formElementRef}
          className={formClasses}
          noValidate
          aria-busy={loading || undefined}
          onSubmit={handleSubmit}
          onReset={handleReset}>
          <fieldset disabled={disabled || loading} className="contents m-0 min-w-0 border-0 p-0">
            {children}
          </fieldset>
        </form>
      </FormContext.Provider>
    )
  }
)

Form.displayName = 'TigerForm'
