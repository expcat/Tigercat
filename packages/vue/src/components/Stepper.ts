import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import type { ComponentSize } from '@expcat/tigercat-core'
import {
  stepperBaseClasses,
  getStepperInputClasses,
  getStepperButtonClasses,
  minusPathD,
  plusPathD,
  stepperIconViewBox,
  clampStepperValue,
  classNames,
  coerceClassValue,
  createRafRepeatActionController
} from '@expcat/tigercat-core'

export type VueStepperProps = InstanceType<typeof Stepper>['$props']

export const Stepper = defineComponent({
  name: 'TigerStepper',
  props: {
    modelValue: { type: Number },
    defaultValue: { type: Number, default: 0 },
    min: { type: Number, default: -Infinity },
    max: { type: Number, default: Infinity },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    precision: { type: Number, default: undefined },
    incrementAriaLabel: { type: String, default: 'Increase' },
    decrementAriaLabel: { type: String, default: 'Decrease' }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const inner = ref(props.defaultValue ?? 0)
    const currentValue = computed(() =>
      props.modelValue !== undefined ? props.modelValue : inner.value
    )

    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined) {
          inner.value = value
        }
      }
    )

    const repeatController = createRafRepeatActionController()
    let repeatValue = currentValue.value
    let suppressNextClick = false

    onBeforeUnmount(() => repeatController.stop())

    function setValue(v: number): number {
      const clamped = clampStepperValue(v, props.min, props.max, props.precision)
      if (props.modelValue === undefined) {
        inner.value = clamped
      }
      emit('update:modelValue', clamped)
      emit('change', clamped)
      return clamped
    }

    function stepBy(direction: 'up' | 'down', baseValue: number = currentValue.value): number {
      return setValue(direction === 'up' ? baseValue + props.step : baseValue - props.step)
    }

    function decrement() {
      if (suppressNextClick) {
        suppressNextClick = false
        return
      }
      if (props.disabled) return
      stepBy('down')
    }

    function increment() {
      if (suppressNextClick) {
        suppressNextClick = false
        return
      }
      if (props.disabled) return
      stepBy('up')
    }

    function startStepRepeat(direction: 'up' | 'down') {
      return (event: PointerEvent) => {
        event.preventDefault()
        if (props.disabled) return
        if (direction === 'down' && currentValue.value <= props.min) return
        if (direction === 'up' && currentValue.value >= props.max) return

        suppressNextClick = true
        repeatValue = currentValue.value
        repeatController.start(() => {
          const baseValue = repeatValue
          const nextValue = stepBy(direction, baseValue)
          repeatValue = nextValue

          if (nextValue === baseValue) {
            repeatController.stop()
          }
        })
      }
    }

    function stopStepRepeat() {
      repeatController.stop()
    }

    function handleInput(e: Event) {
      const val = Number((e.target as HTMLInputElement).value)
      if (!Number.isNaN(val)) setValue(val)
    }

    const icon = (d: string) =>
      h(
        'svg',
        {
          class: 'w-4 h-4',
          viewBox: stepperIconViewBox,
          fill: 'currentColor'
        },
        [h('path', { d, 'fill-rule': 'evenodd', 'clip-rule': 'evenodd' })]
      )

    return () => {
      const atMin = currentValue.value <= props.min
      const atMax = currentValue.value >= props.max

      return h(
        'div',
        {
          class: classNames(stepperBaseClasses, coerceClassValue(attrs.class)),
          role: 'group',
          'aria-label': 'Stepper'
        },
        [
          h(
            'button',
            {
              type: 'button',
              class: getStepperButtonClasses(props.size, props.disabled || atMin, 'left'),
              disabled: props.disabled || atMin,
              'aria-label': props.decrementAriaLabel,
              onPointerdown: startStepRepeat('down'),
              onPointerup: stopStepRepeat,
              onPointerleave: stopStepRepeat,
              onPointercancel: stopStepRepeat,
              onClick: decrement
            },
            [icon(minusPathD)]
          ),
          h('input', {
            type: 'text',
            class: getStepperInputClasses(props.size),
            value:
              props.precision !== undefined
                ? currentValue.value.toFixed(props.precision)
                : String(currentValue.value),
            disabled: props.disabled,
            'aria-label': 'Value',
            onChange: handleInput
          }),
          h(
            'button',
            {
              type: 'button',
              class: getStepperButtonClasses(props.size, props.disabled || atMax, 'right'),
              disabled: props.disabled || atMax,
              'aria-label': props.incrementAriaLabel,
              onPointerdown: startStepRepeat('up'),
              onPointerup: stopStepRepeat,
              onPointerleave: stopStepRepeat,
              onPointercancel: stopStepRepeat,
              onClick: increment
            },
            [icon(plusPathD)]
          )
        ]
      )
    }
  }
})

export default Stepper
