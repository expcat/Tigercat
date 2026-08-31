import {
  defineComponent,
  ref,
  provide,
  computed,
  h,
  inject,
  useId,
  type ComputedRef,
  type PropType
} from 'vue'
import {
  callUnknownEventHandler,
  classNames,
  coerceClassValue,
  collectRadioGroupInputs,
  getChoiceGroupClasses,
  getElementTextDirection,
  getRadioGroupKeyboardNextIndex,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeStyleValues,
  type ChoiceGroupDirection,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export const RadioGroupKey = Symbol('RadioGroup')

export interface RadioGroupContext {
  value: string | number | undefined
  name: string
  disabled: boolean
  size: ComponentSize
  onChange: (value: string | number) => void
}

export interface VueRadioGroupProps {
  modelValue?: string | number
  defaultValue?: string | number
  name?: string
  disabled?: boolean
  size?: ComponentSize
  direction?: ChoiceGroupDirection
  status?: InputStatus
  className?: string
  style?: Record<string, string | number>
}

export const RadioGroup = markFormItemGroupControl(
  defineComponent({
    name: 'TigerRadioGroup',
    inheritAttrs: false,
    props: {
      modelValue: {
        type: [String, Number] as PropType<string | number | undefined>
      },
      defaultValue: {
        type: [String, Number] as PropType<string | number | undefined>
      },
      name: {
        type: String
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
      'update:modelValue': (value: string | number) =>
        typeof value === 'string' || typeof value === 'number',
      change: (value: string | number) => typeof value === 'string' || typeof value === 'number'
    },
    setup(props, { slots, emit, attrs }) {
      const formItemControl = inject<VueFormItemControlContext | null>(
        FORM_ITEM_CONTROL_INJECTION_KEY,
        null
      )
      const internalValue = ref<string | number | undefined>(props.defaultValue)
      const isControlled = computed(() => props.modelValue !== undefined)
      const currentValue = computed(() =>
        isControlled.value ? props.modelValue : internalValue.value
      )
      const generatedName = `tiger-radio-${useId()}`
      const groupName = computed(() => props.name || generatedName)
      const effectiveDisabled = computed(
        () => props.disabled || (formItemControl?.disabled.value ?? false)
      )

      const handleChange = (value: string | number) => {
        if (effectiveDisabled.value) return
        if (currentValue.value === value) return
        if (!isControlled.value) internalValue.value = value
        emit('update:modelValue', value)
        emit('change', value)
        formItemControl?.onChange(value)
      }

      provide<ComputedRef<RadioGroupContext>>(
        RadioGroupKey,
        computed(() => ({
          value: currentValue.value,
          name: groupName.value,
          disabled: effectiveDisabled.value,
          size: props.size,
          onChange: handleChange
        }))
      )

      const handleKeyDown = (event: KeyboardEvent) => {
        callUnknownEventHandler(attrs.onKeydown, event)
        if (event.defaultPrevented || effectiveDisabled.value) return

        const target = event.target as HTMLElement
        const currentInput = target.closest('input[type="radio"]') as HTMLInputElement | null
        if (!currentInput) return

        const container = event.currentTarget as HTMLElement
        const enabledInputs = collectRadioGroupInputs(container).filter((input) => !input.disabled)
        if (enabledInputs.length === 0) return

        const currentIndex = enabledInputs.indexOf(currentInput)
        if (currentIndex === -1) return

        const rtl = getElementTextDirection(container) === 'rtl'
        const nextIndex = getRadioGroupKeyboardNextIndex(
          event.key,
          currentIndex,
          enabledInputs.length,
          rtl
        )
        if (nextIndex === null) return

        event.preventDefault()
        const nextInput = enabledInputs[nextIndex]
        nextInput.focus()
        nextInput.click()
      }

      return () => {
        const { class: _class, style: _style, onKeydown: _onKeydown, ...restAttrs } = attrs
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
            class: getChoiceGroupClasses({
              direction: props.direction,
              className: classNames(props.className, coerceClassValue(attrs.class))
            }),
            style: mergeStyleValues(attrs.style, props.style),
            role: 'radiogroup',
            'aria-labelledby': labelledby,
            'aria-describedby': describedBy,
            'aria-invalid': status === 'error' ? true : restAttrs['aria-invalid'],
            'aria-disabled': effectiveDisabled.value || undefined,
            onKeydown: handleKeyDown
          },
          slots.default?.()
        )
      }
    }
  })
)

export default RadioGroup
