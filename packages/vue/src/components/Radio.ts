import {
  defineComponent,
  computed,
  h,
  PropType,
  inject,
  ref,
  getCurrentInstance,
  type ComputedRef
} from 'vue'
import {
  classNames,
  coerceClassValue,
  getRadioDotClasses,
  getRadioLabelClasses,
  getRadioColorClasses,
  getRadioVisualClasses,
  type RadioSize
} from '@tigercat/core'

import { RadioGroupKey, type RadioGroupContext } from './RadioGroup'

export interface VueRadioProps {
  value: string | number
  size?: RadioSize
  disabled?: boolean
  name?: string
  checked?: boolean
  defaultChecked?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Radio = defineComponent({
  name: 'TigerRadio',
  inheritAttrs: false,
  props: {
    /**
     * Radio value (required for radio groups)
     */
    value: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    /**
     * Radio size
     * @default 'md'
     */
    size: {
      type: String as PropType<RadioSize>
    },
    /**
     * Whether the radio is disabled
     * @default false
     */
    disabled: {
      type: Boolean
    },
    /**
     * Input name attribute
     */
    name: {
      type: String
    },
    /**
     * Whether the radio is checked (controlled mode)
     */
    checked: {
      type: Boolean
    },

    /**
     * Default checked state (uncontrolled mode)
     * @default false
     */
    defaultChecked: {
      type: Boolean,
      default: false
    },

    /**
     * Additional CSS classes (applied to root element)
     */
    className: {
      type: String
    },

    /**
     * Inline styles (applied to root element)
     */
    style: {
      type: Object as PropType<Record<string, string | number>>
    }
  },
  emits: {
    /**
     * Emitted when radio value changes
     */
    change: (value: string | number) => typeof value === 'string' || typeof value === 'number',
    /**
     * Emitted when checked state changes (for v-model:checked)
     */
    'update:checked': (value: boolean) => typeof value === 'boolean'
  },
  setup(props, { slots, emit, attrs }) {
    const instance = getCurrentInstance()

    const groupContextRef = inject<ComputedRef<RadioGroupContext> | null>(RadioGroupKey, null)

    const groupContext = computed(() => groupContextRef?.value)

    const internalChecked = ref(props.defaultChecked)

    const isCheckedControlled = computed(() => {
      const rawProps = instance?.vnode.props as Record<string, unknown> | null | undefined
      return !!rawProps && Object.prototype.hasOwnProperty.call(rawProps, 'checked')
    })
    const isInGroup = computed(() => !!groupContext.value)

    const actualSize = computed<RadioSize>(() => props.size || groupContext.value?.size || 'md')
    const actualDisabled = computed(() => {
      if (props.disabled !== undefined) return props.disabled
      return groupContext.value?.disabled || false
    })
    const actualName = computed(() => props.name || groupContext.value?.name)

    const isChecked = computed(() => {
      if (isCheckedControlled.value) return props.checked
      if (isInGroup.value) return groupContext.value?.value === props.value
      return internalChecked.value
    })

    const colors = getRadioColorClasses()

    const radioClasses = computed(() => {
      return getRadioVisualClasses({
        size: actualSize.value,
        checked: !!isChecked.value,
        disabled: actualDisabled.value,
        colors
      })
    })

    const dotClasses = computed(() => {
      return getRadioDotClasses({
        size: actualSize.value,
        checked: !!isChecked.value,
        colors
      })
    })

    const labelClasses = computed(() => {
      return getRadioLabelClasses({
        size: actualSize.value,
        disabled: actualDisabled.value,
        colors
      })
    })

    const handleChange = (event: Event) => {
      if (actualDisabled.value) {
        event.preventDefault()
        return
      }

      const target = event.target as HTMLInputElement
      const newChecked = target.checked

      if (!isCheckedControlled.value && !isInGroup.value && newChecked) {
        internalChecked.value = true
      }

      emit('update:checked', newChecked)
      emit('change', props.value)

      // Notify group if part of a group
      if (newChecked && groupContext.value) groupContext.value.onChange(props.value)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (actualDisabled.value) return
      if (event.key !== 'Enter') return
      event.preventDefault()

      const input = event.currentTarget as HTMLInputElement
      if (!input.checked) input.click()
    }

    return () => {
      const rootStyle = [attrs.style, props.style]
      const rootClass = classNames(
        'inline-flex items-center',
        props.className,
        coerceClassValue(attrs.class)
      )

      const { class: _class, style: _style, ...restAttrs } = attrs

      return h(
        'label',
        {
          class: rootClass,
          style: rootStyle
        },
        [
          // Hidden native radio input
          h('input', {
            ...restAttrs,
            type: 'radio',
            class: 'sr-only peer',
            name: actualName.value,
            value: props.value,
            checked: isChecked.value,
            disabled: actualDisabled.value,
            onChange: handleChange,
            onKeydown: handleKeyDown
          }),
          // Custom radio visual
          h(
            'span',
            {
              class: radioClasses.value,
              'aria-hidden': 'true'
            },
            [
              h('span', {
                class: dotClasses.value
              })
            ]
          ),
          // Label content
          slots.default && h('span', { class: labelClasses.value }, slots.default())
        ]
      )
    }
  }
})

export default Radio
