import {
  defineComponent,
  inject,
  provide,
  computed,
  ref,
  watch,
  h,
  PropType,
  type ComputedRef,
  onUnmounted,
  cloneVNode,
  isVNode,
  useId,
  type VNode
} from 'vue'
import {
  classNames,
  devWarn,
  extractFormChangeValue,
  getFormItemAsteriskClasses,
  getFormItemClasses,
  getFormItemContentClasses,
  getFormItemErrorBlockClasses,
  getFormItemErrorClasses,
  getFormItemErrorPopupClasses,
  getFormItemFieldClasses,
  getFormItemLabelClasses,
  hasRequiredRule,
  mergeAriaDescribedBy,
  type FormRule,
  type FormFieldCondition,
  type ComponentSize,
  type FormErrorDisplayMode,
  type InputStatus
} from '@expcat/tigercat-core'
import { FormContextKey, type FormContext } from './Form'
import { FORM_ITEM_CONTROL_INJECTION_KEY } from './FormItemContext'
import { renderVueOverlayTeleport, useVueAnchoredOverlay } from '../utils/overlay'

export interface VueFormItemProps {
  name?: string
  label?: string
  labelWidth?: string | number
  required?: boolean
  rules?: FormRule | FormRule[]
  error?: string
  showMessage?: boolean
  size?: ComponentSize
  errorDisplayMode?: FormErrorDisplayMode
  condition?: FormFieldCondition
}

export const FormItem = defineComponent({
  name: 'TigerFormItem',
  props: {
    name: {
      type: String
    },
    label: {
      type: String
    },
    labelWidth: {
      type: [String, Number] as PropType<string | number>
    },
    required: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    rules: {
      type: [Object, Array] as PropType<FormRule | FormRule[]>
    },
    error: {
      type: String
    },
    showMessage: {
      type: Boolean,
      default: true
    },
    size: {
      type: String as PropType<ComponentSize>
    },
    errorDisplayMode: {
      type: String as PropType<FormErrorDisplayMode>,
      default: 'inline' as FormErrorDisplayMode
    },
    condition: {
      type: Object as PropType<FormFieldCondition>,
      default: undefined
    }
  },
  setup(props, { slots }) {
    const formContextRef = inject<ComputedRef<FormContext> | null>(FormContextKey, null)
    const formContext = computed(() => formContextRef?.value ?? null)

    const shakeTrigger = ref(0)
    const prevFormError = ref('')
    const popupActive = ref(false)
    const contentRef = ref<HTMLElement | null>(null)
    const errorRef = ref<HTMLElement | null>(null)

    const instanceId = useId()
    const baseId = `tiger-form-item-${instanceId}`
    const labelId = `${baseId}-label`
    const fieldId = `${baseId}-field`
    const errorId = `${baseId}-error`

    const actualSize = computed(() => props.size || formContext.value?.size || 'md')
    const actualLabelWidth = computed(() => {
      const width = props.labelWidth || formContext.value?.labelWidth
      if (typeof width === 'number') {
        return `${width}px`
      }
      return width
    })
    const labelPosition = computed(() => formContext.value?.labelPosition || 'left')
    const labelAlign = computed(() => formContext.value?.labelAlign)

    const conditionState = computed(() => {
      const ctx = formContext.value
      if (!props.name || !ctx) {
        return { shown: true, disabled: false, required: false }
      }
      return ctx.getFieldConditionState(props.name, props.condition)
    })

    const fieldIsRequired = computed(() => {
      if (props.required !== undefined) return props.required
      if (hasRequiredRule(props.rules)) return true
      if (props.name && hasRequiredRule(formContext.value?.rules?.[props.name])) return true
      return conditionState.value.required
    })

    const showAsterisk = computed(
      () => fieldIsRequired.value && (formContext.value?.showRequiredAsterisk ?? true)
    )

    const formError = computed(() =>
      props.name ? formContext.value?.errorsByField[props.name] : undefined
    )
    const errorMessage = computed(() =>
      props.error !== undefined ? props.error : (formError.value ?? '')
    )
    const hasError = computed(() => !!errorMessage.value)

    watch(
      errorMessage,
      (nextError) => {
        if (nextError && nextError !== prevFormError.value) {
          shakeTrigger.value++
        }
        prevFormError.value = nextError
      },
      { immediate: true }
    )

    const unregisterFieldRules = () => {
      const ctx = formContext.value
      if (props.name && ctx) {
        ctx.registerFieldRules(props.name, undefined)
        ctx.registerFieldCondition(props.name, undefined)
      }
    }

    watch(
      () => [props.name, props.rules, props.condition] as const,
      ([name, rules, condition]) => {
        const ctx = formContext.value
        if (!name || !ctx) return
        if (rules) {
          ctx.registerFieldRules(name, rules)
        } else {
          ctx.registerFieldRules(name, undefined)
        }
        ctx.registerFieldCondition(name, condition)
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

    const handleValueChange = (next: unknown) => {
      const ctx = formContext.value
      if (!props.name || !ctx) return
      ctx.updateValue(props.name, next)
      ctx.validateField(props.name, props.rules, 'change')
    }

    const handleNativeChange = (argument?: unknown) => {
      const extracted = extractFormChangeValue(argument)
      if (extracted.found) {
        handleValueChange(extracted.value)
      } else {
        const ctx = formContext.value
        if (props.name && ctx) {
          ctx.validateField(props.name, props.rules, 'change')
        }
      }
    }

    const effectiveShowMessage = computed(
      () => props.showMessage && (formContext.value?.inlineMessage ?? true)
    )
    const popupErrorVisible = computed(
      () =>
        effectiveShowMessage.value &&
        hasError.value &&
        props.errorDisplayMode === 'popup' &&
        popupActive.value
    )
    const overlay = useVueAnchoredOverlay({
      enabled: popupErrorVisible,
      referenceRef: contentRef,
      floatingRef: errorRef,
      placement: 'bottom-start',
      offset: 4
    })

    const describedById = computed(() =>
      effectiveShowMessage.value && hasError.value ? errorId : undefined
    )
    const fieldValue = computed(() => {
      if (!props.name) return undefined
      return formContext.value?.getFieldValue(props.name) ?? ''
    })
    const controlDisabled = computed(() =>
      Boolean(
        formContext.value?.disabled || formContext.value?.loading || conditionState.value.disabled
      )
    )
    const effectiveFieldId = computed(() => fieldId)

    provide(FORM_ITEM_CONTROL_INJECTION_KEY, {
      id: effectiveFieldId,
      name: computed(() => props.name),
      status: computed(() => (hasError.value ? ('error' as InputStatus) : undefined)),
      errorMessage: computed(() => undefined),
      shakeTrigger: computed(() => (hasError.value ? shakeTrigger.value : undefined)),
      disabled: controlDisabled,
      describedBy: describedById,
      required: fieldIsRequired,
      value: fieldValue,
      onChange: handleValueChange,
      onBlur: handleBlur
    })

    const formItemClasses = computed(() =>
      getFormItemClasses({
        size: actualSize.value,
        labelPosition: labelPosition.value,
        hasError: hasError.value,
        disabled: controlDisabled.value
      })
    )
    const labelClasses = computed(() =>
      getFormItemLabelClasses({
        size: actualSize.value,
        labelAlign: labelAlign.value,
        labelPosition: labelPosition.value,
        isRequired: showAsterisk.value
      })
    )
    const labelStyles = computed(() => {
      if (labelPosition.value === 'top') return {}
      return actualLabelWidth.value ? { width: actualLabelWidth.value } : {}
    })

    const fieldClasses = getFormItemFieldClasses()
    const asteriskClasses = getFormItemAsteriskClasses()

    return () => {
      if (!conditionState.value.shown) {
        return null
      }

      const defaultSlot = slots.default?.() ?? []
      const only = defaultSlot.length === 1 ? defaultSlot[0] : undefined
      const isNativeElement = only != null && isVNode(only) && typeof only.type === 'string'
      const useGroup = defaultSlot.length !== 1

      if (useGroup && props.name) {
        devWarn(
          'FormItem.multipleControls',
          'FormItem supports a single field control. Extra children do not receive value or validation bindings.'
        )
      }

      const nativeId =
        isNativeElement && only
          ? ((((only as VNode).props ?? {}) as Record<string, unknown>).id as string | undefined)
          : undefined
      const controlId = nativeId ?? fieldId

      const fieldChildren = (() => {
        if (!isNativeElement || !only) {
          return defaultSlot
        }

        const vnode = only as VNode
        const existingProps = (vnode.props ?? {}) as Record<string, unknown>
        const nativeType =
          typeof existingProps.type === 'string' ? existingProps.type.toLowerCase() : ''

        const next: Record<string, unknown> = {
          id: controlId,
          name: existingProps.name ?? props.name,
          'aria-invalid': hasError.value ? 'true' : existingProps['aria-invalid'],
          'aria-required': fieldIsRequired.value ? 'true' : existingProps['aria-required'],
          disabled: controlDisabled.value ? true : existingProps.disabled,
          'aria-describedby': mergeAriaDescribedBy(
            existingProps['aria-describedby'] as string | undefined,
            describedById.value
          ),
          onFocusout: handleBlur,
          onInput: handleNativeChange,
          onChange: handleNativeChange
        }

        if (nativeType === 'checkbox') {
          next.checked = Boolean(fieldValue.value)
        } else if (nativeType === 'radio') {
          next.checked = existingProps.value === fieldValue.value
        } else if (fieldValue.value !== undefined) {
          next.value = fieldValue.value
        }

        return [cloneVNode(vnode, next, true)]
      })()

      const labelElement = props.label
        ? h(
            'label',
            {
              class: labelClasses.value,
              style: labelStyles.value,
              id: labelId,
              for: controlId
            },
            [showAsterisk.value && h('span', { class: asteriskClasses }, '*'), props.label]
          )
        : null

      const errorElement = (() => {
        if (!effectiveShowMessage.value) return null
        if (props.errorDisplayMode === 'block' && !hasError.value) return null
        if (props.errorDisplayMode === 'popup' && !hasError.value) return null

        const errorClass =
          props.errorDisplayMode === 'block'
            ? getFormItemErrorBlockClasses(actualSize.value)
            : props.errorDisplayMode === 'popup'
              ? classNames(getFormItemErrorPopupClasses(), overlay.floatingClasses.value)
              : getFormItemErrorClasses(actualSize.value, { visible: hasError.value })

        return renderVueOverlayTeleport(
          h(
            'div',
            {
              ref: errorRef,
              id: hasError.value ? errorId : undefined,
              role: hasError.value ? 'alert' : undefined,
              class: errorClass,
              style: props.errorDisplayMode === 'popup' ? overlay.floatingStyles.value : undefined,
              'data-positioned':
                props.errorDisplayMode === 'popup' ? overlay.positioned.value : undefined,
              'aria-hidden': hasError.value ? undefined : 'true'
            },
            hasError.value ? errorMessage.value : ''
          ),
          overlay.target.value,
          props.errorDisplayMode !== 'popup'
        )
      })()

      const fieldWrapper: Record<string, unknown> = {
        class: fieldClasses
      }
      if (useGroup) {
        fieldWrapper.role = 'group'
        fieldWrapper['aria-labelledby'] = props.label ? labelId : undefined
        fieldWrapper['aria-describedby'] = describedById.value
        fieldWrapper['aria-invalid'] = hasError.value ? 'true' : undefined
      }

      const contentElement = h(
        'div',
        {
          ref: contentRef,
          class: classNames(
            getFormItemContentClasses(labelPosition.value),
            props.errorDisplayMode === 'popup' && 'relative'
          ),
          onMouseenter: () => {
            popupActive.value = true
          },
          onMouseleave: () => {
            popupActive.value = false
          },
          onFocusin: () => {
            popupActive.value = true
          },
          onFocusout: (event: FocusEvent) => {
            const next = event.relatedTarget as Node | null
            if (!contentRef.value?.contains(next)) {
              popupActive.value = false
            }
          }
        },
        [h('div', fieldWrapper, fieldChildren), errorElement]
      )

      return h('div', { class: formItemClasses.value }, [labelElement, contentElement])
    }
  }
})

export default FormItem
