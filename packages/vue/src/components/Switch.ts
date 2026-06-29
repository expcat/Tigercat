import { defineComponent, computed, h, PropType } from 'vue'
import {
  type ComponentSize,
  getSwitchClasses,
  getSwitchThumbClasses,
  mergeStyleValues
} from '@expcat/tigercat-core'

export interface VueSwitchProps {
  modelValue?: boolean
  disabled?: boolean
  size?: ComponentSize
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
    modelValue: {
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
      type: String as PropType<ComponentSize>,
      default: 'md' as ComponentSize
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
     * Emitted when checked state changes (for v-model)
     */
    'update:modelValue': (value: boolean) => typeof value === 'boolean',

    /**
     * Emitted when checked state changes
     */
    change: (value: boolean) => typeof value === 'boolean'
  },
  setup(props, { emit, attrs }) {
    const switchClasses = computed(() =>
      getSwitchClasses(props.size, props.modelValue, props.disabled, props.className, attrs.class)
    )

    const thumbClasses = computed(() => getSwitchThumbClasses(props.size, props.modelValue))

    const emitChange = () => {
      if (props.disabled) return
      const newValue = !props.modelValue
      emit('update:modelValue', newValue)
      emit('change', newValue)
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
          'aria-checked': props.modelValue,
          'aria-disabled': props.disabled ? 'true' : undefined,
          class: switchClasses.value,
          style: mergeStyleValues(attrs.style, props.style),
          disabled: props.disabled,
          tabindex: props.disabled ? -1 : attrs.tabindex,
          onClick: emitChange,
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
