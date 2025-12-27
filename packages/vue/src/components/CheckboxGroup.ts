import { defineComponent, computed, provide, ref, type PropType } from 'vue'
import { type CheckboxSize } from '@tigercat/core'

export const CheckboxGroupKey = Symbol('CheckboxGroup')

export interface CheckboxGroupContext {
  value: (string | number | boolean)[]
  disabled: boolean
  size: CheckboxSize
  updateValue: (val: string | number | boolean, checked: boolean) => void
}

export const CheckboxGroup = defineComponent({
  name: 'TigerCheckboxGroup',
  props: {
    /**
     * Selected values (v-model)
     */
    modelValue: {
      type: Array as PropType<(string | number | boolean)[]>,
      default: undefined,
    },
    /**
     * Default selected values (uncontrolled mode)
     */
    defaultValue: {
      type: Array as PropType<(string | number | boolean)[]>,
      default: () => [],
    },
    /**
     * Whether all checkboxes are disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Checkbox size for all checkboxes
     */
    size: {
      type: String as PropType<CheckboxSize>,
      default: 'md',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { slots, emit }) {
    // Internal state for uncontrolled mode
    const internalValue = ref<(string | number | boolean)[]>(props.defaultValue)
    
    // Determine if controlled or uncontrolled
    const isControlled = computed(() => props.modelValue !== undefined)
    
    // Current selected values
    const value = computed(() => {
      return isControlled.value ? props.modelValue! : internalValue.value
    })
    
    const updateValue = (val: string | number | boolean, checked: boolean) => {
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
    provide(CheckboxGroupKey, computed(() => ({
      value: value.value,
      disabled: props.disabled,
      size: props.size,
      updateValue,
    })))
    
    return () => {
      return slots.default?.()
    }
  },
})

export default CheckboxGroup
