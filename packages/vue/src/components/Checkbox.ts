import {
  defineComponent,
  computed,
  h,
  ref,
  watch,
  inject,
  type PropType,
  type ComputedRef
} from 'vue'
import {
  classNames,
  checkboxCheckPathD,
  checkboxIconSizeClasses,
  checkboxIconViewBox,
  checkboxIndeterminatePathD,
  checkboxGroupIncludes,
  coerceClassValue,
  callUnknownEventHandler,
  devWarn,
  getCheckboxLabelClasses,
  getCheckboxLabelTextClasses,
  getCheckboxVisualClasses,
  mergeAriaDescribedBy,
  mergeStyleValues,
  runShakeAnimation,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { CheckboxGroupKey, type CheckboxGroupContext } from './CheckboxGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export interface VueCheckboxProps {
  modelValue?: boolean
  value?: string | number | boolean
  size?: ComponentSize
  disabled?: boolean
  indeterminate?: boolean
  defaultValue?: boolean
  status?: InputStatus
  className?: string
  style?: Record<string, string | number>
}

export const Checkbox = defineComponent({
  name: 'TigerCheckbox',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    value: {
      type: [String, Number, Boolean] as PropType<string | number | boolean>
    },
    size: {
      type: String as PropType<ComponentSize>
    },
    disabled: {
      type: Boolean
    },
    indeterminate: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: Boolean,
      default: false
    },
    status: {
      type: String as PropType<InputStatus>
    },
    className: {
      type: String
    },
    style: {
      type: Object as PropType<Record<string, string | number>>
    }
  },
  emits: {
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    change: (value: boolean, event: Event) => typeof value === 'boolean' && event instanceof Event
  },
  setup(props, { slots, emit, attrs, expose }) {
    const groupContextRef = inject<ComputedRef<CheckboxGroupContext> | null>(CheckboxGroupKey, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const groupContext = computed(() => groupContextRef?.value)
    const inGroup = computed(() => !!groupContext.value)

    watch(
      () => [inGroup.value, props.value] as const,
      ([grouped, val]) => {
        if (grouped && val === undefined) {
          devWarn(
            'Checkbox.groupValue',
            'Checkbox inside CheckboxGroup must set `value`. Independent `checked` is ignored while grouped.'
          )
        }
      },
      { immediate: true }
    )

    const internalChecked = ref(props.defaultValue)
    const isControlled = computed(() => props.modelValue !== undefined)

    const effectiveSize = computed(() => props.size || groupContext.value?.size || 'md')
    const effectiveDisabled = computed(
      () =>
        Boolean(props.disabled) ||
        Boolean(groupContext.value?.disabled) ||
        Boolean(formItemControl?.disabled.value)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const effectiveId = computed(() => {
      const attrId = attrs.id
      return (typeof attrId === 'string' ? attrId : undefined) ?? formItemControl?.id.value
    })
    const effectiveName = computed(() => {
      const attrName = attrs.name
      return (typeof attrName === 'string' ? attrName : undefined) ?? formItemControl?.name.value
    })

    const checked = computed(() => {
      if (groupContext.value && props.value !== undefined) {
        return checkboxGroupIncludes(groupContext.value.value, props.value)
      }
      return isControlled.value ? props.modelValue === true : internalChecked.value
    })

    const checkboxRef = ref<HTMLInputElement | null>(null)
    const rootRef = ref<HTMLLabelElement | null>(null)

    expose({
      focus: () => checkboxRef.value?.focus(),
      input: checkboxRef
    })

    watch(
      () => [checkboxRef.value, props.indeterminate] as const,
      ([el]) => {
        if (el) el.indeterminate = props.indeterminate
      },
      { immediate: true }
    )

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      ([nextStatus], oldValue) => {
        if (oldValue === undefined) return
        if (nextStatus === 'error') runShakeAnimation(rootRef.value)
      },
      { flush: 'post' }
    )

    const handleChange = (event: Event) => {
      if (effectiveDisabled.value) return
      const target = event.target as HTMLInputElement
      const newValue = target.checked
      if (groupContext.value && props.value !== undefined) {
        groupContext.value.updateValue(props.value, newValue)
        return
      }
      if (!isControlled.value) internalChecked.value = newValue
      emit('update:modelValue', newValue)
      emit('change', newValue, event)
      formItemControl?.onChange(newValue)
    }

    const handleBlur = (event: FocusEvent) => {
      callUnknownEventHandler(attrs.onBlur, event)
      formItemControl?.onBlur()
    }

    return () => {
      const { class: _class, style: _style, onBlur: _onBlur, ...restAttrs } = attrs
      const describedBy = mergeAriaDescribedBy(
        typeof restAttrs['aria-describedby'] === 'string'
          ? (restAttrs['aria-describedby'] as string)
          : undefined,
        formItemControl?.describedBy.value
      )
      const visual = h(
        'span',
        {
          class: getCheckboxVisualClasses({
            size: effectiveSize.value,
            checked: checked.value,
            indeterminate: props.indeterminate,
            disabled: effectiveDisabled.value,
            status: status.value
          }),
          'aria-hidden': 'true'
        },
        checked.value || props.indeterminate
          ? [
              h(
                'svg',
                {
                  class: checkboxIconSizeClasses[effectiveSize.value],
                  viewBox: checkboxIconViewBox,
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '2',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round'
                },
                [
                  h('path', {
                    d: props.indeterminate ? checkboxIndeterminatePathD : checkboxCheckPathD
                  })
                ]
              )
            ]
          : undefined
      )

      const input = h('input', {
        ...restAttrs,
        ref: checkboxRef,
        id: effectiveId.value,
        name: effectiveName.value,
        type: 'checkbox',
        class: 'sr-only peer',
        checked: checked.value,
        disabled: effectiveDisabled.value,
        value: props.value,
        'aria-checked': props.indeterminate ? 'mixed' : checked.value,
        'aria-invalid': status.value === 'error' ? true : restAttrs['aria-invalid'],
        'aria-required': formItemControl?.required.value ? true : restAttrs['aria-required'],
        'aria-describedby': describedBy,
        onChange: handleChange,
        onBlur: handleBlur
      })

      const children = slots.default?.()
      return h(
        'label',
        {
          ref: rootRef,
          class: classNames(
            getCheckboxLabelClasses(effectiveSize.value, effectiveDisabled.value),
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: mergeStyleValues(attrs.style, props.style)
        },
        [
          input,
          visual,
          children
            ? h(
                'span',
                {
                  class: getCheckboxLabelTextClasses(effectiveSize.value, effectiveDisabled.value)
                },
                children
              )
            : null
        ]
      )
    }
  }
})

export default Checkbox
