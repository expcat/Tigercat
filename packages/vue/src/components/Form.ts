import { defineComponent, provide, reactive, computed, h, PropType } from 'vue'
import { classNames, type FormRules, type FormValues, type FormError, type FormLabelPosition, type FormLabelAlign, type FormSize, validateForm } from '@tigercat/core'

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
  validateField: (fieldName: string) => Promise<void>
  clearValidate: (fieldNames?: string | string[]) => void
}

export const Form = defineComponent({
  name: 'TigerForm',
  props: {
    model: {
      type: Object as PropType<FormValues>,
      default: () => ({}),
    },
    rules: {
      type: Object as PropType<FormRules>,
    },
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
    },
    labelPosition: {
      type: String as PropType<FormLabelPosition>,
      default: 'right',
    },
    labelAlign: {
      type: String as PropType<FormLabelAlign>,
      default: 'right',
    },
    size: {
      type: String as PropType<FormSize>,
      default: 'md',
    },
    inlineMessage: {
      type: Boolean,
      default: true,
    },
    showRequiredAsterisk: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['submit', 'validate'],
  setup(props, { slots, emit, expose }) {
    const errors = reactive<FormError[]>([])
    
    const validateField = async (fieldName: string): Promise<void> => {
      if (!props.rules || !props.rules[fieldName]) {
        return
      }
      
      const { validateField: validateFieldUtil } = await import('@tigercat/core')
      const value = props.model[fieldName]
      const fieldRules = props.rules[fieldName]
      
      const error = await validateFieldUtil(fieldName, value, fieldRules, props.model)
      
      // Remove existing errors for this field
      const index = errors.findIndex(e => e.field === fieldName)
      if (index !== -1) {
        errors.splice(index, 1)
      }
      
      // Add new error if validation failed
      if (error) {
        errors.push({
          field: fieldName,
          message: error,
        })
      }
      
      emit('validate', fieldName, !error, error)
    }
    
    const validate = async (): Promise<boolean> => {
      if (!props.rules) {
        return true
      }
      
      const result = await validateForm(props.model, props.rules)
      
      // Clear all errors
      errors.splice(0, errors.length)
      
      // Add new errors
      if (result.errors.length > 0) {
        errors.push(...result.errors)
      }
      
      return result.valid
    }
    
    const clearValidate = (fieldNames?: string | string[]): void => {
      if (!fieldNames) {
        errors.splice(0, errors.length)
        return
      }
      
      const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
      
      fields.forEach(fieldName => {
        const index = errors.findIndex(e => e.field === fieldName)
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
      
      emit('submit', {
        valid,
        values: props.model,
        errors: errors,
      })
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
      validateField,
      clearValidate,
    }))
    
    provide<FormContext>(FormContextKey, formContextValue.value)
    
    // Expose methods
    expose({
      validate,
      validateField,
      clearValidate,
      resetFields,
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
          onSubmit: handleSubmit,
        },
        slots.default?.()
      )
    }
  },
})

export default Form
