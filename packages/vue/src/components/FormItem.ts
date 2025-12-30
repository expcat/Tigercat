import { defineComponent, inject, computed, ref, watch, h, PropType } from 'vue'
import { classNames, type FormRule, type FormSize, getFieldError } from '@tigercat/core'
import { FormContextKey, type FormContext } from './Form'

export const FormItem = defineComponent({
  name: 'TigerFormItem',
  props: {
    /**
     * Field name (for validation)
     */
    name: {
      type: String,
    },
    /**
     * Field label text
     */
    label: {
      type: String,
    },
    /**
     * Label width (overrides form-level setting)
     */
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
    },
    /**
     * Mark field as required
     */
    required: {
      type: Boolean,
    },
    /**
     * Field validation rules (overrides form-level rules)
     */
    rules: {
      type: [Object, Array] as PropType<FormRule | FormRule[]>,
    },
    /**
     * Custom error message
     */
    error: {
      type: String,
    },
    /**
     * Show validation message
     * @default true
     */
    showMessage: {
      type: Boolean,
      default: true,
    },
    /**
     * Field size (overrides form-level size)
     */
    size: {
      type: String as PropType<FormSize>,
    },
  },
  setup(props, { slots }) {
    const formContext = inject<FormContext | null>(FormContextKey, null)
    
    const errorMessage = ref<string>('')
    
    const actualSize = computed(() => {
      return props.size || formContext?.size || 'md'
    })
    
    const actualLabelWidth = computed(() => {
      const width = props.labelWidth || formContext?.labelWidth
      if (typeof width === 'number') {
        return `${width}px`
      }
      return width
    })
    
    const labelPosition = computed(() => {
      return formContext?.labelPosition || 'right'
    })
    
    const labelAlign = computed(() => {
      return formContext?.labelAlign || 'right'
    })
    
    const showRequiredAsterisk = computed(() => {
      if (props.required !== undefined) {
        return props.required
      }
      
      // Check if any rule has required: true
      if (props.rules) {
        const rules = Array.isArray(props.rules) ? props.rules : [props.rules]
        return rules.some(rule => rule.required)
      }
      
      // Check form-level rules
      if (props.name && formContext?.rules) {
        const fieldRules = formContext.rules[props.name]
        if (fieldRules) {
          const rules = Array.isArray(fieldRules) ? fieldRules : [fieldRules]
          return rules.some(rule => rule.required)
        }
      }
      
      return false
    })
    
    const isRequired = computed(() => {
      return showRequiredAsterisk.value && (formContext?.showRequiredAsterisk ?? true)
    })
    
    // Watch for errors in form context
    watch(
      () => formContext?.errors,
      (errors) => {
        if (props.name && errors) {
          const error = getFieldError(props.name, errors)
          errorMessage.value = error || ''
        }
      },
      { deep: true, immediate: true }
    )
    
    // Watch for controlled error prop
    watch(
      () => props.error,
      (error) => {
        if (error !== undefined) {
          errorMessage.value = error
        }
      },
      { immediate: true }
    )
    
    const handleBlur = () => {
      if (props.name && formContext) {
        formContext.validateField(props.name)
      }
    }
    
    const handleChange = () => {
      if (props.name && formContext) {
        formContext.validateField(props.name)
      }
    }
    
    const hasError = computed(() => {
      return !!errorMessage.value
    })
    
    const formItemClasses = computed(() => {
      return classNames(
        'tiger-form-item',
        `tiger-form-item--${actualSize.value}`,
        `tiger-form-item--label-${labelPosition.value}`,
        hasError.value && 'tiger-form-item--error',
        formContext?.disabled && 'tiger-form-item--disabled'
      )
    })
    
    const labelClasses = computed(() => {
      return classNames(
        'tiger-form-item__label',
        `tiger-form-item__label--${labelAlign.value}`,
        isRequired.value && 'tiger-form-item__label--required'
      )
    })
    
    const labelStyles = computed(() => {
      if (labelPosition.value === 'top') {
        return {}
      }
      return actualLabelWidth.value ? { width: actualLabelWidth.value } : {}
    })
    
    const contentClasses = 'tiger-form-item__content'
    
    const errorClasses = computed(() => {
      return classNames(
        'tiger-form-item__error',
        hasError.value && 'tiger-form-item__error--show'
      )
    })
    
    return () => {
      const labelElement = props.label ? h(
        'label',
        {
          class: labelClasses.value,
          style: labelStyles.value,
          for: props.name,
        },
        [
          isRequired.value && h('span', { class: 'tiger-form-item__asterisk' }, '*'),
          props.label,
        ]
      ) : null
      
      const contentElement = h(
        'div',
        {
          class: contentClasses,
        },
        [
          h(
            'div',
            {
              class: 'tiger-form-item__field',
              onBlur: handleBlur,
              onChange: handleChange,
            },
            slots.default?.()
          ),
          props.showMessage && hasError.value && h(
            'div',
            {
              class: errorClasses.value,
            },
            errorMessage.value
          ),
        ]
      )
      
      return h(
        'div',
        {
          class: formItemClasses.value,
        },
        [labelElement, contentElement]
      )
    }
  },
})

export default FormItem
