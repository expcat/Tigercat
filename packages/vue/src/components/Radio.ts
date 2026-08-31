import {
  defineComponent,
  computed,
  h,
  inject,
  ref,
  watch,
  type ComputedRef,
  type PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  callUnknownEventHandler,
  defaultRadioColors,
  devWarn,
  getRadioDotClasses,
  getRadioLabelClasses,
  getRadioVisualClasses,
  mergeAriaDescribedBy,
  mergeStyleValues,
  radioRootBaseClasses,
  resolveRadioInputName,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { RadioGroupKey, type RadioGroupContext } from './RadioGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export interface VueRadioProps {
  value: string | number
  size?: ComponentSize
  disabled?: boolean
  name?: string
  modelValue?: boolean
  defaultValue?: boolean
  status?: InputStatus
  className?: string
  style?: Record<string, string | number>
}

export const Radio = defineComponent({
  name: 'TigerRadio',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    size: {
      type: String as PropType<ComponentSize>
    },
    disabled: {
      type: Boolean
    },
    name: {
      type: String
    },
    modelValue: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
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
    change: (value: boolean, event: Event) => typeof value === 'boolean' && event instanceof Event,
    'update:modelValue': (value: boolean) => typeof value === 'boolean'
  },
  setup(props, { slots, emit, attrs, expose }) {
    const groupContextRef = inject<ComputedRef<RadioGroupContext> | null>(RadioGroupKey, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const groupContext = computed(() => groupContextRef?.value)
    const isInGroup = computed(() => !!groupContext.value)

    watch(
      () => [isInGroup.value, props.modelValue] as const,
      ([grouped, model]) => {
        if (grouped && model !== undefined) {
          devWarn(
            'Radio.groupChecked',
            'Radio inside RadioGroup follows the group value. Per-item `v-model` is ignored.'
          )
        }
      },
      { immediate: true }
    )

    const internalChecked = ref(props.defaultValue)
    const isCheckedControlled = computed(() => props.modelValue !== undefined)

    const actualSize = computed<ComponentSize>(() => props.size || groupContext.value?.size || 'md')
    const actualDisabled = computed(
      () =>
        Boolean(props.disabled) ||
        Boolean(groupContext.value?.disabled) ||
        Boolean(formItemControl?.disabled.value)
    )
    const actualName = computed(() => resolveRadioInputName(props.name, groupContext.value?.name))
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )

    const isChecked = computed(() => {
      if (isInGroup.value) return groupContext.value?.value === props.value
      return isCheckedControlled.value ? props.modelValue === true : internalChecked.value
    })

    const inputRef = ref<HTMLInputElement | null>(null)
    expose({
      focus: () => inputRef.value?.focus(),
      input: inputRef
    })

    const radioClasses = computed(() =>
      getRadioVisualClasses({
        size: actualSize.value,
        checked: !!isChecked.value,
        disabled: actualDisabled.value,
        colors: defaultRadioColors
      })
    )
    const dotClasses = computed(() =>
      getRadioDotClasses({
        size: actualSize.value,
        checked: !!isChecked.value,
        colors: defaultRadioColors
      })
    )
    const labelClasses = computed(() =>
      getRadioLabelClasses({
        size: actualSize.value,
        disabled: actualDisabled.value,
        colors: defaultRadioColors
      })
    )

    const handleChange = (event: Event) => {
      if (actualDisabled.value) {
        event.preventDefault()
        return
      }
      const target = event.target as HTMLInputElement
      const newChecked = target.checked
      if (!newChecked) return

      if (isInGroup.value) {
        groupContext.value?.onChange(props.value)
        return
      }

      if (!isCheckedControlled.value) internalChecked.value = true
      emit('update:modelValue', true)
      emit('change', true, event)
      formItemControl?.onChange(props.value)
    }

    const handleBlur = (event: FocusEvent) => {
      callUnknownEventHandler(attrs.onBlur, event)
      if (!isInGroup.value) formItemControl?.onBlur()
    }

    return () => {
      const { class: _class, style: _style, onBlur: _onBlur, ...restAttrs } = attrs
      const describedBy = mergeAriaDescribedBy(
        typeof restAttrs['aria-describedby'] === 'string'
          ? (restAttrs['aria-describedby'] as string)
          : undefined,
        isInGroup.value ? undefined : formItemControl?.describedBy.value
      )
      const attrId = typeof restAttrs.id === 'string' ? restAttrs.id : undefined
      const effectiveId = isInGroup.value ? attrId : (attrId ?? formItemControl?.id.value)

      const input = h('input', {
        ...restAttrs,
        ref: inputRef,
        id: effectiveId,
        type: 'radio',
        class: 'sr-only peer',
        name: actualName.value,
        value: props.value,
        checked: isChecked.value,
        disabled: actualDisabled.value,
        'aria-invalid': status.value === 'error' ? true : restAttrs['aria-invalid'],
        'aria-describedby': describedBy,
        onChange: handleChange,
        onBlur: handleBlur
      })
      const visual = h('span', { class: radioClasses.value, 'aria-hidden': 'true' }, [
        h('span', { class: dotClasses.value })
      ])
      const rootClass = classNames(
        radioRootBaseClasses,
        props.className,
        coerceClassValue(attrs.class)
      )
      const rootStyle = mergeStyleValues(attrs.style, props.style)
      const children = slots.default?.()

      if (!children) {
        return h('span', { class: rootClass, style: rootStyle }, [input, visual])
      }

      return h('label', { class: rootClass, style: rootStyle }, [
        input,
        visual,
        h('span', { class: labelClasses.value }, children)
      ])
    }
  }
})

export default Radio
