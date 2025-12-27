import { defineComponent, computed, h, PropType } from 'vue'
import { 
  type SwitchSize,
  getSwitchClasses,
  getSwitchThumbClasses
} from '@tigercat/core'

export const Switch = defineComponent({
  name: 'TigerSwitch',
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as PropType<SwitchSize>,
      default: 'md',
    },
  },
  emits: ['update:checked', 'change'],
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
