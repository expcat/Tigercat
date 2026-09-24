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
  getFormItemErrorSrOnlyClasses,
  hasRequiredRule,
  isFormItemGroupControl,
  withRequiredRule,
  mergeAriaDescribedBy,
  type FormRule,
  type FormFieldCondition,
  type ComponentSize,
  type FormErrorDisplayMode,
  type InputStatus
} from '@expcat/tigercat-core'
import { schemaFormExtraClasses } from '@expcat/tigercat-core/schema-form'
import { FormContextKey, type FormContext } from './Form'
import {
  FORM_ITEM_CONTROL_INJECTION_KEY,
  type VueFormItemControlContext
} from './FormItemContext'
export { FORM_ITEM_CONTROL_INJECTION_KEY } from './FormItemContext'

const FormItemControlHost = defineComponent({
  name: 'TigerFormItemControlHost',
  props: {
    control: {
      type: Object as PropType<VueFormItemControlContext>,
      required: true
    }
  },
  setup(props, { slots }) {
    provide(FORM_ITEM_CONTROL_INJECTION_KEY, props.control)
    return () => slots.default?.()
  }
})
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
  extra?: string
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
    },
    extra: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
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

    const registeredName = ref<string | undefined>(undefined)

    const itemRules = () => (props.required ? withRequiredRule(props.rules) : props.rules)

    const unregisterName = (name: string | undefined) => {
      const ctx = formContext.value
      if (!name || !ctx) return
      ctx.registerFieldRules(name, undefined)
      ctx.registerFieldCondition(name, undefined)
    }

    watch(
      () => [props.name, props.rules, props.required, props.condition] as const,
      ([name, rules, required, condition]) => {
        const ctx = formContext.value
        if (!ctx) return
        if (registeredName.value && registeredName.value !== name) {
          unregisterName(registeredName.value)
        }
        registeredName.value = name
        if (!name) return
        ctx.registerFieldRules(name, required ? withRequiredRule(rules) : rules)
        ctx.registerFieldCondition(name, condition)
      },
      { immediate: true }
    )

    watch(
      () =>
        [
          props.name,
          props.disabled,
          formContext.value?.disabled,
          conditionState.value.disabled
        ] as const,
      ([name, itemDisabled, formDisabled, conditionDisabled]) => {
        const ctx = formContext.value
        if (!ctx || !name) return
        ctx.registerFieldDisabled(
          name,
          Boolean(itemDisabled || formDisabled || conditionDisabled)
        )
      },
      { immediate: true }
    )

    onUnmounted(() => {
      const name = registeredName.value
      unregisterName(name)
      if (name) formContext.value?.registerFieldDisabled(name, null)
    })

    const handleBlur = () => {
      const ctx = formContext.value
      if (props.name && ctx) {
        ctx.validateField(props.name, itemRules(), 'blur')
      }
    }

    const handleValueChange = (next: unknown) => {
      const ctx = formContext.value
      if (!props.name || !ctx) return
      ctx.updateValue(props.name, next)
      ctx.validateField(props.name, itemRules(), 'change')
    }

    const handleNativeChange = (argument?: unknown) => {
      const extracted = extractFormChangeValue(argument)
      if (extracted.found) {
        handleValueChange(extracted.value)
      } else {
        const ctx = formContext.value
        if (props.name && ctx) {
          ctx.validateField(props.name, itemRules(), 'change')
        }
      }
    }

    const setError = (message: string | null) => {
      const ctx = formContext.value
      if (!props.name || !ctx) return
      ctx.setFieldError(props.name, message)
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

    const describedById = computed(() => (hasError.value ? errorId : undefined))
    const fieldValue = computed(() => {
      if (!props.name) return undefined
      return formContext.value?.getFieldValue(props.name) ?? ''
    })
    const controlDisabled = computed(() =>
      Boolean(
        props.disabled ||
          formContext.value?.disabled ||
          formContext.value?.loading ||
          conditionState.value.disabled
      )
    )
    const effectiveFieldId = computed(() => fieldId)

    const controlContext: VueFormItemControlContext = {
      id: effectiveFieldId,
      labelId: computed(() => (props.label ? labelId : undefined)),
      name: computed(() => props.name),
      status: computed(() => (hasError.value ? ('error' as InputStatus) : undefined)),
      shakeTrigger: computed(() => (hasError.value ? shakeTrigger.value : undefined)),
      disabled: controlDisabled,
      describedBy: describedById,
      required: fieldIsRequired,
      value: fieldValue,
      onChange: handleValueChange,
      onBlur: handleBlur,
      setError
    }

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
      const isGroupControl = only != null && isVNode(only) && isFormItemGroupControl(only.type)

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
          return only ? [only] : []
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
              for: isGroupControl ? undefined : controlId
            },
            [
              showAsterisk.value &&
                h('span', { class: asteriskClasses, 'aria-hidden': 'true' }, '*'),
              props.label
            ]
          )
        : null

      const errorElement = (() => {
        if (!hasError.value) return null
        const announcement = formContext.value?.errorAnnouncement ?? 'polite'
        const popupOpen =
          effectiveShowMessage.value && props.errorDisplayMode === 'popup' && popupActive.value
        const hidden = !effectiveShowMessage.value || (props.errorDisplayMode === 'popup' && !popupOpen)
        const errorClass = hidden
          ? getFormItemErrorSrOnlyClasses()
          : props.errorDisplayMode === 'block'
            ? getFormItemErrorBlockClasses(actualSize.value)
            : props.errorDisplayMode === 'popup'
              ? classNames(getFormItemErrorPopupClasses(), overlay.floatingClasses.value)
              : getFormItemErrorClasses(actualSize.value, { visible: true })
        const node = h(
          'div',
          {
            ref: errorRef,
            id: errorId,
            'aria-live': announcement,
            role: announcement === 'assertive' ? 'alert' : 'status',
            class: errorClass,
            style: popupOpen ? overlay.floatingStyles.value : undefined,
            'data-positioned': popupOpen ? overlay.positioned.value : undefined
          },
          errorMessage.value
        )
        if (!popupOpen) return node
        return renderVueOverlayTeleport(node, overlay.target.value, false)
      })()

      const fieldWrapper: Record<string, unknown> = {
        class: fieldClasses
      }
      if (useGroup && props.label) {
        fieldWrapper['aria-labelledby'] = labelId
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
        [
          h('div', fieldWrapper, [
            fieldChildren.length > 0
              ? h(FormItemControlHost, { control: controlContext }, { default: () => fieldChildren })
              : null,
            ...defaultSlot.slice(1)
          ]),
          props.extra ? h('p', { class: schemaFormExtraClasses }, props.extra) : null,
          errorElement
        ]
      )

      return h(
        'div',
        { class: formItemClasses.value, 'data-tiger-field': props.name || undefined },
        [labelElement, contentElement]
      )
    }
  }
})

export default FormItem
