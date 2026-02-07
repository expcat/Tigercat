import {
  defineComponent,
  inject,
  computed,
  ref,
  watch,
  h,
  PropType,
  type ComputedRef,
  onUnmounted,
  cloneVNode,
  isVNode,
  type VNode
} from 'vue'
import {
  classNames,
  type FormRule,
  type FormSize,
  getFieldError,
  getFormItemClasses,
  getFormItemLabelClasses,
  getFormItemContentClasses,
  getFormItemFieldClasses,
  getFormItemErrorClasses,
  getFormItemAsteriskClasses,
  getFormItemAsteriskStyle
} from '@expcat/tigercat-core'
import { FormContextKey, type FormContext } from './Form'

function mergeAriaDescribedBy(
  existing: string | undefined,
  next: string | undefined
): string | undefined {
  if (!existing) return next
  if (!next) return existing
  const parts = new Set(
    `${existing} ${next}`
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean)
  )
  return Array.from(parts).join(' ')
}

let formItemIdCounter = 0

export const FormItem = defineComponent({
  name: 'TigerFormItem',
  props: {
    /**
     * Field name (for validation)
     */
    name: {
      type: String
    },
    /**
     * Field label text
     */
    label: {
      type: String
    },
    /**
     * Label width (overrides form-level setting)
     */
    labelWidth: {
      type: [String, Number] as PropType<string | number>
    },
    /**
     * Mark field as required
     */
    required: {
      type: Boolean
    },
    /**
     * Field validation rules (overrides form-level rules)
     */
    rules: {
      type: [Object, Array] as PropType<FormRule | FormRule[]>
    },
    /**
     * Custom error message
     */
    error: {
      type: String
    },
    /**
     * Show validation message
     * @default true
     */
    showMessage: {
      type: Boolean,
      default: true
    },
    /**
     * Field size (overrides form-level size)
     */
    size: {
      type: String as PropType<FormSize>
    }
  },
  setup(props, { slots }) {
    const formContextRef = inject<ComputedRef<FormContext> | null>(FormContextKey, null)
    const formContext = computed(() => formContextRef?.value ?? null)

    const errorMessage = ref<string>('')
    const shakeTrigger = ref(0)

    const instanceId = ++formItemIdCounter
    const baseId = `tiger-form-item-${instanceId}`
    const labelId = `${baseId}-label`
    const fieldId = `${baseId}-field`
    const errorId = `${baseId}-error`

    const actualSize = computed(() => {
      return props.size || formContext.value?.size || 'md'
    })

    const actualLabelWidth = computed(() => {
      const width = props.labelWidth || formContext.value?.labelWidth
      if (typeof width === 'number') {
        return `${width}px`
      }
      return width
    })

    const labelPosition = computed(() => {
      return formContext.value?.labelPosition || 'right'
    })

    const labelAlign = computed(() => {
      return formContext.value?.labelAlign || 'right'
    })

    const hasRequiredRule = (maybeRules: FormRule | FormRule[] | undefined): boolean => {
      if (!maybeRules) {
        return false
      }

      const rules = Array.isArray(maybeRules) ? maybeRules : [maybeRules]

      return rules.some((rule) => {
        if (!rule || typeof rule !== 'object') {
          return false
        }
        return !!rule.required
      })
    }

    const showRequiredAsterisk = computed(() => {
      if (props.required !== undefined) {
        return props.required
      }

      // Check if any rule has required: true
      if (props.rules) {
        return hasRequiredRule(props.rules)
      }

      // Check form-level rules
      if (props.name && formContext.value?.rules) {
        const fieldRules = formContext.value.rules[props.name]
        if (fieldRules) {
          return hasRequiredRule(fieldRules)
        }
      }

      return false
    })

    const isRequired = computed(() => {
      return showRequiredAsterisk.value && (formContext.value?.showRequiredAsterisk ?? true)
    })

    // Watch for errors in form context
    watch(
      () => formContext.value?.errors,
      (errors) => {
        if (props.name && errors) {
          const error = getFieldError(props.name, errors)
          errorMessage.value = error || ''
          if (error) {
            shakeTrigger.value++
          }
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

    const unregisterFieldRules = () => {
      const ctx = formContext.value
      if (props.name && ctx) {
        ctx.registerFieldRules(props.name, undefined)
      }
    }

    watch(
      () => [props.name, props.rules] as const,
      ([name, rules]) => {
        const ctx = formContext.value
        if (!name || !ctx) {
          return
        }

        if (rules) {
          ctx.registerFieldRules(name, rules)
        } else {
          ctx.registerFieldRules(name, undefined)
        }
      },
      { immediate: true }
    )

    onUnmounted(unregisterFieldRules)

    const handleBlur = () => {
      const ctx = formContext.value
      if (props.name && ctx) {
        ctx.validateField(props.name, props.rules, 'blur')
      }
    }

    const handleChange = () => {
      const ctx = formContext.value
      if (props.name && ctx) {
        ctx.validateField(props.name, props.rules, 'change')
      }
    }

    const hasError = computed(() => {
      return !!errorMessage.value
    })

    const describedById = computed(() => {
      return props.showMessage && hasError.value ? errorId : undefined
    })

    const formItemClasses = computed(() => {
      return getFormItemClasses({
        size: actualSize.value,
        labelPosition: labelPosition.value,
        hasError: hasError.value,
        disabled: formContext.value?.disabled
      })
    })

    const labelClasses = computed(() => {
      return getFormItemLabelClasses({
        size: actualSize.value,
        labelAlign: labelAlign.value,
        labelPosition: labelPosition.value,
        isRequired: isRequired.value
      })
    })

    const labelStyles = computed(() => {
      if (labelPosition.value === 'top') {
        return {}
      }
      return actualLabelWidth.value ? { width: actualLabelWidth.value } : {}
    })

    const contentClasses = computed(() => getFormItemContentClasses(labelPosition.value))

    const errorClasses = computed(() => {
      return classNames(getFormItemErrorClasses(actualSize.value), hasError.value && 'opacity-100')
    })

    const fieldClasses = getFormItemFieldClasses()
    const asteriskClasses = getFormItemAsteriskClasses()
    const asteriskStyle = getFormItemAsteriskStyle()

    return () => {
      const defaultSlot = slots.default?.() ?? []
      const only = defaultSlot.length === 1 ? defaultSlot[0] : undefined
      const isSingleVNode = only != null && isVNode(only)

      const effectiveFieldId = (() => {
        if (!isSingleVNode) {
          return undefined
        }
        const p = ((only as VNode).props ?? {}) as Record<string, unknown>
        return (p.id as string | undefined) ?? fieldId
      })()

      const fieldChildren = (() => {
        if (!isSingleVNode) {
          return defaultSlot
        }

        const vnode = only as VNode
        const existingProps = (vnode.props ?? {}) as Record<string, unknown>
        const isNativeElement = typeof vnode.type === 'string'

        const existingOnBlur = existingProps.onBlur as ((event: FocusEvent) => void) | undefined
        const existingOnFocusout = existingProps.onFocusout as
          | ((event: FocusEvent) => void)
          | undefined
        const existingOnInput = existingProps.onInput as ((event: Event) => void) | undefined
        const existingOnChange = existingProps.onChange as ((event: Event) => void) | undefined

        const merged = cloneVNode(
          vnode,
          {
            id: effectiveFieldId,
            status:
              !isNativeElement && hasError.value
                ? 'error'
                : (existingProps.status as string | undefined),
            errorMessage:
              !isNativeElement && hasError.value && !props.showMessage
                ? errorMessage.value
                : (existingProps.errorMessage as string | undefined),
            _shakeTrigger: !isNativeElement && hasError.value ? shakeTrigger.value : undefined,
            'aria-invalid': hasError.value ? 'true' : existingProps['aria-invalid'],
            'aria-required': isRequired.value ? 'true' : existingProps['aria-required'],
            'aria-describedby': mergeAriaDescribedBy(
              existingProps['aria-describedby'] as string | undefined,
              describedById.value
            ),
            onBlur: (event: FocusEvent) => {
              existingOnBlur?.(event)
              handleBlur()
            },
            onFocusout: (event: FocusEvent) => {
              existingOnFocusout?.(event)
              handleBlur()
            },
            onInput: (event: Event) => {
              existingOnInput?.(event)
              handleChange()
            },
            onChange: (event: Event) => {
              existingOnChange?.(event)
              handleChange()
            }
          },
          true
        )

        return [merged]
      })()

      const labelElement = props.label
        ? h(
            'label',
            {
              class: labelClasses.value,
              style: labelStyles.value,
              id: labelId,
              for: effectiveFieldId
            },
            [
              isRequired.value && h('span', { class: asteriskClasses, style: asteriskStyle }, '*'),
              props.label
            ]
          )
        : null

      const contentElement = h(
        'div',
        {
          class: contentClasses.value
        },
        [
          h(
            'div',
            {
              class: fieldClasses,
              role: 'group',
              'aria-labelledby': props.label ? labelId : undefined,
              'aria-describedby': describedById.value,
              'aria-invalid': hasError.value ? 'true' : undefined,
              'aria-required': isRequired.value ? 'true' : undefined,
              onFocusout: isSingleVNode ? undefined : handleBlur,
              onInput: isSingleVNode ? undefined : handleChange,
              onChange: isSingleVNode ? undefined : handleChange
            },
            fieldChildren
          ),
          props.showMessage &&
            h(
              'div',
              {
                id: hasError.value ? errorId : undefined,
                role: hasError.value ? 'alert' : undefined,
                class: errorClasses.value,
                'aria-hidden': hasError.value ? undefined : 'true'
              },
              hasError.value ? errorMessage.value : ''
            )
        ]
      )

      return h(
        'div',
        {
          class: formItemClasses.value
        },
        [labelElement, contentElement]
      )
    }
  }
})

export default FormItem
