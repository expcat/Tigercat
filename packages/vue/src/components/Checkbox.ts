import { defineComponent, computed, h, ref, watch, inject, type PropType } from 'vue'
import {
  getCheckboxClasses,
  getCheckboxLabelClasses,
  type CheckboxSize,
} from '@tigercat/core'
import { CheckboxGroupKey, type CheckboxGroupContext } from './CheckboxGroup'

export const Checkbox = defineComponent({
  name: 'TigerCheckbox',
  props: {
    /**
     * Checkbox value in controlled mode (v-model)
     */
    modelValue: {
      type: Boolean,
    },
    /**
     * Checkbox value (for use in checkbox groups)
     */
    value: {
      type: [String, Number, Boolean] as PropType<string | number | boolean>,
    },
    /**
     * Checkbox size
     */
    size: {
      type: String as PropType<CheckboxSize>,
    },
    /**
     * Whether the checkbox is disabled
     */
    disabled: {
      type: Boolean,
    },
    /**
     * Whether the checkbox is in indeterminate state
     * @default false
     */
    indeterminate: {
      type: Boolean,
      default: false,
    },
    /**
     * Default checked state (uncontrolled mode)
     * @default false
     */
    defaultChecked: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    /**
     * Emitted when checked state changes (for v-model)
     */
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    /**
     * Emitted when checked state changes
     */
    change: (value: boolean, event: Event) => 
      typeof value === 'boolean' && event instanceof Event,
  },
  setup(props, { slots, emit }) {
    // Get group context if inside CheckboxGroup
    const groupContextRef = inject<CheckboxGroupContext | null>(CheckboxGroupKey, null)
    
    // Unwrap if it's a computed ref
    const groupContext = computed(() => {
      if (!groupContextRef) return null
      // Check if it's already unwrapped or if it's a ComputedRef
      // Use type assertion to check for value property
      const ctx = groupContextRef as CheckboxGroupContext | { value: CheckboxGroupContext }
      return 'value' in ctx && typeof ctx.value === 'object' && 'updateValue' in ctx.value
        ? ctx.value 
        : (ctx as CheckboxGroupContext)
    })
    
    // Internal state for uncontrolled mode
    const internalChecked = ref(props.defaultChecked)
    
    // Determine if controlled or uncontrolled
    const isControlled = computed(() => props.modelValue !== undefined)
    
    // Determine effective size and disabled state
    const effectiveSize = computed(() => props.size || groupContext.value?.size || 'md')
    const effectiveDisabled = computed(() => {
      if (props.disabled !== undefined) return props.disabled
      return groupContext.value?.disabled || false
    })
    
    // Current checked state
    const checked = computed(() => {
      // If in a group and has a value, check if value is in group's selected values
      if (groupContext.value && props.value !== undefined) {
        return groupContext.value.value.includes(props.value)
      }
      return isControlled.value ? props.modelValue : internalChecked.value
    })
    
    // Watch for indeterminate state changes
    const checkboxRef = ref<HTMLInputElement | null>(null)
    watch(
      () => props.indeterminate,
      (newVal) => {
        if (checkboxRef.value) {
          checkboxRef.value.indeterminate = newVal
        }
      },
      { immediate: true }
    )

    const handleChange = (event: Event) => {
      if (effectiveDisabled.value) return
      
      const target = event.target as HTMLInputElement
      const newValue = target.checked
      
      // If in a group, update group value
      if (groupContext.value && props.value !== undefined) {
        groupContext.value.updateValue(props.value, newValue)
      } else {
        // Update internal state if uncontrolled
        if (!isControlled.value) {
          internalChecked.value = newValue
        }
        
        emit('update:modelValue', newValue)
        emit('change', newValue, event)
      }
    }

    return () => {
      const checkboxClasses = getCheckboxClasses(effectiveSize.value, effectiveDisabled.value)
      
      const checkboxElement = h('input', {
        ref: checkboxRef,
        type: 'checkbox',
        class: checkboxClasses,
        checked: checked.value,
        disabled: effectiveDisabled.value,
        value: props.value,
        onChange: handleChange,
      })
      
      // If there's no label content, return just the checkbox
      if (!slots.default) {
        return checkboxElement
      }
      
      // Return label with checkbox and content
      const labelClasses = getCheckboxLabelClasses(effectiveSize.value, effectiveDisabled.value)
      return h(
        'label',
        { class: labelClasses },
        [
          checkboxElement,
          h('span', { class: 'ml-2' }, slots.default()),
        ]
      )
    }
  },
})

export default Checkbox
