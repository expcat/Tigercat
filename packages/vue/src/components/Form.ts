import { defineComponent, provide, reactive, computed, h, PropType, type ComputedRef } from 'vue'
import {
  classNames,
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

// Form context key
export const FormContextKey = Symbol('FormContext')

// Form context type
export interface FormContext {
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
}

export const Form = defineComponent({
  name: 'TigerForm',
  props: {
    /**
     * Form data model
     * @default {}
     */
    model: {
      type: Object as PropType<FormValues>,
      default: () => ({})
    },
    /**
     * Form validation rules
     */
    rules: {
      type: Object as PropType<FormRules>
    },
    /**
     * Label width (string or number in pixels)
     */
    labelWidth: {
      type: [String, Number] as PropType<string | number>
    },
    /**
     * Label position
     * @default 'right'
     */
    labelPosition: {
      type: String as PropType<FormLabelPosition>,
      default: 'right' as FormLabelPosition
    },
    /**
     * Label alignment
     * @default 'right'
     */
    labelAlign: {
      type: String as PropType<FormLabelAlign>,
      default: 'right' as FormLabelAlign
    },
    /**
     * Form size (applies to all form items)
     * @default 'md'
     */
    size: {
      type: String as PropType<FormSize>,
      default: 'md' as FormSize
    },
    /**
     * Show inline validation messages
     * @default true
     */
    inlineMessage: {
      type: Boolean,
      default: true
    },
    /**
     * Show required asterisk on required fields
     * @default true
     */
    showRequiredAsterisk: {
      type: Boolean,
      default: true
    },
    /**
     * Disable all form controls
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    /**
     * Emitted when form is submitted
     */
    submit: (_data: { valid: boolean; values: FormValues; errors: FormError[] }) => true,
    /**
     * Emitted when field is validated
     */
    validate: (fieldName: string, isValid: boolean, _errorMessage?: string) =>
      typeof fieldName === 'string' && typeof isValid === 'boolean'
  },
  setup(props, { slots, emit, expose }) {
    const errors = reactive<FormError[]>([])
    const fieldRules = reactive<Record<string, FormRule | FormRule[]>>({})

    const registerFieldRules = (fieldName: string, rules?: FormRule | FormRule[]): void => {
      if (!fieldName) {
        return
      }

      if (!rules) {
        delete fieldRules[fieldName]
        return
      }

      fieldRules[fieldName] = rules
    }

    const getEffectiveRules = (): FormRules | undefined => {
      const merged = {
        ...(props.rules ?? {}),
        ...fieldRules
      }
      return Object.keys(merged).length > 0 ? merged : undefined
    }

    const resolveFieldRules = (fieldName: string, rulesOverride?: FormRule | FormRule[]) => {
      return rulesOverride ?? fieldRules[fieldName] ?? props.rules?.[fieldName]
    }

    const runFieldValidation = async (
      fieldName: string,
      rulesOverride?: FormRule | FormRule[],
      trigger?: FormRuleTrigger
    ): Promise<string | null> => {
      const effectiveFieldRules = resolveFieldRules(fieldName, rulesOverride)
      if (!effectiveFieldRules) {
        return null
      }

      const value = getValueByPath(props.model, fieldName)
      return validateFieldUtil(fieldName, value, effectiveFieldRules, props.model, trigger)
    }

    const validateField = async (
      fieldName: string,
      rulesOverride?: FormRule | FormRule[],
      trigger?: FormRuleTrigger
    ): Promise<void> => {
      const effectiveFieldRules = resolveFieldRules(fieldName, rulesOverride)
      if (!effectiveFieldRules) {
        return
      }

      const error = await runFieldValidation(fieldName, rulesOverride, trigger)

      // Skip mutation if error state for this field hasn't changed,
      // avoiding unnecessary watcher triggers in unrelated FormItems.
      const existingIndex = errors.findIndex((e) => e.field === fieldName)
      const existingMessage = existingIndex !== -1 ? errors[existingIndex].message : null

      if (!error && existingMessage === null) {
        // No error before, no error now — nothing to do
      } else if (error && error === existingMessage) {
        // Same error as before — nothing to do
      } else {
        // Remove existing error for this field
        if (existingIndex !== -1) {
          errors.splice(existingIndex, 1)
        }

        // Add new error if validation failed
        if (error) {
          errors.push({
            field: fieldName,
            message: error
          })
        }
      }

      emit('validate', fieldName, !error, error || undefined)
    }

    const validate = async (): Promise<boolean> => {
      errors.splice(0, errors.length)
      const effectiveRules = getEffectiveRules()
      if (!effectiveRules) {
        return true
      }

      const result = await validateForm(props.model, effectiveRules)
      errors.push(...result.errors)
      return result.valid
    }

    const validateFields = async (fieldNames: string[]): Promise<boolean> => {
      if (!fieldNames || fieldNames.length === 0) {
        return true
      }

      const nextErrors: FormError[] = []
      const fieldSet = new Set(fieldNames)

      for (const fieldName of fieldNames) {
        const effectiveFieldRules = resolveFieldRules(fieldName)
        if (!effectiveFieldRules) {
          emit('validate', fieldName, true, undefined)
          continue
        }

        const error = await runFieldValidation(fieldName)

        if (error) {
          nextErrors.push({ field: fieldName, message: error })
        }

        emit('validate', fieldName, !error, error || undefined)
      }

      for (let i = errors.length - 1; i >= 0; i--) {
        if (fieldSet.has(errors[i].field)) {
          errors.splice(i, 1)
        }
      }

      errors.push(...nextErrors)
      return nextErrors.length === 0
    }

    const clearValidate = (fieldNames?: string | string[]): void => {
      if (!fieldNames) {
        errors.splice(0, errors.length)
        return
      }

      const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]

      fields.forEach((fieldName) => {
        const index = errors.findIndex((e) => e.field === fieldName)
        if (index !== -1) {
          errors.splice(index, 1)
        }
      })
    }

    const resetFields = (): void => {
      clearValidate()
    }

    const handleSubmit = async (event: Event): Promise<void> => {
      event.preventDefault()
      const valid = await validate()
      emit('submit', { valid, values: props.model, errors })
    }

    // Provide form context to child FormItems
    const formContextValue = computed<FormContext>(() => ({
      model: props.model,
      rules: props.rules,
      labelWidth: props.labelWidth,
      labelPosition: props.labelPosition,
      labelAlign: props.labelAlign,
      size: props.size,
      inlineMessage: props.inlineMessage,
      showRequiredAsterisk: props.showRequiredAsterisk,
      disabled: props.disabled,
      errors,
      registerFieldRules,
      validateField,
      clearValidate
    }))

    provide<ComputedRef<FormContext>>(FormContextKey, formContextValue)

    // Expose methods
    expose({
      validate,
      validateFields,
      validateField,
      clearValidate,
      resetFields
    })

    const formClasses = computed(() => {
      return classNames(
        'tiger-form',
        `tiger-form--label-${props.labelPosition}`,
        props.disabled && 'tiger-form--disabled'
      )
    })

    return () => {
      return h(
        'form',
        {
          class: formClasses.value,
          onSubmit: handleSubmit
        },
        slots.default?.()
      )
    }
  }
})

export default Form
