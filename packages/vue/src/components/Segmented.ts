import { defineComponent, h, type PropType } from 'vue'
import type { SegmentedSize, SegmentedOption } from '@expcat/tigercat-core'
import {
  getSegmentedContainerClasses,
  getSegmentedContainerStyle,
  getSegmentedIndicatorClasses,
  getSegmentedIndicatorStyle,
  getSegmentedOptionClasses,
  classNames,
  coerceClassValue
} from '@expcat/tigercat-core'

export type VueSegmentedProps = InstanceType<typeof Segmented>['$props']

export const Segmented = defineComponent({
  name: 'TigerSegmented',
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    options: {
      type: Array as PropType<SegmentedOption[]>,
      default: () => []
    },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<SegmentedSize>, default: 'md' },
    block: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    function handleSelect(option: SegmentedOption) {
      if (option.disabled || props.disabled) return
      if (option.value === props.modelValue) return
      emit('update:modelValue', option.value)
      emit('change', option.value)
    }

    return () =>
      h(
        'div',
        {
          class: classNames(
            getSegmentedContainerClasses(props.size, props.block),
            coerceClassValue(attrs.class)
          ),
          style: getSegmentedContainerStyle(props.options.length),
          role: 'radiogroup'
        },
        [
          h('div', {
            'data-tiger-segmented-indicator': 'true',
            'aria-hidden': 'true',
            class: getSegmentedIndicatorClasses(props.size),
            style: getSegmentedIndicatorStyle(
              props.options.findIndex((opt) => opt.value === props.modelValue),
              props.options.length,
              props.size
            )
          }),
          ...props.options.map((opt) => {
            const selected = opt.value === props.modelValue
            const isDisabled = !!opt.disabled || props.disabled
            return h(
              'label',
              {
                key: opt.value,
                class: classNames(
                  getSegmentedOptionClasses(props.size, selected, isDisabled),
                  props.block ? 'flex-1 text-center' : ''
                ),
                role: 'radio',
                'aria-checked': selected,
                'aria-disabled': isDisabled,
                onClick: () => handleSelect(opt)
              },
              [h('span', null, opt.label)]
            )
          })
        ]
      )
  }
})

export default Segmented
