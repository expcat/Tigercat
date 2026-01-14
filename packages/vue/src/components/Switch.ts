import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  type SwitchSize,
  getSwitchClasses,
  getSwitchThumbClasses
} from '@tigercat/core'

export interface VueSwitchProps {
  checked?: boolean
  disabled?: boolean
  size?: SwitchSize
  className?: string
  style?: Record<string, string | number>
}

export const Switch = defineComponent({
  name: 'TigerSwitch',
  inheritAttrs: false,
  props: {
    /**
     * Whether the switch is checked
     * @default false
     */
    checked: {
      type: Boolean,
      default: false
    },

    /**
     * Whether the switch is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },

    /**
     * Switch size
     * @default 'md'
     */
    size: {
      type: String as PropType<SwitchSize>,
      default: 'md' as SwitchSize
    },

    className: {
      type: String
    },

    style: {
      type: Object as PropType<Record<string, string | number>>
    }
  },
  emits: {
    /**
     * Emitted when checked state changes (for v-model:checked)
     */
    'update:checked': (value: boolean) => typeof value === 'boolean',

    /**
     * Emitted when checked state changes
     */
    change: (value: boolean) => typeof value === 'boolean'
  },
  setup(props, { emit, attrs }) {
    const switchClasses = computed(() =>
      classNames(getSwitchClasses(props.size, props.checked, props.disabled), props.className)
    )

    const thumbClasses = computed(() => getSwitchThumbClasses(props.size, props.checked))

    const emitChange = () => {
      if (props.disabled) return
      const newValue = !props.checked
      emit('update:checked', newValue)
      emit('change', newValue)
    }

    const handleClick = () => {
      emitChange()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (props.disabled) return

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        emitChange()
      }
    }

    return () =>
      h(
        'button',
        {
          ...attrs,
          type: 'button',
          role: 'switch',
          'aria-checked': props.checked,
          'aria-disabled': props.disabled ? 'true' : undefined,
          class: [switchClasses.value, attrs.class],
          style: [props.style, attrs.style],
          disabled: props.disabled,
          tabindex: props.disabled ? -1 : attrs.tabindex,
          onClick: handleClick,
          onKeydown: handleKeyDown
        },
        [
          h('span', {
            class: thumbClasses.value,
            'aria-hidden': 'true'
          })
        ]
      )
  }
})

export default Switch
