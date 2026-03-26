import { defineComponent, h, type PropType } from 'vue'
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
  coerceClassValue
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
    function setValue(v: number) {
      const clamped = clampStepperValue(v, props.min, props.max, props.precision)
      emit('update:modelValue', clamped)
      emit('change', clamped)
    }

    function decrement() {
      if (props.disabled) return
      setValue(props.modelValue - props.step)
    }

    function increment() {
      if (props.disabled) return
      setValue(props.modelValue + props.step)
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
