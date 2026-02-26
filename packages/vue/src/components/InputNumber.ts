import { defineComponent, computed, ref, watch, h, onMounted, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getInputNumberWrapperClasses,
  getInputNumberStatusClasses,
  getInputNumberFocusRingColor,
  getInputNumberSizeClasses,
  getInputNumberInputClasses,
  getInputNumberStepButtonClasses,
  getInputNumberSideButtonClasses,
  inputNumberControlsRightClasses,
  inputNumberUpIconPathD,
  inputNumberDownIconPathD,
  inputNumberMinusIconPathD,
  inputNumberPlusIconPathD,
  clampValue,
  stepValue,
  formatPrecision,
  isAtMin,
  isAtMax,
  type InputSize,
  type InputStatus
} from '@expcat/tigercat-core'

export interface VueInputNumberProps {
  modelValue?: number | null
  size?: InputSize
  status?: InputStatus
  min?: number
  max?: number
  step?: number
  precision?: number
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  name?: string
  id?: string
  keyboard?: boolean
  controls?: boolean
  controlsPosition?: 'right' | 'both'
  formatter?: (value: number | undefined) => string
  parser?: (displayValue: string) => number
  autoFocus?: boolean
  className?: string
}

export const InputNumber = defineComponent({
  name: 'TigerInputNumber',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Number, null] as PropType<number | null>
    },
    size: {
      type: String as PropType<InputSize>,
      default: 'md'
    },
    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    },
    min: {
      type: Number,
      default: -Infinity
    },
    max: {
      type: Number,
      default: Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    precision: {
      type: Number as PropType<number | undefined>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    placeholder: String,
    name: String,
    id: String,
    keyboard: {
      type: Boolean,
      default: true
    },
    controls: {
      type: Boolean,
      default: true
    },
    controlsPosition: {
      type: String as PropType<'right' | 'both'>,
      default: 'right'
    },
    formatter: {
      type: Function as PropType<(value: number | undefined) => string>
    },
    parser: {
      type: Function as PropType<(displayValue: string) => number>
    },
    autoFocus: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],

  setup(props, { emit, attrs }) {
    const inputRef = ref<HTMLInputElement | null>(null)
    const focused = ref(false)

    // Internal display value
    const displayValue = ref('')

    function toDisplayValue(val: number | null | undefined): string {
      if (val === null || val === undefined) return ''
      if (props.formatter) return props.formatter(val)
      if (props.precision !== undefined) return val.toFixed(props.precision)
      return String(val)
    }

    function parseValue(str: string): number | null {
      if (str === '' || str === '-') return null
      if (props.parser) return props.parser(str)
      const num = Number(str)
      return Number.isNaN(num) ? null : num
    }

    // Sync display value from modelValue
    watch(
      () => props.modelValue,
      (val) => {
        if (!focused.value) {
          displayValue.value = toDisplayValue(val)
        }
      },
      { immediate: true }
    )

    const isControlled = computed(() => props.modelValue !== undefined)

    const internalValue = ref<number | null>(props.modelValue ?? null)

    const currentValue = computed(() =>
      isControlled.value ? (props.modelValue ?? null) : internalValue.value
    )

    function commitValue(val: number | null) {
      let finalVal = val
      if (finalVal !== null) {
        finalVal = clampValue(finalVal, props.min, props.max)
        if (props.precision !== undefined) {
          finalVal = formatPrecision(finalVal, props.precision)
        }
      }

      if (!isControlled.value) {
        internalValue.value = finalVal
      }
      emit('update:modelValue', finalVal)
      emit('change', finalVal)
      displayValue.value = toDisplayValue(finalVal)
    }

    function handleStep(direction: 'up' | 'down') {
      if (props.disabled || props.readonly) return
      const next = stepValue(
        currentValue.value,
        props.step,
        direction,
        props.min,
        props.max,
        props.precision
      )
      commitValue(next)
    }

    function handleInput(e: Event) {
      const target = e.target as HTMLInputElement
      displayValue.value = target.value
    }

    function handleBlur(e: FocusEvent) {
      focused.value = false
      const parsed = parseValue(displayValue.value)
      commitValue(parsed)
      emit('blur', e)
    }

    function handleFocus(e: FocusEvent) {
      focused.value = true
      // Show raw value when focused (remove formatting)
      if (props.formatter && currentValue.value !== null) {
        displayValue.value = String(currentValue.value)
      }
      emit('focus', e)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!props.keyboard || props.disabled || props.readonly) return
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleStep('up')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleStep('down')
      } else if (e.key === 'Enter') {
        const parsed = parseValue(displayValue.value)
        commitValue(parsed)
      }
    }

    const atMin = computed(() => isAtMin(currentValue.value, props.min))
    const atMax = computed(() => isAtMax(currentValue.value, props.max))

    const wrapperClasses = computed(() =>
      classNames(
        getInputNumberWrapperClasses(props.disabled),
        getInputNumberStatusClasses(props.status),
        getInputNumberSizeClasses(props.size),
        focused.value && `ring-2 ${getInputNumberFocusRingColor(props.status)}`,
        coerceClassValue(attrs.class)
      )
    )

    const inputClasses = computed(() =>
      getInputNumberInputClasses(
        props.size,
        props.controls && props.controlsPosition === 'right',
        props.controls && props.controlsPosition === 'both'
      )
    )

    onMounted(() => {
      if (props.autoFocus && inputRef.value) {
        inputRef.value.focus()
      }
    })

    return () => {
      const children: ReturnType<typeof h>[] = []

      // Left-side minus button (both mode)
      if (props.controls && props.controlsPosition === 'both') {
        children.push(
          h(
            'button',
            {
              type: 'button',
              tabindex: -1,
              'aria-label': 'Decrease',
              class: getInputNumberSideButtonClasses('left', props.disabled || atMin.value),
              disabled: props.disabled || atMin.value,
              onMousedown: (e: MouseEvent) => e.preventDefault(),
              onClick: () => handleStep('down')
            },
            [
              h(
                'svg',
                {
                  xmlns: 'http://www.w3.org/2000/svg',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '2',
                  class: 'w-4 h-4'
                },
                [h('path', { d: inputNumberMinusIconPathD })]
              )
            ]
          )
        )
      }

      // Input element
      children.push(
        h('input', {
          ref: inputRef,
          type: 'text',
          inputmode: 'decimal',
          role: 'spinbutton',
          'aria-valuemin': props.min === -Infinity ? undefined : props.min,
          'aria-valuemax': props.max === Infinity ? undefined : props.max,
          'aria-valuenow': currentValue.value ?? undefined,
          class: inputClasses.value,
          value: displayValue.value,
          placeholder: props.placeholder,
          disabled: props.disabled,
          readonly: props.readonly,
          name: props.name,
          id: props.id,
          onInput: handleInput,
          onBlur: handleBlur,
          onFocus: handleFocus,
          onKeydown: handleKeyDown
        })
      )

      // Right-side plus button (both mode)
      if (props.controls && props.controlsPosition === 'both') {
        children.push(
          h(
            'button',
            {
              type: 'button',
              tabindex: -1,
              'aria-label': 'Increase',
              class: getInputNumberSideButtonClasses('right', props.disabled || atMax.value),
              disabled: props.disabled || atMax.value,
              onMousedown: (e: MouseEvent) => e.preventDefault(),
              onClick: () => handleStep('up')
            },
            [
              h(
                'svg',
                {
                  xmlns: 'http://www.w3.org/2000/svg',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '2',
                  class: 'w-4 h-4'
                },
                [h('path', { d: inputNumberPlusIconPathD })]
              )
            ]
          )
        )
      }

      // Right-stacked controls (default right mode)
      if (props.controls && props.controlsPosition === 'right') {
        children.push(
          h('div', { class: inputNumberControlsRightClasses }, [
            h(
              'button',
              {
                type: 'button',
                tabindex: -1,
                'aria-label': 'Increase',
                class: getInputNumberStepButtonClasses('up', props.disabled || atMax.value),
                disabled: props.disabled || atMax.value,
                onMousedown: (e: MouseEvent) => e.preventDefault(),
                onClick: () => handleStep('up')
              },
              [
                h(
                  'svg',
                  {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    fill: 'currentColor',
                    class: 'w-3 h-3'
                  },
                  [h('path', { d: inputNumberUpIconPathD })]
                )
              ]
            ),
            h(
              'button',
              {
                type: 'button',
                tabindex: -1,
                'aria-label': 'Decrease',
                class: getInputNumberStepButtonClasses('down', props.disabled || atMin.value),
                disabled: props.disabled || atMin.value,
                onMousedown: (e: MouseEvent) => e.preventDefault(),
                onClick: () => handleStep('down')
              },
              [
                h(
                  'svg',
                  {
                    xmlns: 'http://www.w3.org/2000/svg',
                    viewBox: '0 0 24 24',
                    fill: 'currentColor',
                    class: 'w-3 h-3'
                  },
                  [h('path', { d: inputNumberDownIconPathD })]
                )
              ]
            )
          ])
        )
      }

      return h(
        'div',
        {
          class: wrapperClasses.value
        },
        children
      )
    }
  }
})

export default InputNumber
