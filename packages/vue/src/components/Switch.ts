import { defineComponent, computed, h, ref, watch, PropType } from 'vue'
import {
  type ComponentSize,
  getSwitchClasses,
  getSwitchThumbClasses,
  mergeStyleValues
} from '@expcat/tigercat-core'

export interface VueSwitchProps {
  modelValue?: boolean | null
  defaultValue?: boolean
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
     * Whether the switch is checked (controlled mode)
     */
    modelValue: {
      type: [Boolean, null] as PropType<boolean | null>,
      default: undefined
    },

    /**
     * Default checked state (uncontrolled mode)
     * @default false
     */
    defaultValue: {
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
    const internalChecked = ref(props.defaultValue)
    const isControlled = computed(() => props.modelValue !== undefined)
    const checked = computed(() =>
      isControlled.value ? props.modelValue === true : internalChecked.value
    )

    watch(
      () => props.modelValue,
      (next) => {
        if (next !== undefined) internalChecked.value = next === true
      }
    )

    const switchClasses = computed(() =>
      getSwitchClasses(props.size, checked.value, props.disabled, props.className, attrs.class)
    )

    const thumbClasses = computed(() => getSwitchThumbClasses(props.size, checked.value))

    const emitChange = () => {
      if (props.disabled) return
      const newValue = !checked.value
      if (!isControlled.value) {
        internalChecked.value = newValue
      }
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
          'aria-checked': checked.value,
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
