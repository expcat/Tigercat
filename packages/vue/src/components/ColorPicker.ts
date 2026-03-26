import { defineComponent, h, ref, computed, watch, onBeforeUnmount, type PropType } from 'vue'
import type { ColorPickerSize, ColorFormat } from '@expcat/tigercat-core'
import {
  colorPickerBaseClasses,
  getColorPickerTriggerClasses,
  colorPickerPanelClasses,
  colorPickerInputClasses,
  colorPickerPresetClasses,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  isValidHex,
  classNames,
  coerceClassValue
} from '@expcat/tigercat-core'

export type VueColorPickerProps = InstanceType<typeof ColorPicker>['$props']

export const ColorPicker = defineComponent({
  name: 'TigerColorPicker',
  props: {
    modelValue: { type: String, default: '#2563eb' },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ColorPickerSize>, default: 'md' },
    showAlpha: { type: Boolean, default: false },
    format: { type: String as PropType<ColorFormat>, default: 'hex' },
    presets: { type: Array as PropType<string[]>, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const isOpen = ref(false)
    const containerRef = ref<HTMLElement | null>(null)
    const inputValue = ref(props.modelValue)

    // Derive HSV from modelValue
    const hsv = computed(() => {
      const rgb = hexToRgb(props.modelValue)
      return rgbToHsv(rgb.r, rgb.g, rgb.b)
    })

    watch(
      () => props.modelValue,
      (v) => {
        inputValue.value = v
      }
    )

    function togglePanel() {
      if (props.disabled) return
      isOpen.value = !isOpen.value
    }

    function closePanel() {
      isOpen.value = false
    }

    function handleHueChange(e: Event) {
      const hue = Number((e.target as HTMLInputElement).value)
      const { r, g, b } = hsvToRgb(hue, hsv.value.s, hsv.value.v)
      const hex = rgbToHex(r, g, b)
      emit('update:modelValue', hex)
      emit('change', hex)
    }

    function handleInputChange(e: Event) {
      const val = (e.target as HTMLInputElement).value
      inputValue.value = val
      if (isValidHex(val)) {
        const hex = val.startsWith('#') ? val : `#${val}`
        emit('update:modelValue', hex)
        emit('change', hex)
      }
    }

    function handlePresetClick(color: string) {
      emit('update:modelValue', color)
      emit('change', color)
    }

    // Click outside
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        closePanel()
      }
    }

    watch(isOpen, (val) => {
      if (val) document.addEventListener('click', handleClickOutside)
      else document.removeEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () =>
      h(
        'div',
        {
          ref: containerRef,
          class: classNames(colorPickerBaseClasses, coerceClassValue(attrs.class))
        },
        [
          // Color trigger swatch
          h('div', {
            class: getColorPickerTriggerClasses(props.size, props.disabled),
            style: { backgroundColor: props.modelValue },
            role: 'button',
            'aria-label': 'Pick color',
            tabindex: 0,
            onClick: togglePanel
          }),

          // Panel
          isOpen.value
            ? h('div', { class: colorPickerPanelClasses }, [
                // Hue slider
                h('div', { class: 'mb-2' }, [
                  h(
                    'label',
                    { class: 'block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1' },
                    'Hue'
                  ),
                  h('input', {
                    type: 'range',
                    min: 0,
                    max: 360,
                    value: hsv.value.h,
                    class:
                      'w-full h-2 rounded-full cursor-pointer accent-[var(--tiger-primary,#2563eb)]',
                    'aria-label': 'Hue',
                    onInput: handleHueChange
                  })
                ]),

                // Hex input
                h('div', { class: 'mb-2' }, [
                  h(
                    'label',
                    { class: 'block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1' },
                    'Hex'
                  ),
                  h('input', {
                    type: 'text',
                    class: colorPickerInputClasses,
                    value: inputValue.value,
                    'aria-label': 'Color value',
                    onInput: handleInputChange
                  })
                ]),

                // Preview
                h('div', { class: 'flex items-center gap-2 mb-2' }, [
                  h('div', {
                    class: 'w-8 h-8 rounded border border-[var(--tiger-border,#d1d5db)]',
                    style: { backgroundColor: props.modelValue },
                    'aria-label': 'Color preview'
                  }),
                  h(
                    'span',
                    { class: 'text-xs font-mono text-[var(--tiger-text,#111827)]' },
                    props.modelValue
                  )
                ]),

                // Presets
                props.presets && props.presets.length > 0
                  ? h('div', { class: 'flex flex-wrap gap-1' }, [
                      ...props.presets.map((color) =>
                        h('div', {
                          key: color,
                          class: colorPickerPresetClasses,
                          style: { backgroundColor: color },
                          'aria-label': `Select ${color}`,
                          onClick: () => handlePresetClick(color)
                        })
                      )
                    ])
                  : null
              ])
            : null
        ]
      )
  }
})

export default ColorPicker
