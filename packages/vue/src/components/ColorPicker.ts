import { defineComponent, h, ref, computed, watch, onBeforeUnmount, type PropType } from 'vue'
import type { ComponentSize, ColorFormat } from '@expcat/tigercat-core'
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
  formatColorString,
  classNames,
  coerceClassValue
} from '@expcat/tigercat-core'

/** Parse a hex or rgb()/rgba() string back to a hex value, or null if unrecognized. */
function parseColorInput(raw: string): string | null {
  const val = raw.trim()
  if (isValidHex(val)) {
    return val.startsWith('#') ? val : `#${val}`
  }
  const rgbMatch = val.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbMatch) {
    return rgbToHex(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]))
  }
  return null
}

export type VueColorPickerProps = InstanceType<typeof ColorPicker>['$props']

export const ColorPicker = defineComponent({
  name: 'TigerColorPicker',
  props: {
    modelValue: { type: String, default: '#2563eb' },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    showAlpha: { type: Boolean, default: false },
    format: { type: String as PropType<ColorFormat>, default: 'hex' },
    presets: { type: Array as PropType<string[]>, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const isOpen = ref(false)
    const alpha = ref(1)
    const containerRef = ref<HTMLElement | null>(null)

    const rgb = computed(() => hexToRgb(props.modelValue))
    // Derive HSV from modelValue
    const hsv = computed(() => rgbToHsv(rgb.value.r, rgb.value.g, rgb.value.b))

    // Value rendered in the panel input / preview, honoring `format` (and `showAlpha`).
    const displayValue = computed(() =>
      formatColorString(
        rgb.value.r,
        rgb.value.g,
        rgb.value.b,
        props.format,
        props.showAlpha ? alpha.value : undefined
      )
    )
    // CSS color usable as a swatch background (includes alpha when enabled).
    const swatchColor = computed(() =>
      props.showAlpha
        ? `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, ${alpha.value})`
        : props.modelValue
    )

    const inputValue = ref(displayValue.value)

    watch(displayValue, (v) => {
      inputValue.value = v
    })

    function togglePanel() {
      if (props.disabled) return
      isOpen.value = !isOpen.value
    }

    function closePanel() {
      isOpen.value = false
    }

    function handleTriggerKeydown(e: KeyboardEvent) {
      if (props.disabled) return
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        isOpen.value = !isOpen.value
      } else if (e.key === 'Escape' && isOpen.value) {
        isOpen.value = false
      }
    }

    function handleAlphaChange(e: Event) {
      alpha.value = Number((e.target as HTMLInputElement).value) / 100
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
      const hex = parseColorInput(val)
      if (hex) {
        emit('update:modelValue', hex)
        emit('change', hex)
      }
    }

    function handlePresetClick(color: string) {
      emit('update:modelValue', color)
      emit('change', color)
    }

    function handlePresetKeydown(e: KeyboardEvent, color: string) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        handlePresetClick(color)
      }
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
            style: { backgroundColor: swatchColor.value },
            role: 'button',
            'aria-label': 'Pick color',
            'aria-haspopup': 'dialog',
            'aria-expanded': isOpen.value,
            'aria-disabled': props.disabled || undefined,
            tabindex: props.disabled ? -1 : 0,
            onClick: togglePanel,
            onKeydown: handleTriggerKeydown
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

                // Alpha slider
                props.showAlpha
                  ? h('div', { class: 'mb-2' }, [
                      h(
                        'label',
                        { class: 'block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1' },
                        'Alpha'
                      ),
                      h('input', {
                        type: 'range',
                        min: 0,
                        max: 100,
                        value: Math.round(alpha.value * 100),
                        class:
                          'w-full h-2 rounded-full cursor-pointer accent-[var(--tiger-primary,#2563eb)]',
                        'aria-label': 'Alpha',
                        onInput: handleAlphaChange
                      })
                    ])
                  : null,

                // Color value input (rendered in the selected format)
                h('div', { class: 'mb-2' }, [
                  h(
                    'label',
                    {
                      class: 'block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1 uppercase'
                    },
                    props.format
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
                    style: { backgroundColor: swatchColor.value },
                    'aria-label': 'Color preview'
                  }),
                  h(
                    'span',
                    { class: 'text-xs font-mono text-[var(--tiger-text,#111827)]' },
                    displayValue.value
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
                          role: 'button',
                          tabindex: 0,
                          'aria-label': `Select ${color}`,
                          onClick: () => handlePresetClick(color),
                          onKeydown: (e: KeyboardEvent) => handlePresetKeydown(e, color)
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
