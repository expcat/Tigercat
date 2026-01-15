import { defineComponent, computed, provide, ref, h, type PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  type CheckboxGroupValue,
  type CheckboxSize
} from '@expcat/tigercat-core'

export const CheckboxGroupKey = Symbol('CheckboxGroup')

export interface CheckboxGroupContext {
  value: CheckboxGroupValue
  disabled: boolean
  size: CheckboxSize
  updateValue: (val: CheckboxGroupValue[number], checked: boolean) => void
}

export interface VueCheckboxGroupProps {
  modelValue?: CheckboxGroupValue
  defaultValue?: CheckboxGroupValue
  disabled?: boolean
  size?: CheckboxSize
  className?: string
  style?: Record<string, string | number>
}

export const CheckboxGroup = defineComponent({
  name: 'TigerCheckboxGroup',
  inheritAttrs: false,
  props: {
    /**
     * Selected values (v-model)
     */
    modelValue: {
      type: Array as PropType<CheckboxGroupValue>
    },
    /**
     * Default selected values (uncontrolled mode)
     * @default []
     */
    defaultValue: {
      type: Array as PropType<CheckboxGroupValue>,
      default: () => []
    },
    /**
     * Whether all checkboxes are disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Checkbox size for all checkboxes
     * @default 'md'
     */
    size: {
      type: String as PropType<CheckboxSize>,
      default: 'md' as CheckboxSize
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String
    },

    /**
     * Inline styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>
    }
  },
  emits: {
    /**
     * Emitted when selected values change (for v-model)
     */
    'update:modelValue': (value: CheckboxGroupValue) => Array.isArray(value),
    /**
     * Emitted when selected values change
     */
    change: (value: CheckboxGroupValue) => Array.isArray(value)
  },
  setup(props, { slots, emit, attrs }) {
    // Internal state for uncontrolled mode
    const internalValue = ref<CheckboxGroupValue>(props.defaultValue)

    // Determine if controlled or uncontrolled
    const isControlled = computed(() => props.modelValue !== undefined)

    // Current selected values
    const value = computed(() => {
      return isControlled.value ? props.modelValue! : internalValue.value
    })

    const updateValue = (val: CheckboxGroupValue[number], checked: boolean) => {
      if (props.disabled) return

      const currentValue = [...value.value]
      const index = currentValue.indexOf(val)

      if (checked && index === -1) {
        currentValue.push(val)
      } else if (!checked && index !== -1) {
        currentValue.splice(index, 1)
      }

      // Update internal state if uncontrolled
      if (!isControlled.value) {
        internalValue.value = currentValue
      }

      emit('update:modelValue', currentValue)
      emit('change', currentValue)
    }

    // Provide context to child checkboxes
    // Make context reactive by using computed
    provide(
      CheckboxGroupKey,
      computed(() => ({
        value: value.value,
        disabled: props.disabled,
        size: props.size,
        updateValue
      }))
    )

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: classNames(props.className, coerceClassValue(attrs.class)),
          style: [attrs.style, props.style]
        },
        slots.default?.()
      )
  }
})

export default CheckboxGroup
