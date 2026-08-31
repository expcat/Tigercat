import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  ref,
  watch,
  type PropType,
  type VNodeRef
} from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type {
  ComponentSize,
  ColorSwatchGroup,
  ColorSwatchNormalizedOption,
  ColorSwatchOptionInput,
  InputStatus,
  TigerLocale,
  TigerLocaleColorPicker
} from '@expcat/tigercat-core'
import {
  classNames,
  COLOR_SWATCH_CHECK_PATH,
  coerceClassValue,
  colorSwatchBaseClasses,
  colorSwatchGridClasses,
  colorSwatchGroupClasses,
  colorSwatchGroupLabelClasses,
  createDefaultColorSwatchGroups,
  flattenColorSwatchGroups,
  getColorPickerLabels,
  getColorSwatchButtonClasses,
  getColorSwatchCheckClasses,
  getColorSwatchCheckTone,
  getElementTextDirection,
  getNextColorSwatchIndex,
  isColorSwatchSelected,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  normalizeColorSwatchGroups
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export type VueColorSwatchProps = InstanceType<typeof ColorSwatch>['$props']
export type ColorSwatchProps = VueColorSwatchProps

export const ColorSwatch = markFormItemGroupControl(
  defineComponent({
    name: 'TigerColorSwatch',
    inheritAttrs: false,
    props: {
      modelValue: { type: String, default: undefined },
      defaultValue: { type: String, default: undefined },
      disabled: { type: Boolean, default: false },
      size: { type: String as PropType<ComponentSize>, default: 'md' },
      colors: { type: Array as PropType<ColorSwatchOptionInput[]>, default: undefined },
      groups: { type: Array as PropType<ColorSwatchGroup[]>, default: undefined },
      columns: { type: Number, default: 6 },
      ariaLabel: { type: String, default: undefined },
      locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
      labels: { type: Object as PropType<Partial<TigerLocaleColorPicker>>, default: undefined },
      name: { type: String, default: undefined },
      id: { type: String, default: undefined },
      status: { type: String as PropType<InputStatus>, default: undefined },
      className: { type: String, default: undefined }
    },
    emits: ['update:modelValue', 'change', 'input', 'blur'],
    setup(props, { attrs, emit, expose }) {
      const config = useTigerConfig()
      const formItemControl = inject<VueFormItemControlContext | null>(
        FORM_ITEM_CONTROL_INJECTION_KEY,
        null
      )
      const innerValue = ref(props.defaultValue)
      const focusIndex = ref(-1)
      const optionRefs = ref<HTMLElement[]>([])
      const rootRef = ref<HTMLElement | null>(null)
      const instanceId = `tiger-colorswatch-${Math.random().toString(36).slice(2, 9)}`

      watch(
        () => props.modelValue,
        (value) => {
          if (value !== undefined) innerValue.value = value
        }
      )

      const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
      const labels = computed(() => getColorPickerLabels(mergedLocale.value, props.labels))
      const effectiveDisabled = computed(
        () => props.disabled || (formItemControl?.disabled.value ?? false)
      )
      const status = computed(() => props.status ?? formItemControl?.status.value ?? 'default')
      const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
      const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
      const fallbackGroups = computed(() =>
        createDefaultColorSwatchGroups(labels.value.primaryGroup, labels.value.accentGroup)
      )
      const normalizedGroups = computed(() =>
        normalizeColorSwatchGroups(props.groups, props.colors, fallbackGroups.value)
      )
      const options = computed(() => flattenColorSwatchGroups(normalizedGroups.value))
      const selectedValue = computed(() => {
        if (props.modelValue !== undefined) return props.modelValue
        if (formItemControl?.value.value !== undefined) {
          return formItemControl.value.value as string | undefined
        }
        return innerValue.value
      })
      const selectedIndex = computed(() =>
        options.value.findIndex((option) =>
          isColorSwatchSelected(option.value, selectedValue.value)
        )
      )
      const firstEnabledIndex = computed(() =>
        options.value.findIndex((option) => !option.disabled)
      )
      const activeIndex = computed(() =>
        selectedIndex.value >= 0 ? selectedIndex.value : firstEnabledIndex.value
      )

      function commit(option: ColorSwatchNormalizedOption) {
        if (effectiveDisabled.value || option.disabled) return
        if (props.modelValue === undefined) innerValue.value = option.value
        emit('update:modelValue', option.value)
        emit('input', option.value)
        emit('change', option.value, option)
        formItemControl?.onChange(option.value)
      }

      function handleKeydown(optionIndex: number, event: KeyboardEvent) {
        if (effectiveDisabled.value) return

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          const option = options.value[optionIndex]
          if (option) commit(option)
          return
        }

        const dir = getElementTextDirection(rootRef.value)
        const nextIndex = getNextColorSwatchIndex(
          normalizedGroups.value,
          optionIndex,
          event.key,
          props.columns,
          dir
        )
        if (nextIndex < 0 || nextIndex === optionIndex) return

        event.preventDefault()
        focusIndex.value = nextIndex
        nextTick(() => optionRefs.value[nextIndex]?.focus())
      }

      function handleFocusout(event: FocusEvent) {
        const next = event.relatedTarget as Node | null
        if (rootRef.value && next && rootRef.value.contains(next)) return
        formItemControl?.onBlur()
        emit('blur', event)
      }

      expose({
        focus: () => {
          const index = focusIndex.value >= 0 ? focusIndex.value : activeIndex.value
          ;(optionRefs.value[index] ?? rootRef.value)?.focus()
        }
      })

      return () => {
        let flatIndex = 0
        optionRefs.value = []
        const attrRecord = attrs as Record<string, unknown>
        const labelledby =
          typeof attrRecord['aria-labelledby'] === 'string' &&
          (attrRecord['aria-labelledby'] as string).trim()
            ? (attrRecord['aria-labelledby'] as string)
            : formItemControl?.labelId.value
        const describedBy = mergeAriaDescribedBy(
          typeof attrRecord['aria-describedby'] === 'string'
            ? (attrRecord['aria-describedby'] as string)
            : undefined,
          formItemControl?.describedBy.value
        )
        const groupName =
          typeof attrRecord['aria-label'] === 'string' &&
          (attrRecord['aria-label'] as string).trim()
            ? (attrRecord['aria-label'] as string)
            : (props.ariaLabel ?? labels.value.swatches)

        if (options.value.length === 0) {
          return h('div', {
            ref: rootRef,
            class: classNames(
              colorSwatchBaseClasses,
              props.className,
              coerceClassValue(attrs.class)
            ),
            id: effectiveId.value
          })
        }

        return h(
          'div',
          {
            ref: rootRef,
            class: classNames(
              colorSwatchBaseClasses,
              props.className,
              coerceClassValue(attrs.class)
            ),
            role: 'radiogroup',
            id: effectiveId.value,
            'aria-label': labelledby ? undefined : groupName,
            'aria-labelledby': labelledby,
            'aria-describedby': describedBy,
            'aria-invalid': status.value === 'error' ? true : undefined,
            'aria-disabled': effectiveDisabled.value || undefined,
            'aria-required': formItemControl?.required.value || undefined,
            onFocusout: handleFocusout
          },
          [
            effectiveName.value
              ? h('input', {
                  type: 'hidden',
                  name: effectiveName.value,
                  value: selectedValue.value ?? ''
                })
              : null,
            ...normalizedGroups.value.map((group, groupIndex) => {
              const labelId = group.label ? `${instanceId}-g${groupIndex}` : undefined
              return h(
                'div',
                {
                  key: `${groupIndex}-${group.label ?? 'group'}`,
                  class: colorSwatchGroupClasses,
                  role: group.label ? 'group' : undefined,
                  'aria-labelledby': labelId
                },
                [
                  group.label
                    ? h('div', { id: labelId, class: colorSwatchGroupLabelClasses }, group.label)
                    : null,
                  h(
                    'div',
                    {
                      class: colorSwatchGridClasses,
                      style: { gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))` }
                    },
                    group.colors.map((option) => {
                      const optionIndex = flatIndex
                      flatIndex += 1
                      const selected = isColorSwatchSelected(option.value, selectedValue.value)
                      const optionDisabled = effectiveDisabled.value || !!option.disabled
                      const tabIndex =
                        !optionDisabled &&
                        optionIndex ===
                          (focusIndex.value >= 0 ? focusIndex.value : activeIndex.value)
                          ? 0
                          : -1
                      const tone = getColorSwatchCheckTone(option.value)

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
                          disabled: optionDisabled,
                          tabindex: tabIndex,
                          onFocus: () => {
                            focusIndex.value = optionIndex
                          },
                          onClick: () => commit(option),
                          onKeydown: (event: KeyboardEvent) => handleKeydown(optionIndex, event)
                        },
                        selected
                          ? h(
                              'span',
                              {
                                class: getColorSwatchCheckClasses(props.size, tone),
                                'aria-hidden': 'true'
                              },
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
                                      d: COLOR_SWATCH_CHECK_PATH,
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
            })
          ]
        )
      }
    }
  })
)

export default ColorSwatch
