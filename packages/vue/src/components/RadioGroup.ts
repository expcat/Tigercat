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
  coerceChoiceFormValue,
  coerceClassValue,
  collectRadioGroupInputs,
  getChoiceGroupClasses,
  getElementTextDirection,
  getRadioGroupKeyboardNextIndex,
  markFormItemGroupControl,
  resolveFormItemSeed,
  mergeAriaDescribedBy,
  mergeStyleValues,
  type ChoiceGroupDirection,
  type RadioGroupOption,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { Radio } from './Radio'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export const RadioGroupKey = Symbol('RadioGroup')

export interface RadioGroupContext {
  value: string | number | undefined
  name: string
  disabled: boolean
  size: ComponentSize
  invalid: boolean
  describedBy?: string
  /** Option value that owns the single `aria-invalid`. */
  invalidValue?: string | number
  claimInvalid: (value: string | number) => void
  onChange: (value: string | number) => void
}

export interface VueRadioGroupProps {
  modelValue?: string | number
  defaultValue?: string | number
  name?: string
  disabled?: boolean
  size?: ComponentSize
  orientation?: ChoiceGroupDirection
  status?: InputStatus
  options?: RadioGroupOption[]
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
      orientation: {
        type: String as PropType<ChoiceGroupDirection>,
        default: 'vertical' as ChoiceGroupDirection
      },
      status: {
        type: String as PropType<InputStatus>
      },
      options: {
        type: Array as PropType<RadioGroupOption[]>,
        default: undefined
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
      const isControlled = computed(
        () => props.modelValue !== undefined || Boolean(formItemControl?.name.value)
      )
      const currentValue = computed(() => {
        const seeded = resolveFormItemSeed(
          props.modelValue,
          formItemControl?.name.value,
          formItemControl?.value.value,
          coerceChoiceFormValue
        )
        return seeded !== undefined ? seeded : internalValue.value
      })
      const claimedInvalid = ref<string | number | undefined>(props.options?.[0]?.value)
      const claimInvalid = (value: string | number) => {
        if (claimedInvalid.value === undefined) claimedInvalid.value = value
      }
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

      const groupInvalid = computed(
        () => (props.status ?? formItemControl?.status.value ?? 'default') === 'error'
      )

      provide<ComputedRef<RadioGroupContext>>(
        RadioGroupKey,
        computed(() => ({
          value: currentValue.value,
          name: groupName.value,
          disabled: effectiveDisabled.value,
          size: props.size,
          invalid: groupInvalid.value,
          describedBy: formItemControl?.describedBy.value,
          invalidValue: currentValue.value ?? claimedInvalid.value ?? props.options?.[0]?.value,
          claimInvalid,
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

        return h(
          'div',
          {
            ...restAttrs,
            class: getChoiceGroupClasses({
              orientation: props.orientation,
              className: classNames(props.className, coerceClassValue(attrs.class))
            }),
            style: mergeStyleValues(attrs.style, props.style),
            role: 'radiogroup',
            'aria-labelledby': labelledby,
            'aria-describedby': describedBy,
            'aria-disabled': effectiveDisabled.value || undefined,
            onKeydown: handleKeyDown,
            onFocusout: (event: FocusEvent) => {
              const next = event.relatedTarget as Node | null
              const current = event.currentTarget as Node | null
              if (next && current?.contains(next)) return
              formItemControl?.onBlur()
            }
          },
          (() => {
            const slotted = slots.default?.()
            if (slotted && slotted.length > 0) return slotted
            return (props.options ?? []).map((option) =>
              h(Radio, { value: option.value, disabled: option.disabled }, () => option.label)
            )
          })()
        )
      }
    }
  })
)

export default RadioGroup
