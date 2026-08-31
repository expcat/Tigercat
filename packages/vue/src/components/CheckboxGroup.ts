import { defineComponent, computed, provide, ref, h, inject, type PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getChoiceGroupClasses,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeStyleValues,
  toggleCheckboxGroupValue,
  type CheckboxGroupValue,
  type ChoiceGroupDirection,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export const CheckboxGroupKey = Symbol('CheckboxGroup')

export interface CheckboxGroupContext {
  value: CheckboxGroupValue
  disabled: boolean
  size: ComponentSize
  updateValue: (val: CheckboxGroupValue[number], checked: boolean) => void
}

export interface VueCheckboxGroupProps {
  modelValue?: CheckboxGroupValue
  defaultValue?: CheckboxGroupValue
  disabled?: boolean
  size?: ComponentSize
  direction?: ChoiceGroupDirection
  status?: InputStatus
  className?: string
  style?: Record<string, string | number>
}

export const CheckboxGroup = markFormItemGroupControl(
  defineComponent({
    name: 'TigerCheckboxGroup',
    inheritAttrs: false,
    props: {
      modelValue: {
        type: Array as PropType<CheckboxGroupValue>
      },
      defaultValue: {
        type: Array as PropType<CheckboxGroupValue>,
        default: () => []
      },
      disabled: {
        type: Boolean,
        default: false
      },
      size: {
        type: String as PropType<ComponentSize>,
        default: 'md' as ComponentSize
      },
      direction: {
        type: String as PropType<ChoiceGroupDirection>,
        default: 'vertical' as ChoiceGroupDirection
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
      'update:modelValue': (value: CheckboxGroupValue) => Array.isArray(value),
      change: (value: CheckboxGroupValue) => Array.isArray(value)
    },
    setup(props, { slots, emit, attrs }) {
      const formItemControl = inject<VueFormItemControlContext | null>(
        FORM_ITEM_CONTROL_INJECTION_KEY,
        null
      )
      const internalValue = ref<CheckboxGroupValue>(props.defaultValue)
      const isControlled = computed(() => props.modelValue !== undefined)
      const value = computed(() =>
        props.modelValue !== undefined ? props.modelValue : internalValue.value
      )
      const effectiveDisabled = computed(
        () => props.disabled || (formItemControl?.disabled.value ?? false)
      )

      const updateValue = (val: CheckboxGroupValue[number], checked: boolean) => {
        if (effectiveDisabled.value) return
        const currentValue = toggleCheckboxGroupValue(value.value, val, checked)
        if (!isControlled.value) internalValue.value = currentValue
        emit('update:modelValue', currentValue)
        emit('change', currentValue)
        formItemControl?.onChange(currentValue)
      }

      provide(
        CheckboxGroupKey,
        computed(() => ({
          value: value.value,
          disabled: effectiveDisabled.value,
          size: props.size,
          updateValue
        }))
      )

      return () => {
        const { class: _class, style: _style, ...restAttrs } = attrs
        const labelledby =
          typeof restAttrs['aria-labelledby'] === 'string' &&
          (restAttrs['aria-labelledby'] as string).trim()
            ? (restAttrs['aria-labelledby'] as string).trim()
            : formItemControl?.labelId.value
        const describedBy = mergeAriaDescribedBy(
          typeof restAttrs['aria-describedby'] === 'string'
            ? (restAttrs['aria-describedby'] as string)
            : undefined,
          formItemControl?.describedBy.value
        )
        const status = props.status ?? formItemControl?.status.value ?? 'default'

        return h(
          'div',
          {
            ...restAttrs,
            role: 'group',
            class: classNames(
              getChoiceGroupClasses({
                direction: props.direction,
                className: classNames(props.className, coerceClassValue(attrs.class))
              })
            ),
            style: mergeStyleValues(attrs.style, props.style),
            'aria-labelledby': labelledby,
            'aria-describedby': describedBy,
            'aria-disabled': effectiveDisabled.value || undefined,
            'aria-invalid': status === 'error' ? true : restAttrs['aria-invalid']
          },
          slots.default?.()
        )
      }
    }
  })
)

export default CheckboxGroup
