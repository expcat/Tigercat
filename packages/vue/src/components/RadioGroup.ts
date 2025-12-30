import { defineComponent, ref, provide, computed, h, PropType, watch } from 'vue'
import { type RadioSize } from '@tigercat/core'

export const RadioGroup = defineComponent({
  name: 'TigerRadioGroup',
  props: {
    /**
     * Selected value (for v-model:value)
     */
    value: {
      type: [String, Number] as PropType<string | number | undefined>,
    },
    /**
     * Default selected value (uncontrolled mode)
     */
    defaultValue: {
      type: [String, Number] as PropType<string | number | undefined>,
    },
    /**
     * Input name attribute for all radios
     */
    name: {
      type: String,
    },
    /**
     * Whether all radios are disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Radio size for all radios
     * @default 'md'
     */
    size: {
      type: String as PropType<RadioSize>,
      default: 'md' as RadioSize,
    },
  },
  emits: {
    /**
     * Emitted when value changes (for v-model:value)
     */
    'update:value': (value: string | number) => 
      typeof value === 'string' || typeof value === 'number',
    /**
     * Emitted when value changes
     */
    change: (value: string | number) => 
      typeof value === 'string' || typeof value === 'number',
  },
  setup(props, { slots, emit }) {
    // Internal state for uncontrolled mode
    const internalValue = ref<string | number | undefined>(props.defaultValue)

    // Determine if controlled or uncontrolled
    const isControlled = computed(() => props.value !== undefined)
    
    // Current value - use prop value if controlled, otherwise use internal state
    const currentValue = computed(() => {
      return isControlled.value ? props.value : internalValue.value
    })

    // Watch for changes to defaultValue in uncontrolled mode
    watch(() => props.defaultValue, (newVal) => {
      if (!isControlled.value) {
        internalValue.value = newVal
      }
    })

    const handleChange = (value: string | number) => {
      if (props.disabled) return

      // Update internal state if uncontrolled
      if (!isControlled.value) {
        internalValue.value = value
      }

      // Emit events
      emit('update:value', value)
      emit('change', value)
    }

    // Generate unique name if not provided
    const groupName = computed(() => {
      return props.name || `tiger-radio-group-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    })

    // Provide context to child Radio components
    provide('radioGroupValue', currentValue)
    provide('radioGroupName', groupName.value)
    provide('radioGroupDisabled', props.disabled)
    provide('radioGroupSize', props.size)
    provide('radioGroupOnChange', handleChange)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (props.disabled) return

      const target = event.target as HTMLElement
      const label = target.closest('label')
      if (!label) return

      const container = event.currentTarget as HTMLElement
      const labels = Array.from(container.querySelectorAll('label'))
      const currentIndex = labels.indexOf(label)

      let nextIndex: number | null = null

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault()
          nextIndex = (currentIndex + 1) % labels.length
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault()
          nextIndex = (currentIndex - 1 + labels.length) % labels.length
          break
        default:
          return
      }

      if (nextIndex !== null) {
        const nextLabel = labels[nextIndex] as HTMLElement
        const nextInput = nextLabel.querySelector('input[type="radio"]') as HTMLInputElement
        if (nextInput && !nextInput.disabled) {
          nextLabel.focus()
          nextInput.click()
        }
      }
    }

    return () => {
      return h(
        'div',
        {
          class: 'space-y-2',
          role: 'radiogroup',
          onKeydown: handleKeyDown,
        },
        slots.default?.()
      )
    }
  },
})

export default RadioGroup
