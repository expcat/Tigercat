import { defineComponent, computed, h, PropType } from 'vue'
import { 
  type SwitchSize,
  getSwitchClasses,
  getSwitchThumbClasses
} from '@tigercat/core'

export const Switch = defineComponent({
  name: 'TigerSwitch',
  props: {
    /**
     * Whether the switch is checked
     * @default false
     */
    checked: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the switch is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Switch size
     * @default 'md'
     */
    size: {
      type: String as PropType<SwitchSize>,
      default: 'md' as SwitchSize,
    },
  },
  emits: {
    /**
     * Emitted when checked state changes (for v-model:checked)
     */
    'update:checked': (value: boolean) => typeof value === 'boolean',
    /**
     * Emitted when checked state changes
     */
    change: (value: boolean) => typeof value === 'boolean',
  },
  setup(props, { emit }) {
    const switchClasses = computed(() => {
      return getSwitchClasses(props.size, props.checked, props.disabled)
    })

    const thumbClasses = computed(() => {
      return getSwitchThumbClasses(props.size, props.checked)
    })

    const handleClick = () => {
      if (!props.disabled) {
        const newValue = !props.checked
        emit('update:checked', newValue)
        emit('change', newValue)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!props.disabled && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault()
        const newValue = !props.checked
        emit('update:checked', newValue)
        emit('change', newValue)
      }
    }

    return () => {
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': props.checked,
          'aria-disabled': props.disabled,
          class: switchClasses.value,
          disabled: props.disabled,
          onClick: handleClick,
          onKeydown: handleKeyDown,
          tabindex: props.disabled ? -1 : 0,
        },
        h('span', {
          class: thumbClasses.value,
          'aria-hidden': 'true',
        })
      )
    }
  },
})

export default Switch
