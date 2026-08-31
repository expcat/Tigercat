import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  ref,
  watch,
  type PropType
} from 'vue'
import type { ComponentSize, InputStatus } from '@expcat/tigercat-core'
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
  createRafRepeatActionController,
  stepValue,
  isAtMin,
  isAtMax,
  formatInputNumberEditingDisplay,
  parseInputNumberValue,
  commitInputNumberValue,
  getInputNumberKeyboardNextValue,
  mergeAriaDescribedBy,
  mergeStyleValues,
  runShakeAnimation,
  getStepperLabels,
  callUnknownEventHandler
} from '@expcat/tigercat-core'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { useTigerConfig } from './ConfigProvider'

export type VueStepperProps = InstanceType<typeof Stepper>['$props']

export const Stepper = defineComponent({
  name: 'TigerStepper',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number },
    defaultValue: { type: Number, default: 0 },
    min: { type: Number, default: Number.NEGATIVE_INFINITY },
    max: { type: Number, default: Number.POSITIVE_INFINITY },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    precision: { type: Number, default: undefined },
    incrementAriaLabel: { type: String },
    decrementAriaLabel: { type: String },
    status: { type: String as PropType<InputStatus> },
    className: { type: String }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit, attrs, expose }) {
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const config = useTigerConfig()
    const labels = computed(() =>
      getStepperLabels(config.value.locale, {
        incrementAriaLabel: props.incrementAriaLabel,
        decrementAriaLabel: props.decrementAriaLabel
      })
    )
    const inner = ref(props.defaultValue ?? 0)
    const currentValue = computed(() =>
      props.modelValue !== undefined ? props.modelValue : inner.value
    )
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const focused = ref(false)
    const displayValue = ref(formatInputNumberEditingDisplay(currentValue.value, props.precision))
    const inputRef = ref<HTMLInputElement | null>(null)
    const rootRef = ref<HTMLElement | null>(null)
    const repeatController = createRafRepeatActionController()
    let repeatValue = currentValue.value
    let suppressNextClick = false

    expose({
      focus: () => inputRef.value?.focus(),
      input: inputRef
    })

    onBeforeUnmount(() => repeatController.stop())

    watch(
      () => currentValue.value,
      (value) => {
        if (!focused.value) {
          displayValue.value = formatInputNumberEditingDisplay(value, props.precision)
        }
      }
    )

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      ([nextStatus], oldValue) => {
        if (oldValue === undefined) return
        if (nextStatus === 'error') runShakeAnimation(rootRef.value)
      },
      { flush: 'post' }
    )

    const emitValue = (next: number) => {
      if (next === currentValue.value) return
      if (props.modelValue === undefined) inner.value = next
      emit('update:modelValue', next)
      emit('change', next)
      formItemControl?.onChange(next)
    }

    const commit = (raw: number | null): number => {
      const { value: next } = commitInputNumberValue(raw, currentValue.value, {
        min: props.min,
        max: props.max,
        precision: props.precision
      })
      const clamped = clampStepperValue(
        next ?? currentValue.value,
        props.min,
        props.max,
        props.precision,
        props.step
      )
      emitValue(clamped)
      displayValue.value = formatInputNumberEditingDisplay(clamped, props.precision)
      return clamped
    }

    const stepBy = (direction: 'up' | 'down', baseValue: number = currentValue.value): number => {
      if (effectiveDisabled.value) return baseValue
      const next = stepValue(
        baseValue,
        props.step,
        direction,
        props.min,
        props.max,
        props.precision
      )
      if (next === baseValue) return baseValue
      emitValue(next)
      displayValue.value = formatInputNumberEditingDisplay(next, props.precision)
      return next
    }

    const handleStepClick = (direction: 'up' | 'down') => {
      if (suppressNextClick) {
        suppressNextClick = false
        return
      }
      stepBy(direction)
    }

    const startStepRepeat = (direction: 'up' | 'down') => {
      return (event: PointerEvent) => {
        event.preventDefault()
        if (effectiveDisabled.value) return
        if (direction === 'down' && isAtMin(currentValue.value, props.min)) return
        if (direction === 'up' && isAtMax(currentValue.value, props.max)) return
        suppressNextClick = true
        repeatValue = currentValue.value
        repeatController.start(() => {
          const baseValue = repeatValue
          const nextValue = stepBy(direction, baseValue)
          repeatValue = nextValue
          if (nextValue === baseValue) repeatController.stop()
        })
        inputRef.value?.focus()
      }
    }

    const stopStepRepeat = () => repeatController.stop()

    const icon = (d: string) =>
      h(
        'svg',
        {
          class: 'w-4 h-4',
          viewBox: stepperIconViewBox,
          fill: 'currentColor',
          'aria-hidden': 'true'
        },
        [h('path', { d, 'fill-rule': 'evenodd', 'clip-rule': 'evenodd' })]
      )

    return () => {
      const { class: _class, style: _style, onBlur: _onBlur, ...restAttrs } = attrs
      const labelledby =
        typeof restAttrs['aria-labelledby'] === 'string' &&
        (restAttrs['aria-labelledby'] as string).trim()
          ? (restAttrs['aria-labelledby'] as string)
          : formItemControl?.labelId.value
      const ariaLabel =
        typeof restAttrs['aria-label'] === 'string' && (restAttrs['aria-label'] as string).trim()
          ? (restAttrs['aria-label'] as string)
          : labelledby
            ? undefined
            : labels.value.ariaLabel
      const describedBy = mergeAriaDescribedBy(
        typeof restAttrs['aria-describedby'] === 'string'
          ? (restAttrs['aria-describedby'] as string)
          : undefined,
        formItemControl?.describedBy.value
      )
      const attrId = typeof restAttrs.id === 'string' ? restAttrs.id : undefined
      const atMin = isAtMin(currentValue.value, props.min)
      const atMax = isAtMax(currentValue.value, props.max)

      return h(
        'div',
        {
          ...restAttrs,
          ref: rootRef,
          class: classNames(stepperBaseClasses, props.className, coerceClassValue(attrs.class)),
          style: mergeStyleValues(attrs.style),
          role: 'group',
          'aria-label': ariaLabel,
          'aria-labelledby': labelledby
        },
        [
          h(
            'button',
            {
              type: 'button',
              class: getStepperButtonClasses(props.size, effectiveDisabled.value || atMin, 'start'),
              disabled: effectiveDisabled.value || atMin,
              tabindex: -1,
              'aria-label': labels.value.decrementAriaLabel,
              onPointerdown: startStepRepeat('down'),
              onPointerup: stopStepRepeat,
              onPointerleave: stopStepRepeat,
              onPointercancel: stopStepRepeat,
              onClick: () => handleStepClick('down')
            },
            [icon(minusPathD)]
          ),
          h('input', {
            ref: inputRef,
            type: 'text',
            inputmode: 'decimal',
            role: 'spinbutton',
            class: getStepperInputClasses(props.size, effectiveDisabled.value, status.value),
            value: focused.value
              ? displayValue.value
              : formatInputNumberEditingDisplay(currentValue.value, props.precision),
            disabled: effectiveDisabled.value,
            id: attrId ?? formItemControl?.id.value,
            'aria-label': labels.value.valueAriaLabel,
            'aria-valuenow': currentValue.value,
            'aria-valuemin': Number.isFinite(props.min) ? props.min : undefined,
            'aria-valuemax': Number.isFinite(props.max) ? props.max : undefined,
            'aria-valuetext': Number.isFinite(currentValue.value)
              ? String(currentValue.value)
              : labels.value.valueAriaLabel,
            'aria-invalid': status.value === 'error' ? true : undefined,
            'aria-describedby': describedBy,
            onFocus: () => {
              focused.value = true
              displayValue.value = formatInputNumberEditingDisplay(
                currentValue.value,
                props.precision
              )
            },
            onBlur: (event: FocusEvent) => {
              commit(parseInputNumberValue(displayValue.value))
              focused.value = false
              formItemControl?.onBlur()
              callUnknownEventHandler(attrs.onBlur, event)
            },
            onInput: (event: Event) => {
              displayValue.value = (event.target as HTMLInputElement).value
            },
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'Enter') {
                commit(parseInputNumberValue(displayValue.value))
                return
              }
              const next = getInputNumberKeyboardNextValue(event.key, currentValue.value, {
                min: props.min,
                max: props.max,
                step: props.step,
                precision: props.precision
              })
              if (next === undefined) return
              event.preventDefault()
              emitValue(next)
              displayValue.value = formatInputNumberEditingDisplay(next, props.precision)
            }
          }),
          h(
            'button',
            {
              type: 'button',
              class: getStepperButtonClasses(props.size, effectiveDisabled.value || atMax, 'end'),
              disabled: effectiveDisabled.value || atMax,
              tabindex: -1,
              'aria-label': labels.value.incrementAriaLabel,
              onPointerdown: startStepRepeat('up'),
              onPointerup: stopStepRepeat,
              onPointerleave: stopStepRepeat,
              onPointercancel: stopStepRepeat,
              onClick: () => handleStepClick('up')
            },
            [icon(plusPathD)]
          )
        ]
      )
    }
  }
})

export default Stepper
