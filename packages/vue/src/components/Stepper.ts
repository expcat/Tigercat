import { defineComponent, h, onBeforeUnmount, type PropType } from 'vue'
import type { StepperSize } from '@expcat/tigercat-core'
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
    modelValue: { type: Number, default: 0 },
    min: { type: Number, default: -Infinity },
    max: { type: Number, default: Infinity },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<StepperSize>, default: 'md' },
    precision: { type: Number, default: undefined }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs }) {
    const repeatController = createRafRepeatActionController()
    let repeatValue = props.modelValue
    let suppressNextClick = false

    onBeforeUnmount(() => repeatController.stop())

    function setValue(v: number): number {
      const clamped = clampStepperValue(v, props.min, props.max, props.precision)
      emit('update:modelValue', clamped)
      emit('change', clamped)
      return clamped
    }

    function stepBy(direction: 'up' | 'down', baseValue: number = props.modelValue): number {
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
        if (direction === 'down' && props.modelValue <= props.min) return
        if (direction === 'up' && props.modelValue >= props.max) return

        suppressNextClick = true
        repeatValue = props.modelValue
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
      const atMin = props.modelValue <= props.min
      const atMax = props.modelValue >= props.max

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
              'aria-label': 'Decrease',
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
                ? props.modelValue.toFixed(props.precision)
                : String(props.modelValue),
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
              'aria-label': 'Increase',
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
