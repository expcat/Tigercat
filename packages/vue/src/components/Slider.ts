import {
  defineComponent,
  computed,
  ref,
  watch,
  watchEffect,
  onBeforeUnmount,
  h,
  PropType
} from 'vue'
import {
  classNames,
  type SliderSize,
  sliderBaseClasses,
  sliderRangeClasses,
  getSliderTrackClasses,
  getSliderThumbClasses,
  getSliderTooltipClasses
} from '@tigercat/core'

export interface VueSliderProps {
  value?: number | [number, number]
  defaultValue?: number | [number, number]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  marks?: boolean | Record<number, string>
  tooltip?: boolean
  size?: SliderSize
  range?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Slider = defineComponent({
  name: 'TigerSlider',
  props: {
    /**
     * Slider value (for v-model:value) - controlled mode
     */
    value: {
      type: [Number, Array] as PropType<number | [number, number]>
    },
    /**
     * Default slider value - uncontrolled mode
     */
    defaultValue: {
      type: [Number, Array] as PropType<number | [number, number]>
    },
    /**
     * Minimum value
     * @default 0
     */
    min: {
      type: Number,
      default: 0
    },
    /**
     * Maximum value
     * @default 100
     */
    max: {
      type: Number,
      default: 100
    },
    /**
     * Step size for value changes
     * @default 1
     */
    step: {
      type: Number,
      default: 1
    },
    /**
     * Whether the slider is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Marks to display (true for default marks or object with custom marks)
     * @default false
     */
    marks: {
      type: [Boolean, Object] as PropType<boolean | Record<number, string>>,
      default: false
    },
    /**
     * Show value tooltip on thumb
     * @default true
     */
    tooltip: {
      type: Boolean,
      default: true
    },
    /**
     * Slider size
     * @default 'md'
     */
    size: {
      type: String as PropType<SliderSize>,
      default: 'md' as SliderSize
    },
    /**
     * Enable range selection mode
     * @default false
     */
    range: {
      type: Boolean,
      default: false
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: {
    /**
     * Emitted when value changes (for v-model:value)
     */
    'update:value': (value: number | [number, number]) =>
      typeof value === 'number' || Array.isArray(value),
    /**
     * Emitted when value changes
     */
    change: (value: number | [number, number]) => typeof value === 'number' || Array.isArray(value)
  },
  setup(props, { emit, attrs }) {
    // Initialize internal value
    const getInitialValue = (): number | [number, number] => {
      if (props.value !== undefined) return props.value
      if (props.defaultValue !== undefined) return props.defaultValue
      return props.range ? [props.min, props.max] : props.min
    }

    const internalValue = ref<number | [number, number]>(getInitialValue())
    const isDragging = ref(false)
    const activeThumb = ref<'min' | 'max' | null>(null)
    const showTooltip = ref(false)
    const trackElement = ref<HTMLElement | null>(null)

    // Watch for external value changes
    watch(
      () => props.value,
      (newValue) => {
        if (newValue !== undefined) {
          internalValue.value = newValue
        }
      }
    )

    // Normalize value to step
    const normalizeValue = (val: number): number => {
      const steps = Math.round((val - props.min) / props.step)
      return Math.min(Math.max(props.min + steps * props.step, props.min), props.max)
    }

    // Calculate percentage
    const getPercentage = (val: number): number => {
      return ((val - props.min) / (props.max - props.min)) * 100
    }

    // Calculate value from position
    const getValueFromPosition = (clientX: number, trackElement: HTMLElement): number => {
      const rect = trackElement.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = props.min + percentage * (props.max - props.min)
      return normalizeValue(rawValue)
    }

    // Update value
    const updateValue = (newValue: number | [number, number]) => {
      internalValue.value = newValue
      emit('update:value', newValue)
      emit('change', newValue)
    }

    // Handle mouse/touch move
    const handleMove = (event: MouseEvent | TouchEvent, trackElement: HTMLElement) => {
      if (props.disabled || !isDragging.value) return

      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const newValue = getValueFromPosition(clientX, trackElement)

      if (props.range && Array.isArray(internalValue.value)) {
        const [minVal, maxVal] = internalValue.value
        if (activeThumb.value === 'min') {
          updateValue([Math.min(newValue, maxVal), maxVal])
        } else if (activeThumb.value === 'max') {
          updateValue([minVal, Math.max(newValue, minVal)])
        }
      } else {
        updateValue(newValue)
      }
    }

    // Handle mouse/touch start
    const handleStart = (event: MouseEvent | TouchEvent, thumb: 'min' | 'max' | null) => {
      if (props.disabled) return

      event.preventDefault()
      isDragging.value = true
      activeThumb.value = thumb
      showTooltip.value = props.tooltip
    }

    // Handle mouse/touch end
    const handleEnd = () => {
      isDragging.value = false
      activeThumb.value = null
      showTooltip.value = false
    }

    // Computed styles
    const trackStyles = computed(() => {
      return getSliderTrackClasses(props.size, props.disabled)
    })

    const rangeStyles = computed(() => {
      if (props.range && Array.isArray(internalValue.value)) {
        const [minVal, maxVal] = internalValue.value
        const left = getPercentage(minVal)
        const width = getPercentage(maxVal) - left
        return {
          left: `${left}%`,
          width: `${width}%`
        }
      } else {
        const val =
          typeof internalValue.value === 'number' ? internalValue.value : internalValue.value[0]
        return {
          left: '0%',
          width: `${getPercentage(val)}%`
        }
      }
    })

    const thumbClasses_computed = computed(() => {
      return getSliderThumbClasses(props.size, props.disabled)
    })

    const tooltipClasses_computed = computed(() => {
      return getSliderTooltipClasses(props.size)
    })

    // Event handlers for dragging
    const handleTrackMouseMove = (e: MouseEvent) => {
      if (trackElement.value) handleMove(e, trackElement.value)
    }

    const handleTrackTouchMove = (e: TouchEvent) => {
      if (trackElement.value) handleMove(e, trackElement.value)
    }

    // Setup event listeners based on dragging state
    watchEffect((onCleanup) => {
      if (isDragging.value) {
        document.addEventListener('mousemove', handleTrackMouseMove)
        document.addEventListener('mouseup', handleEnd)
        document.addEventListener('touchmove', handleTrackTouchMove)
        document.addEventListener('touchend', handleEnd)

        onCleanup(() => {
          document.removeEventListener('mousemove', handleTrackMouseMove)
          document.removeEventListener('mouseup', handleEnd)
          document.removeEventListener('touchmove', handleTrackTouchMove)
          document.removeEventListener('touchend', handleEnd)
        })
      }
    })

    // Cleanup on component unmount
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', handleTrackMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTrackTouchMove)
      document.removeEventListener('touchend', handleEnd)
    })

    return () => {
      const ariaLabel = (attrs as Record<string, unknown>)['aria-label']
      const ariaLabelledby = (attrs as Record<string, unknown>)['aria-labelledby']
      const ariaDescribedby = (attrs as Record<string, unknown>)['aria-describedby']

      const attrsWithoutClassStyle: Record<string, unknown> = { ...attrs }
      const attrsClass = (attrsWithoutClassStyle as { class?: unknown }).class
      const attrsStyle = (attrsWithoutClassStyle as { style?: unknown }).style

      delete (attrsWithoutClassStyle as { class?: unknown }).class
      delete (attrsWithoutClassStyle as { style?: unknown }).style

      // Create thumbs
      const createThumb = (value: number, thumbType: 'min' | 'max' | null = null) => {
        const left = getPercentage(value)
        const showThumbTooltip =
          showTooltip.value && (thumbType === activeThumb.value || thumbType === null)

        let resolvedAriaLabel: unknown = ariaLabel
        if (props.range) {
          if (typeof ariaLabel === 'string') {
            if (thumbType === 'min') resolvedAriaLabel = `${ariaLabel} (min)`
            if (thumbType === 'max') resolvedAriaLabel = `${ariaLabel} (max)`
          } else if (!ariaLabel && !ariaLabelledby) {
            if (thumbType === 'min') resolvedAriaLabel = 'Minimum value'
            if (thumbType === 'max') resolvedAriaLabel = 'Maximum value'
          }
        }

        return h(
          'div',
          {
            class: thumbClasses_computed.value,
            style: { left: `${left}%` },
            tabindex: props.disabled ? -1 : 0,
            role: 'slider',
            'aria-valuenow': value,
            'aria-valuemin': props.min,
            'aria-valuemax': props.max,
            'aria-orientation': 'horizontal',
            'aria-disabled': props.disabled,
            'aria-label': resolvedAriaLabel,
            'aria-labelledby': ariaLabelledby,
            'aria-describedby': ariaDescribedby,
            onMousedown: (e: MouseEvent) => handleStart(e, thumbType),
            onTouchstart: (e: TouchEvent) => handleStart(e, thumbType),
            onMouseenter: () => {
              if (props.tooltip) showTooltip.value = true
            },
            onMouseleave: () => {
              if (!isDragging.value) showTooltip.value = false
            },
            onKeydown: (e: KeyboardEvent) => {
              if (props.disabled) return
              let newValue = value

              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault()
                newValue = normalizeValue(value + props.step)
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault()
                newValue = normalizeValue(value - props.step)
              } else if (e.key === 'Home') {
                e.preventDefault()
                newValue = props.min
              } else if (e.key === 'End') {
                e.preventDefault()
                newValue = props.max
              } else {
                return
              }

              if (props.range && Array.isArray(internalValue.value)) {
                const [minVal, maxVal] = internalValue.value
                if (thumbType === 'min') {
                  updateValue([Math.min(newValue, maxVal), maxVal])
                } else if (thumbType === 'max') {
                  updateValue([minVal, Math.max(newValue, minVal)])
                }
              } else {
                updateValue(newValue)
              }
            }
          },
          showThumbTooltip && props.tooltip
            ? h('div', { class: tooltipClasses_computed.value }, value.toString())
            : undefined
        )
      }

      // Create marks
      const createMarks = () => {
        if (!props.marks) return null

        const marks = typeof props.marks === 'boolean' ? {} : props.marks

        return h(
          'div',
          { class: 'absolute w-full top-full mt-2' },
          Object.entries(marks).map(([key, label]) => {
            const value = Number(key)
            const left = getPercentage(value)
            return h(
              'div',
              {
                class: 'absolute text-xs text-[var(--tiger-text-muted,#6b7280)]',
                style: { left: `${left}%`, transform: 'translateX(-50%)' }
              },
              label
            )
          })
        )
      }

      return h(
        'div',
        {
          ...attrsWithoutClassStyle,
          class: [
            classNames(sliderBaseClasses, props.disabled && 'cursor-not-allowed', props.className),
            attrsClass
          ],
          style: [props.style, attrsStyle]
        },
        [
          // Track
          h(
            'div',
            {
              ref: trackElement,
              class: trackStyles.value,
              onClick: (e: MouseEvent) => {
                if (props.disabled || !trackElement.value) return
                const newValue = getValueFromPosition(e.clientX, trackElement.value)

                if (props.range && Array.isArray(internalValue.value)) {
                  const [minVal, maxVal] = internalValue.value
                  const distToMin = Math.abs(newValue - minVal)
                  const distToMax = Math.abs(newValue - maxVal)

                  if (distToMin < distToMax) {
                    updateValue([newValue, maxVal])
                  } else {
                    updateValue([minVal, newValue])
                  }
                } else {
                  updateValue(newValue)
                }
              }
            },
            [
              // Range
              h('div', {
                class: sliderRangeClasses,
                style: rangeStyles.value
              }),
              // Thumbs
              props.range && Array.isArray(internalValue.value)
                ? [
                    createThumb(internalValue.value[0], 'min'),
                    createThumb(internalValue.value[1], 'max')
                  ]
                : createThumb(
                    typeof internalValue.value === 'number'
                      ? internalValue.value
                      : internalValue.value[0]
                  )
            ]
          ),
          // Marks
          createMarks()
        ]
      )
    }
  }
})

export default Slider
