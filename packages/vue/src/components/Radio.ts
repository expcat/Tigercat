import { defineComponent, computed, h, inject, PropType } from 'vue'
import { classNames, getRadioColorClasses, type RadioSize } from '@tigercat/core'

const sizeClasses = {
  sm: {
    radio: 'w-4 h-4',
    dot: 'w-1.5 h-1.5',
    label: 'text-sm',
  },
  md: {
    radio: 'w-5 h-5',
    dot: 'w-2 h-2',
    label: 'text-base',
  },
  lg: {
    radio: 'w-6 h-6',
    dot: 'w-2.5 h-2.5',
    label: 'text-lg',
  },
}

export const Radio = defineComponent({
  name: 'TigerRadio',
  props: {
    value: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    size: {
      type: String as PropType<RadioSize>,
      default: 'md',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: undefined,
    },
    checked: {
      type: Boolean,
      default: undefined,
    },
  },
  emits: ['change', 'update:checked'],
  setup(props, { slots, emit }) {
    // Inject from RadioGroup if available
    const groupValue = inject<{ value: string | number | undefined }>('radioGroupValue', { value: undefined })
    const groupName = inject<string>('radioGroupName', '')
    const groupDisabled = inject<boolean>('radioGroupDisabled', false)
    const groupSize = inject<RadioSize>('radioGroupSize', 'md')
    const groupOnChange = inject<((value: string | number) => void) | undefined>('radioGroupOnChange', undefined)

    // Determine actual values (props override group values)
    const actualSize = computed(() => props.size || groupSize)
    const actualDisabled = computed(() => props.disabled || groupDisabled)
    const actualName = computed(() => props.name || groupName)
    
    const isChecked = computed(() => {
      // If controlled via checked prop
      if (props.checked !== undefined) {
        return props.checked
      }
      // If part of a group
      if (groupValue.value !== undefined) {
        return groupValue.value === props.value
      }
      return false
    })

    const colors = getRadioColorClasses()

    const radioClasses = computed(() => {
      return classNames(
        'relative inline-flex items-center justify-center rounded-full border-2 cursor-pointer transition-all',
        sizeClasses[actualSize.value].radio,
        isChecked.value ? colors.borderChecked : colors.border,
        isChecked.value ? colors.bgChecked : colors.bg,
        actualDisabled.value && colors.disabled,
        actualDisabled.value && 'cursor-not-allowed',
        !actualDisabled.value && 'hover:border-[var(--tiger-primary,#2563eb)]',
      )
    })

    const dotClasses = computed(() => {
      return classNames(
        'rounded-full transition-all',
        sizeClasses[actualSize.value].dot,
        colors.innerDot,
        isChecked.value ? 'scale-100' : 'scale-0',
      )
    })

    const labelClasses = computed(() => {
      return classNames(
        'ml-2 cursor-pointer select-none',
        sizeClasses[actualSize.value].label,
        actualDisabled.value ? colors.textDisabled : 'text-gray-900',
        actualDisabled.value && 'cursor-not-allowed',
      )
    })

    const handleChange = (event: Event) => {
      if (actualDisabled.value) {
        event.preventDefault()
        return
      }

      const target = event.target as HTMLInputElement
      const newChecked = target.checked

      emit('update:checked', newChecked)
      emit('change', props.value)

      // Notify group if part of a group
      if (groupOnChange) {
        groupOnChange(props.value)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (actualDisabled.value) return
      
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        const inputElement = event.currentTarget as HTMLElement
        const input = inputElement.querySelector('input[type="radio"]') as HTMLInputElement
        if (input && !input.checked) {
          input.click()
        }
      }
    }

    return () => {
      return h(
        'label',
        {
          class: 'inline-flex items-center',
          tabindex: actualDisabled.value ? -1 : 0,
          onKeydown: handleKeyDown,
        },
        [
          // Hidden native radio input
          h('input', {
            type: 'radio',
            class: 'sr-only',
            name: actualName.value,
            value: props.value,
            checked: isChecked.value,
            disabled: actualDisabled.value,
            onChange: handleChange,
          }),
          // Custom radio visual
          h(
            'span',
            {
              class: radioClasses.value,
              'aria-hidden': 'true',
            },
            [
              h('span', {
                class: dotClasses.value,
              }),
            ]
          ),
          // Label content
          slots.default && h('span', { class: labelClasses.value }, slots.default()),
        ]
      )
    }
  },
})

export default Radio
