import { computed, defineComponent, h, nextTick, ref, type PropType } from 'vue'
import type { ComponentPublicInstance, VNodeRef } from 'vue'
import type {
  ComponentSize,
  ColorSwatchGroup,
  ColorSwatchNormalizedOption,
  ColorSwatchOptionInput
} from '@expcat/tigercat-core'
import {
  classNames,
  coerceClassValue,
  colorSwatchBaseClasses,
  colorSwatchGridClasses,
  colorSwatchGroupClasses,
  colorSwatchGroupLabelClasses,
  flattenColorSwatchGroups,
  getColorSwatchButtonClasses,
  getColorSwatchCheckClasses,
  getNextColorSwatchIndex,
  isColorSwatchSelected,
  normalizeColorSwatchGroups
} from '@expcat/tigercat-core'

export type VueColorSwatchProps = InstanceType<typeof ColorSwatch>['$props']

const checkPathD = 'M5 10.5 8 13.5 15 6.5'

export const ColorSwatch = defineComponent({
  name: 'TigerColorSwatch',
  props: {
    modelValue: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    colors: { type: Array as PropType<ColorSwatchOptionInput[]>, default: undefined },
    groups: { type: Array as PropType<ColorSwatchGroup[]>, default: undefined },
    columns: { type: Number, default: 6 },
    ariaLabel: { type: String, default: 'Color swatches' }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit }) {
    const focusIndex = ref(-1)
    const optionRefs = ref<HTMLElement[]>([])

    const normalizedGroups = computed(() => normalizeColorSwatchGroups(props.groups, props.colors))
    const options = computed(() => flattenColorSwatchGroups(normalizedGroups.value))
    const selectedIndex = computed(() =>
      options.value.findIndex((option) => isColorSwatchSelected(option.value, props.modelValue))
    )
    const firstEnabledIndex = computed(() => options.value.findIndex((option) => !option.disabled))
    const activeIndex = computed(() =>
      selectedIndex.value >= 0 ? selectedIndex.value : firstEnabledIndex.value
    )

    function handleSelect(option: ColorSwatchNormalizedOption) {
      if (props.disabled || option.disabled) return
      emit('update:modelValue', option.value)
      emit('change', option.value, option)
    }

    function handleKeydown(optionIndex: number, event: KeyboardEvent) {
      if (props.disabled) return

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const option = options.value[optionIndex]
        if (option) handleSelect(option)
        return
      }

      const nextIndex = getNextColorSwatchIndex(
        options.value,
        optionIndex,
        event.key,
        props.columns
      )
      if (nextIndex === -1 || nextIndex === optionIndex) return

      event.preventDefault()
      focusIndex.value = nextIndex
      nextTick(() => optionRefs.value[nextIndex]?.focus())
    }

    return () => {
      let flatIndex = 0
      optionRefs.value = []

      return h(
        'div',
        {
          class: classNames(colorSwatchBaseClasses, coerceClassValue(attrs.class)),
          role: 'radiogroup',
          'aria-label': props.ariaLabel,
          'aria-disabled': props.disabled || undefined
        },
        normalizedGroups.value.map((group, groupIndex) =>
          h(
            'div',
            { key: `${groupIndex}-${group.label ?? 'group'}`, class: colorSwatchGroupClasses },
            [
              group.label ? h('div', { class: colorSwatchGroupLabelClasses }, group.label) : null,
              h(
                'div',
                {
                  class: colorSwatchGridClasses,
                  style: { gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))` }
                },
                group.colors.map((option) => {
                  const optionIndex = flatIndex
                  flatIndex += 1
                  const selected = isColorSwatchSelected(option.value, props.modelValue)
                  const optionDisabled = props.disabled || !!option.disabled
                  const tabIndex =
                    !optionDisabled &&
                    optionIndex === (focusIndex.value >= 0 ? focusIndex.value : activeIndex.value)
                      ? 0
                      : -1

                  return h(
                    'button',
                    {
                      key: `${option.groupIndex}-${option.index}-${option.value}`,
                      ref: ((el: Element | ComponentPublicInstance | null) => {
                        if (el instanceof HTMLElement) optionRefs.value[optionIndex] = el
                      }) as VNodeRef,
                      type: 'button',
                      class: getColorSwatchButtonClasses(props.size, selected, optionDisabled),
                      style: { backgroundColor: option.value },
                      role: 'radio',
                      'aria-checked': selected,
                      'aria-label': option.label,
                      'aria-disabled': optionDisabled || undefined,
                      tabindex: tabIndex,
                      onFocus: () => {
                        focusIndex.value = optionIndex
                      },
                      onClick: () => handleSelect(option),
                      onKeydown: (event: KeyboardEvent) => handleKeydown(optionIndex, event)
                    },
                    selected
                      ? h(
                          'span',
                          { class: getColorSwatchCheckClasses(props.size), 'aria-hidden': 'true' },
                          [
                            h(
                              'svg',
                              {
                                viewBox: '0 0 20 20',
                                fill: 'none',
                                stroke: 'currentColor',
                                strokeWidth: '2.5',
                                class: 'h-full w-full'
                              },
                              [
                                h('path', {
                                  d: checkPathD,
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round'
                                })
                              ]
                            )
                          ]
                        )
                      : undefined
                  )
                })
              )
            ]
          )
        )
      )
    }
  }
})

export default ColorSwatch
