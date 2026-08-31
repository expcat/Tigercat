import { defineComponent, h, ref, computed, watch, type PropType } from 'vue'
import type { ComponentSize, SegmentedOption } from '@expcat/tigercat-core'
import {
  getSegmentedContainerClasses,
  getSegmentedContainerStyle,
  getSegmentedIndicatorClasses,
  getSegmentedIndicatorStyle,
  getSegmentedOptionClasses,
  getSegmentedTrackClasses,
  getSegmentedKeyboardTarget,
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getLocaleDirection,
  devWarn,
  icon24ViewBox
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type VueSegmentedProps = InstanceType<typeof Segmented>['$props']

export const Segmented = defineComponent({
  name: 'TigerSegmented',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    defaultValue: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    options: {
      type: Array as PropType<SegmentedOption[]>,
      default: () => []
    },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    block: { type: Boolean, default: false },
    name: { type: String, default: undefined },
    className: { type: String, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const rtl = computed(() => getLocaleDirection(config.value.locale) === 'rtl')
    const isControlled = computed(() => props.modelValue !== undefined)
    const innerValue = ref<string | number | undefined>(props.defaultValue)
    const currentValue = computed(() => (isControlled.value ? props.modelValue : innerValue.value))

    watch(
      () => props.modelValue,
      (next) => {
        if (next !== undefined) innerValue.value = next
      }
    )

    function handleSelect(option: SegmentedOption) {
      if (option.disabled || props.disabled) return
      if (option.value === currentValue.value) return
      if (!isControlled.value) innerValue.value = option.value
      emit('update:modelValue', option.value)
      emit('change', option.value)
    }

    function focusOption(container: HTMLElement | null, index: number) {
      const els = container?.querySelectorAll<HTMLElement>('[role="radio"]')
      els?.[index]?.focus()
    }

    function handleKeydown(e: KeyboardEvent, index: number) {
      if (props.disabled) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSelect(props.options[index])
        return
      }
      const enabledIdxs = props.options.reduce<number[]>((acc, opt, i) => {
        if (!opt.disabled) acc.push(i)
        return acc
      }, [])
      const target = getSegmentedKeyboardTarget(e.key, index, enabledIdxs, rtl.value)
      if (target == null) return
      e.preventDefault()
      const container = (e.currentTarget as HTMLElement).closest<HTMLElement>('[role="radiogroup"]')
      focusOption(container, target)
      handleSelect(props.options[target])
    }

    return () => {
      if (new Set(props.options.map((opt) => opt.value)).size !== props.options.length) {
        devWarn('Segmented.duplicateValue', 'Segmented: option values should be unique.')
      }

      const selectedIndex = props.options.findIndex((opt) => opt.value === currentValue.value)
      const firstEnabledIndex = props.options.findIndex((opt) => !opt.disabled)
      const rovingIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex
      const attrsRecord = attrs as Record<string, unknown>

      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            getSegmentedContainerClasses(props.size, props.block),
            props.className,
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(
            attrsRecord.style,
            getSegmentedContainerStyle(props.options.length)
          ),
          role: 'radiogroup',
          'aria-disabled': props.disabled || undefined
        },
        [
          props.name != null
            ? h('input', { type: 'hidden', name: props.name, value: currentValue.value ?? '' })
            : null,
          h('div', { class: getSegmentedTrackClasses(), 'aria-hidden': 'true' }, [
            h('div', {
              'data-tiger-segmented-indicator': 'true',
              class: getSegmentedIndicatorClasses(props.size),
              style: getSegmentedIndicatorStyle(selectedIndex, props.options.length, props.size)
            })
          ]),
          ...props.options.map((opt, index) => {
            const selected = opt.value === currentValue.value
            const isDisabled = Boolean(opt.disabled) || props.disabled
            return h(
              'button',
              {
                key: `${String(opt.value)}-${index}`,
                type: 'button',
                class: getSegmentedOptionClasses(props.size, selected, isDisabled),
                role: 'radio',
                'aria-checked': selected,
                'aria-disabled': isDisabled || undefined,
                tabindex: isDisabled ? -1 : index === rovingIndex ? 0 : -1,
                onClick: () => handleSelect(opt),
                onKeydown: (e: KeyboardEvent) => handleKeydown(e, index)
              },
              [
                opt.icon
                  ? h(
                      'svg',
                      {
                        viewBox: icon24ViewBox,
                        class: 'h-4 w-4',
                        fill: 'none',
                        stroke: 'currentColor',
                        'aria-hidden': 'true',
                        focusable: 'false'
                      },
                      [h('path', { d: opt.icon })]
                    )
                  : null,
                h('span', null, opt.label)
              ]
            )
          })
        ]
      )
    }
  }
})

export default Segmented
