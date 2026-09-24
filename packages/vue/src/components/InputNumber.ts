import {
  defineComponent,
  computed,
  ref,
  watch,
  h,
  onBeforeUnmount,
  inject,
  getCurrentInstance,
  PropType
} from 'vue'
import {
  classNames,
  shouldSubmitNativeField,
  coerceClassValue,
  callUnknownEventHandler,
  getInputNumberWrapperClasses,
  getInputNumberSizeClasses,
  getInputNumberInputClasses,
  getInputNumberStepButtonClasses,
  getInputNumberSideButtonClasses,
  inputNumberControlsRightClasses,
  inputNumberUpIconPathD,
  inputNumberDownIconPathD,
  inputNumberMinusIconPathD,
  inputNumberPlusIconPathD,
  stepValue,
  isAtMin,
  isAtMax,
  formatInputNumberDisplay,
  formatInputNumberEditingDisplay,
  parseInputNumberValue,
  parseInputNumberModel,
  commitInputNumberModel,
  stepInputNumberModel,
  addDecimalString,
  getInputNumberKeyboardNextValue,
  resolveInputNumberControlsLayout,
  createRafRepeatActionController,
  mergeAriaDescribedBy,
  runShakeAnimation,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  getInputNumberLabels,
  type ComponentSize,
  type InputStatus,
  type InputNumberProps as CoreInputNumberProps
} from '@expcat/tigercat-core'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { useTigerConfig } from './ConfigProvider'

export interface VueInputNumberProps extends Omit<CoreInputNumberProps, 'value' | 'defaultValue'> {
  modelValue?: number | string | null
  defaultValue?: number | string | null
  className?: string
}

export const InputNumber = defineComponent({
  name: 'TigerInputNumber',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Number, String] as PropType<number | string | null>
    },
    defaultValue: {
      type: [Number, String] as PropType<number | string | null>,
      default: undefined
    },
    size: {
      type: String as PropType<ComponentSize>,
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
    readOnly: {
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
      type: Function as PropType<(displayValue: string) => number | null>
    },
    snapToStep: {
      type: Boolean,
      default: false
    },
    autoFocus: {
      type: Boolean,
      default: false
    },
    incrementAriaLabel: String,
    decrementAriaLabel: String,
    _shakeTrigger: {
      type: Number,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur', 'keydown'],

  setup(props, { emit, attrs, expose }) {
    const instance = getCurrentInstance()
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const inGroup = computed(() => inputGroup != null)
    const labels = computed(() =>
      getInputNumberLabels(config.value.locale, {
        incrementAriaLabel: props.incrementAriaLabel,
        decrementAriaLabel: props.decrementAriaLabel
      })
    )
    const effectiveSize = computed(() => {
      const hasOwnSize = Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'size')
      return hasOwnSize ? props.size : (inputGroup?.size ?? props.size)
    })
    const hasOwnStatus = computed(() =>
      Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'status')
    )
    const effectiveStatus = computed(() =>
      hasOwnStatus.value ? props.status : (formItemControl?.status.value ?? props.status)
    )
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const formValue = computed(() => formItemControl?.value.value)
    const effectiveShakeTrigger = computed(
      () => props._shakeTrigger ?? formItemControl?.shakeTrigger.value
    )

    const inputRef = ref<HTMLInputElement | null>(null)
    const wrapperRef = ref<HTMLDivElement | null>(null)
    const focused = ref(false)
    const displayValue = ref('')
    const repeatController = createRafRepeatActionController()
    let repeatValue: number | null = null
    let suppressNextClick = false

    expose({
      focus: () => inputRef.value?.focus(),
      input: inputRef
    })

    function readStored(raw: unknown): number | string | null {
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
      if (typeof raw === 'string') {
        if (raw === '') return null
        return parseInputNumberModel(raw)
      }
      return null
    }

    function toDisplayValue(val: number | string | null | undefined, editing: boolean): string {
      if (typeof val === 'string') {
        return props.precision !== undefined ? addDecimalString(val, 0, props.precision) : val
      }
      return editing
        ? formatInputNumberEditingDisplay(val, props.precision)
        : formatInputNumberDisplay(val, {
            formatter: props.formatter,
            precision: props.precision
          })
    }

    function parseValue(str: string): number | string | null {
      if (props.parser) return parseInputNumberValue(str, { parser: props.parser })
      return parseInputNumberModel(str)
    }

    const isControlled = computed(() => props.modelValue !== undefined)
    const internalValue = ref<number | string | null>(
      readStored(props.modelValue ?? props.defaultValue)
    )
    const currentValue = computed(() => {
      if (isControlled.value) return readStored(props.modelValue)
      if (formItemControl?.name.value) return readStored(formValue.value)
      return internalValue.value
    })

    watch(
      () => [currentValue.value, focused.value, props.formatter, props.precision] as const,
      () => {
        if (!focused.value) displayValue.value = toDisplayValue(currentValue.value, false)
      },
      { immediate: true }
    )

    watch(
      [effectiveStatus, effectiveShakeTrigger] as const,
      ([newStatus], oldValue) => {
        if (oldValue === undefined) return
        if (newStatus === 'error') runShakeAnimation(wrapperRef.value)
      },
      { flush: 'post' }
    )

    function commit(val: number | string | null, nextFocused = focused.value): number | string | null {
      const { value: next, changed } = commitInputNumberModel(val, currentValue.value, {
        min: props.min,
        max: props.max,
        precision: props.precision,
        step: props.step,
        snapToStep: props.snapToStep
      })
      if (changed) {
        if (!isControlled.value) internalValue.value = next
        emit('update:modelValue', next)
        emit('change', next)
        formItemControl?.onChange(next)
      }
      displayValue.value = toDisplayValue(next, nextFocused)
      return next
    }

    function handleStep(
      direction: 'up' | 'down',
      baseValue: number | string | null | undefined = currentValue.value
    ): number | string | null {
      if (effectiveDisabled.value || props.readOnly) return baseValue ?? null
      if (typeof baseValue === 'string') {
        return commit(stepInputNumberModel(baseValue, props.step, direction, props.min, props.max, props.precision))
      }
      const next = stepValue(
        baseValue,
        props.step,
        direction,
        props.min,
        props.max,
        props.precision
      )
      return commit(next)
    }

    function handleStepClick(direction: 'up' | 'down') {
      if (suppressNextClick) {
        suppressNextClick = false
        return
      }
      handleStep(direction)
    }

    function startStepRepeat(direction: 'up' | 'down') {
      return (event: PointerEvent) => {
        event.preventDefault()
        if (effectiveDisabled.value || props.readOnly) return
        if (direction === 'down' && isAtMin(currentValue.value, props.min)) return
        if (direction === 'up' && isAtMax(currentValue.value, props.max)) return

        suppressNextClick = true
        repeatValue = currentValue.value
        repeatController.start(() => {
          const baseValue = repeatValue
          const nextValue = handleStep(direction, baseValue)
          repeatValue = nextValue
          if (nextValue === baseValue) repeatController.stop()
        })
        inputRef.value?.focus()
      }
    }

    function stopStepRepeat() {
      repeatController.stop()
    }

    function handleInput(e: Event) {
      displayValue.value = (e.target as HTMLInputElement).value
    }

    function handleBlur(e: FocusEvent) {
      commit(parseValue(displayValue.value), false)
      focused.value = false
      formItemControl?.onBlur()
      emit('blur', e)
    }

    function handleFocus(e: FocusEvent) {
      focused.value = true
      displayValue.value = toDisplayValue(currentValue.value, true)
      emit('focus', e)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        commit(parseValue(displayValue.value))
      } else {
        const next = getInputNumberKeyboardNextValue(e.key, currentValue.value, {
          min: props.min,
          max: props.max,
          step: props.step,
          precision: props.precision,
          keyboard: props.keyboard && !effectiveDisabled.value && !props.readOnly
        })
        if (next !== undefined) {
          e.preventDefault()
          commit(next)
        }
      }
      emit('keydown', e)
    }

    const atMin = computed(() => isAtMin(currentValue.value, props.min))
    const atMax = computed(() => isAtMax(currentValue.value, props.max))
    const layout = computed(() =>
      resolveInputNumberControlsLayout(props.controls, props.controlsPosition)
    )
    const stepDisabled = computed(() => effectiveDisabled.value || props.readOnly)

    const wrapperClasses = computed(() =>
      classNames(
        getInputNumberWrapperClasses({
          disabled: effectiveDisabled.value,
          inGroup: inGroup.value,
          status: effectiveStatus.value
        }),
        getInputNumberSizeClasses(effectiveSize.value),
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const inputClasses = computed(() =>
      getInputNumberInputClasses(effectiveSize.value, layout.value)
    )

    onBeforeUnmount(() => repeatController.stop())

    function renderStepIcon(d: string, stroke: boolean) {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: stroke ? 'none' : 'currentColor',
          stroke: stroke ? 'currentColor' : undefined,
          'stroke-width': stroke ? '2' : undefined,
          class: stroke ? 'w-4 h-4' : 'w-3 h-3',
          'aria-hidden': 'true'
        },
        [h('path', { d })]
      )
    }

    return () => {
      const { class: _attrClass, style: attrStyle, ...restAttrs } = attrs
      const children: ReturnType<typeof h>[] = []
      const valueText =
        currentValue.value == null
          ? labels.value.emptyAriaValueText
          : props.formatter
            ? props.formatter(currentValue.value)
            : String(currentValue.value)

      if (layout.value === 'both') {
        children.push(
          h(
            'button',
            {
              type: 'button',
              tabindex: -1,
              'aria-hidden': 'true',
              'aria-label': labels.value.decrementAriaLabel,
              class: getInputNumberSideButtonClasses('start', stepDisabled.value || atMin.value),
              disabled: stepDisabled.value || atMin.value,
              onPointerdown: startStepRepeat('down'),
              onPointerup: stopStepRepeat,
              onPointerleave: stopStepRepeat,
              onPointercancel: stopStepRepeat,
              onClick: () => handleStepClick('down')
            },
            [renderStepIcon(inputNumberMinusIconPathD, true)]
          )
        )
      }

      children.push(
        h('input', {
          ...restAttrs,
          ref: inputRef,
          type: 'text',
          inputmode: 'decimal',
          role: 'spinbutton',
          autofocus: props.autoFocus ? true : undefined,
          'aria-valuemin': props.min === -Infinity ? undefined : props.min,
          'aria-valuemax': props.max === Infinity ? undefined : props.max,
          'aria-valuenow': currentValue.value ?? undefined,
          'aria-valuetext': valueText,
          ...(effectiveStatus.value === 'error' ? { 'aria-invalid': true } : {}),
          'aria-describedby': mergeAriaDescribedBy(
            restAttrs['aria-describedby'] as string | undefined,
            formItemControl?.describedBy.value
          ),
          class: inputClasses.value,
          value: displayValue.value,
          placeholder: props.placeholder,
          disabled: effectiveDisabled.value,
          readonly: props.readOnly,
          id: effectiveId.value,
          'aria-labelledby':
            typeof restAttrs['aria-label'] === 'string'
              ? undefined
              : ((restAttrs['aria-labelledby'] as string | undefined) ??
                formItemControl?.labelId.value),
          onInput: (event: Event) => {
            handleInput(event)
            callUnknownEventHandler(restAttrs.onInput, event)
          },
          onBlur: (event: FocusEvent) => {
            handleBlur(event)
            callUnknownEventHandler(restAttrs.onBlur, event)
          },
          onFocus: (event: FocusEvent) => {
            handleFocus(event)
            callUnknownEventHandler(restAttrs.onFocus, event)
          },
          onKeydown: (event: KeyboardEvent) => {
            handleKeyDown(event)
            callUnknownEventHandler(restAttrs.onKeydown, event)
          }
        })
      )

      if (layout.value === 'both') {
        children.push(
          h(
            'button',
            {
              type: 'button',
              tabindex: -1,
              'aria-hidden': 'true',
              'aria-label': labels.value.incrementAriaLabel,
              class: getInputNumberSideButtonClasses('end', stepDisabled.value || atMax.value),
              disabled: stepDisabled.value || atMax.value,
              onPointerdown: startStepRepeat('up'),
              onPointerup: stopStepRepeat,
              onPointerleave: stopStepRepeat,
              onPointercancel: stopStepRepeat,
              onClick: () => handleStepClick('up')
            },
            [renderStepIcon(inputNumberPlusIconPathD, true)]
          )
        )
      }

      if (layout.value === 'end') {
        children.push(
          h('div', { class: inputNumberControlsRightClasses }, [
            h(
              'button',
              {
                type: 'button',
                tabindex: -1,
                'aria-hidden': 'true',
                'aria-label': labels.value.incrementAriaLabel,
                class: getInputNumberStepButtonClasses('up', stepDisabled.value || atMax.value),
                disabled: stepDisabled.value || atMax.value,
                onPointerdown: startStepRepeat('up'),
                onPointerup: stopStepRepeat,
                onPointerleave: stopStepRepeat,
                onPointercancel: stopStepRepeat,
                onClick: () => handleStepClick('up')
              },
              [renderStepIcon(inputNumberUpIconPathD, false)]
            ),
            h(
              'button',
              {
                type: 'button',
                tabindex: -1,
                'aria-hidden': 'true',
                'aria-label': labels.value.decrementAriaLabel,
                class: getInputNumberStepButtonClasses('down', stepDisabled.value || atMin.value),
                disabled: stepDisabled.value || atMin.value,
                onPointerdown: startStepRepeat('down'),
                onPointerup: stopStepRepeat,
                onPointerleave: stopStepRepeat,
                onPointercancel: stopStepRepeat,
                onClick: () => handleStepClick('down')
              },
              [renderStepIcon(inputNumberDownIconPathD, false)]
            )
          ])
        )
      }

      if (shouldSubmitNativeField({ name: effectiveName.value, disabled: effectiveDisabled.value })) {
        children.push(
          h('input', {
            type: 'hidden',
            name: effectiveName.value,
            value: currentValue.value == null ? '' : String(currentValue.value)
          })
        )
      }

      return h(
        'div',
        {
          ref: wrapperRef,
          class: wrapperClasses.value,
          style: attrStyle,
          [TIGER_CHROME_ATTR]: '',
          onAnimationend: () => wrapperRef.value?.classList.remove(SHAKE_CLASS)
        },
        children
      )
    }
  }
})

export default InputNumber
