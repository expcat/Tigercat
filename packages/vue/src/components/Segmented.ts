import { defineComponent, h, type PropType } from 'vue'
import type { SegmentedSize, SegmentedOption } from '@expcat/tigercat-core'
import {
  getSegmentedContainerClasses,
  getSegmentedContainerStyle,
  getSegmentedIndicatorClasses,
  getSegmentedIndicatorStyle,
  getSegmentedOptionClasses,
  classNames,
  coerceClassValue,
  mergeStyleValues
} from '@expcat/tigercat-core'

export type VueSegmentedProps = InstanceType<typeof Segmented>['$props']

export const Segmented = defineComponent({
  name: 'TigerSegmented',
  inheritAttrs: false,
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
    block: { type: Boolean, default: false },
    className: { type: String, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    function handleSelect(option: SegmentedOption) {
      if (option.disabled || props.disabled) return
      if (option.value === props.modelValue) return
      emit('update:modelValue', option.value)
      emit('change', option.value)
    }

    function focusOption(container: HTMLElement | null, index: number) {
      const els = container?.querySelectorAll<HTMLElement>('[role="radio"]')
      els?.[index]?.focus()
    }

    function handleKeydown(e: KeyboardEvent, index: number) {
      if (props.disabled) return
      const enabledIdxs = props.options.reduce<number[]>((acc, opt, i) => {
        if (!opt.disabled) acc.push(i)
        return acc
      }, [])
      if (enabledIdxs.length === 0) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSelect(props.options[index])
        return
      }

      const pos = enabledIdxs.indexOf(index)
      let target: number | null = null
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          target = enabledIdxs[(pos + 1 + enabledIdxs.length) % enabledIdxs.length]
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          target = enabledIdxs[(pos - 1 + enabledIdxs.length) % enabledIdxs.length]
          break
        case 'Home':
          target = enabledIdxs[0]
          break
        case 'End':
          target = enabledIdxs[enabledIdxs.length - 1]
          break
        default:
          return
      }
      if (target == null) return
      e.preventDefault()
      const container = (e.currentTarget as HTMLElement).closest<HTMLElement>('[role="radiogroup"]')
      focusOption(container, target)
      handleSelect(props.options[target])
    }

    return () => {
      const selectedIndex = props.options.findIndex((opt) => opt.value === props.modelValue)
      const firstEnabledIndex = props.options.findIndex((opt) => !opt.disabled)
      const rovingIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex

      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            getSegmentedContainerClasses(props.size, props.block),
            props.className,
            coerceClassValue((attrs as Record<string, unknown>).class)
          ),
          style: mergeStyleValues(
            (attrs as Record<string, unknown>).style,
            getSegmentedContainerStyle(props.options.length)
          ),
          role: 'radiogroup',
          'aria-disabled': props.disabled || undefined
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
          ...props.options.map((opt, index) => {
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
                tabindex: isDisabled ? -1 : index === rovingIndex ? 0 : -1,
                onClick: () => handleSelect(opt),
                onKeydown: (e: KeyboardEvent) => handleKeydown(e, index)
              },
              [h('span', null, opt.label)]
            )
          })
        ]
      )
    }
  }
})

export default Segmented
