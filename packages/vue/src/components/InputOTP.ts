import {
  computed,
  defineComponent,
  h,
  inject,
  onMounted,
  ref,
  useId,
  watch,
  type PropType
} from 'vue'
import {
  SHAKE_CLASS,
  applyOtpBackspace,
  applyOtpCharInput,
  applyOtpDelete,
  classNames,
  clampOtpClickIndex,
  coerceClassValue,
  devWarn,
  distributeOtpPaste,
  formatOtpSlotLabel,
  getInputOTPLabels,
  getOtpContainerClasses,
  getOtpErrorClasses,
  getOtpFocusIndex,
  getOtpInputMode,
  getOtpKeyIntent,
  getOtpSeparatorClasses,
  getOtpSeparatorIndices,
  getOtpSlotClasses,
  getOtpSlotTabIndex,
  isOtpComplete,
  mergeAriaDescribedBy,
  mergeStyleValues,
  normalizeOtpValue,
  runShakeAnimation,
  sanitizeOtpInput,
  shouldDistributeOtpInput,
  type ComponentSize,
  type InputOTPType,
  type InputStatus
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export type VueInputOTPProps = InstanceType<typeof InputOTP>['$props']
export type InputOTPProps = VueInputOTPProps

export const InputOTP = defineComponent({
  name: 'TigerInputOTP',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    status: { type: String as PropType<InputStatus>, default: undefined },
    errorMessage: String,
    length: { type: Number, default: 6 },
    type: { type: String as PropType<InputOTPType>, default: 'numeric' },
    pattern: { type: RegExp as PropType<RegExp>, default: undefined },
    masked: Boolean,
    maskChar: { type: String, default: '•' },
    groups: { type: Array as PropType<number[]>, default: undefined },
    separator: { type: String, default: '-' },
    disabled: Boolean,
    readonly: Boolean,
    autoFocus: Boolean,
    name: String,
    id: String,
    ariaLabel: String,
    _shakeTrigger: { type: Number, default: undefined },
    className: String,
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  emits: {
    'update:modelValue': null,
    complete: null,
    focus: null,
    blur: null
  },
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const formValue = computed(() => formItemControl?.value.value)
    const dir = computed(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))
    const labels = computed(() => getInputOTPLabels(config.value.locale))
    const errorMsgId = `tiger-input-otp-error-${useId()}`

    const containerRef = ref<HTMLDivElement | null>(null)
    const slotRefs = ref<Array<HTMLInputElement | null>>([])
    const charOptions = computed(() => ({ type: props.type, pattern: props.pattern }))
    const inputMode = computed(() => getOtpInputMode(props.type, props.pattern))

    const localValue = ref(
      props.modelValue ??
        (typeof formValue.value === 'string' ? formValue.value : undefined) ??
        props.defaultValue ??
        ''
    )
    const currentValue = computed(() =>
      normalizeOtpValue(
        props.modelValue !== undefined
          ? props.modelValue
          : typeof formValue.value === 'string'
            ? formValue.value
            : localValue.value,
        props.length,
        charOptions.value
      )
    )
    const focusIndex = ref(getOtpFocusIndex(currentValue.value, props.length))

    const separatorIndices = computed(() => {
      const indices = getOtpSeparatorIndices(props.length, props.groups)
      if (props.groups && props.groups.length > 0 && indices.length === 0) {
        devWarn('InputOTP.groups', '[Tigercat] InputOTP: `groups` must sum to `length`; ignoring.')
      }
      return indices
    })

    watch(
      () => [props.modelValue, formValue.value] as const,
      ([model, controlValue]) => {
        const source =
          model !== undefined ? model : typeof controlValue === 'string' ? controlValue : undefined
        if (source === undefined) return
        if (source !== localValue.value) localValue.value = source
      }
    )

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value, props._shakeTrigger] as const,
      (current, previous) => {
        if (!previous) return
        if (current[0] === 'error') runShakeAnimation(containerRef.value)
      },
      { flush: 'post' }
    )

    function focusSlot(index: number) {
      const next = Math.max(0, Math.min(index, props.length - 1))
      focusIndex.value = next
      slotRefs.value[next]?.focus()
    }

    onMounted(() => {
      if (props.autoFocus) focusSlot(getOtpFocusIndex(currentValue.value, props.length))
    })

    function displayChar(val: string, index: number): string {
      const char = val[index] ?? ''
      return char && props.masked ? props.maskChar : char
    }

    function emitValue(next: string) {
      if (next === currentValue.value) return
      if (props.modelValue === undefined && typeof formValue.value !== 'string') {
        localValue.value = next
      }
      emit('update:modelValue', next)
      formItemControl?.onChange(next)
      if (isOtpComplete(next, props.length)) emit('complete', next)
    }

    const isInteractive = computed(() => !effectiveDisabled.value && !props.readonly)

    function handleSlotInput(index: number, event: Event) {
      if (!isInteractive.value) return
      const target = event.target as HTMLInputElement
      const inputType = (event as InputEvent).inputType
      const sanitized = sanitizeOtpInput(target.value, charOptions.value)
      const result = applyOtpCharInput(currentValue.value, index, target.value, props.length, {
        ...charOptions.value,
        distributeFromStart: shouldDistributeOtpInput(index, inputType, sanitized.length)
      })
      target.value = displayChar(result.value, index)
      emitValue(result.value)
      focusSlot(result.nextIndex)
    }

    function handleSlotKeydown(index: number, event: KeyboardEvent) {
      if (!isInteractive.value) return
      const intent = getOtpKeyIntent(event.key, dir.value)
      switch (intent.type) {
        case 'backspace': {
          event.preventDefault()
          const result = applyOtpBackspace(currentValue.value, index)
          emitValue(result.value)
          focusSlot(result.nextIndex)
          break
        }
        case 'delete': {
          event.preventDefault()
          const result = applyOtpDelete(currentValue.value, index)
          emitValue(result.value)
          break
        }
        case 'move':
          event.preventDefault()
          focusSlot(index + intent.delta)
          break
        case 'home':
          event.preventDefault()
          focusSlot(0)
          break
        case 'end':
          event.preventDefault()
          focusSlot(getOtpFocusIndex(currentValue.value, props.length))
          break
        default:
          break
      }
    }

    function handlePaste(event: ClipboardEvent) {
      if (!isInteractive.value) return
      event.preventDefault()
      const result = distributeOtpPaste(
        event.clipboardData?.getData('text') ?? '',
        props.length,
        charOptions.value
      )
      if (!result) return
      emitValue(result.value)
      focusSlot(result.nextIndex)
    }

    function containsNode(node: EventTarget | null) {
      return node instanceof Node && !!containerRef.value?.contains(node)
    }

    expose({
      focus: () => focusSlot(getOtpFocusIndex(currentValue.value, props.length)),
      input: computed(() => slotRefs.value[0] ?? null)
    })

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const activeError = status.value === 'error' && !!props.errorMessage
      const slotClasses = getOtpSlotClasses(props.size, status.value, {
        disabled: effectiveDisabled.value,
        readonly: props.readonly
      })
      const labelledby =
        typeof restAttrs['aria-labelledby'] === 'string' && restAttrs['aria-labelledby'].trim()
          ? restAttrs['aria-labelledby']
          : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(
        mergeAriaDescribedBy(
          typeof restAttrs['aria-describedby'] === 'string'
            ? restAttrs['aria-describedby']
            : undefined,
          activeError ? errorMsgId : undefined
        ),
        formItemControl?.describedBy.value
      )
      const currentTab = Math.min(Math.max(focusIndex.value, 0), props.length - 1)
      const fieldId = props.id ?? formItemControl?.id.value

      const children: ReturnType<typeof h>[] = []
      for (let i = 0; i < props.length; i++) {
        const isTabStop = i === currentTab
        children.push(
          h('input', {
            key: `slot-${i}`,
            ref: (el) => {
              slotRefs.value[i] = el as HTMLInputElement | null
            },
            class: slotClasses,
            type: 'text',
            inputmode: inputMode.value,
            autocomplete: i === 0 ? 'one-time-code' : 'off',
            maxlength: 1,
            value: displayChar(currentValue.value, i),
            disabled: effectiveDisabled.value,
            readonly: props.readonly,
            tabindex: getOtpSlotTabIndex(i, currentTab, effectiveDisabled.value),
            id: isTabStop ? fieldId : undefined,
            'aria-label': formatOtpSlotLabel(labels.value.slotLabel, i + 1, props.length),
            'aria-invalid': status.value === 'error' ? true : undefined,
            'aria-required': isTabStop && formItemControl?.required.value ? true : undefined,
            'aria-describedby': isTabStop ? describedBy : undefined,
            onInput: (event: Event) => handleSlotInput(i, event),
            onKeydown: (event: KeyboardEvent) => handleSlotKeydown(i, event),
            onMousedown: (event: MouseEvent) => {
              const next = clampOtpClickIndex(i, currentValue.value, props.length)
              if (next !== i) {
                event.preventDefault()
                focusSlot(next)
              }
            },
            onFocus: (event: FocusEvent) => (event.target as HTMLInputElement).select()
          })
        )
        if (separatorIndices.value.includes(i) && props.separator) {
          children.push(
            h(
              'span',
              {
                key: `separator-${i}`,
                'aria-hidden': 'true',
                class: getOtpSeparatorClasses(props.size)
              },
              props.separator
            )
          )
        }
      }

      if (effectiveName.value) {
        children.push(
          h('input', {
            key: 'hidden',
            type: 'hidden',
            name: effectiveName.value,
            value: currentValue.value,
            disabled: effectiveDisabled.value
          })
        )
      }

      const groupNode = h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          role: 'group',
          'aria-label': labelledby ? undefined : (props.ariaLabel ?? labels.value.groupLabel),
          'aria-labelledby': labelledby,
          class: getOtpContainerClasses(props.size),
          onAnimationend: () => containerRef.value?.classList.remove(SHAKE_CLASS),
          onPaste: handlePaste,
          onFocusin: (event: FocusEvent) => {
            if (!containsNode(event.relatedTarget)) emit('focus', event)
          },
          onFocusout: (event: FocusEvent) => {
            if (!containsNode(event.relatedTarget)) {
              formItemControl?.onBlur()
              emit('blur', event)
            }
          }
        },
        children
      )

      const nodes: ReturnType<typeof h>[] = [groupNode]
      if (activeError) {
        nodes.push(
          h(
            'div',
            { id: errorMsgId, class: getOtpErrorClasses(), 'aria-live': 'polite' },
            props.errorMessage
          )
        )
      }

      return h(
        'div',
        {
          class: classNames('inline-block', props.className, coerceClassValue(attrClass)),
          style: mergeStyleValues(props.style, attrStyle as Record<string, unknown> | undefined)
        },
        nodes
      )
    }
  }
})

export default InputOTP
