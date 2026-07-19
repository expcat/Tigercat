import { computed, defineComponent, h, inject, onMounted, ref, watch, type PropType } from 'vue'
import {
  applyOtpBackspace,
  applyOtpCharInput,
  applyOtpDelete,
  classNames,
  coerceClassValue,
  devWarn,
  distributeOtpPaste,
  formatOtpSlotLabel,
  getInputOTPLabels,
  getOtpContainerClasses,
  getOtpErrorClasses,
  getOtpSeparatorClasses,
  getOtpSeparatorIndices,
  getOtpSlotClasses,
  injectShakeStyle,
  isOtpComplete,
  mergeStyleValues,
  normalizeOtpValue,
  SHAKE_CLASS,
  type ComponentSize,
  type InputOTPType,
  type InputStatus
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

let inputOtpIdCounter = 0

export type VueInputOTPProps = InstanceType<typeof InputOTP>['$props']

export const InputOTP = defineComponent({
  name: 'TigerInputOTP',
  inheritAttrs: false,
  props: {
    /**
     * Value (for v-model) — the joined characters
     */
    modelValue: { type: String, default: undefined },
    /**
     * Default value (for uncontrolled mode)
     */
    defaultValue: { type: String, default: '' },
    /**
     * Input size
     * @default 'md'
     */
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    /**
     * Validation status
     * @default 'default'
     */
    status: { type: String as PropType<InputStatus>, default: 'default' },
    /**
     * Error message to display
     */
    errorMessage: String,
    /**
     * Number of character slots
     * @default 6
     */
    length: { type: Number, default: 6 },
    /**
     * Allowed character set
     * @default 'numeric'
     */
    type: { type: String as PropType<InputOTPType>, default: 'numeric' },
    /**
     * Per-character validation regex; overrides `type` filtering
     */
    pattern: { type: RegExp as PropType<RegExp>, default: undefined },
    /**
     * Hide entered characters (renders maskChar instead)
     */
    masked: Boolean,
    /**
     * Character shown per filled slot when masked
     * @default '•'
     */
    maskChar: { type: String, default: '•' },
    /**
     * Visual slot grouping, e.g. [3, 3]
     */
    groups: { type: Array as PropType<number[]>, default: undefined },
    /**
     * Separator rendered between groups
     * @default '-'
     */
    separator: { type: String, default: '-' },
    /** Whether the input is disabled */
    disabled: Boolean,
    /** Whether the input is readonly */
    readonly: Boolean,
    /** Whether to autofocus the first empty slot on mount */
    autoFocus: Boolean,
    /** Name for the hidden input carrying the joined value */
    name: String,
    /** Id attribute applied to the group element */
    id: String,
    /** Accessible label for the slot group */
    ariaLabel: String,
    /**
     * Internal shake trigger counter (used by FormItem)
     * @internal
     */
    _shakeTrigger: { type: Number, default: undefined },
    /** Additional CSS classes */
    className: String,
    /** Inline styles */
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  emits: {
    'update:modelValue': null,
    complete: null,
    focus: null,
    blur: null
  },
  setup(props, { emit, attrs }) {
    injectShakeStyle()
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const effectiveStatus = computed(
      () => (props.status !== 'default' ? props.status : (formItemControl?.status.value ?? props.status))
    )
    const effectiveErrorMessage = computed(
      () => props.errorMessage ?? formItemControl?.errorMessage.value
    )
    const effectiveShakeTrigger = computed(
      () => props._shakeTrigger ?? formItemControl?.shakeTrigger.value
    )

    const labels = computed(() => getInputOTPLabels(config.value.locale))
    const instanceId = ++inputOtpIdCounter
    const errorMsgId = `tiger-input-otp-error-${instanceId}`

    const containerRef = ref<HTMLDivElement | null>(null)
    const slotRefs = ref<Array<HTMLInputElement | null>>([])

    const charOptions = computed(() => ({ type: props.type, pattern: props.pattern }))
    const isControlled = computed(() => props.modelValue !== undefined)
    const innerValue = ref(props.defaultValue ?? '')
    const currentValue = computed(() =>
      normalizeOtpValue(
        isControlled.value ? (props.modelValue ?? '') : innerValue.value,
        props.length,
        charOptions.value
      )
    )

    const separatorIndices = computed(() => {
      const indices = getOtpSeparatorIndices(props.length, props.groups)
      if (props.groups && props.groups.length > 0 && indices.length === 0) {
        devWarn('InputOTP.groups', '[Tigercat] InputOTP: `groups` must sum to `length`; ignoring.')
      }
      return indices
    })

    watch([effectiveStatus, effectiveShakeTrigger] as const, ([newStatus]) => {
      if (newStatus === 'error' && containerRef.value) {
        const el = containerRef.value
        el.classList.remove(SHAKE_CLASS)
        void el.offsetWidth // force reflow to restart animation
        el.classList.add(SHAKE_CLASS)
      }
    })

    const focusSlot = (index: number) => {
      slotRefs.value[Math.max(0, Math.min(index, props.length - 1))]?.focus()
    }

    onMounted(() => {
      if (props.autoFocus) {
        focusSlot(Math.min(currentValue.value.length, props.length - 1))
      }
    })

    const displayChar = (val: string, index: number): string => {
      const char = val[index] ?? ''
      return char && props.masked ? props.maskChar : char
    }

    const emitValue = (next: string) => {
      if (next === currentValue.value) return
      if (!isControlled.value) innerValue.value = next
      emit('update:modelValue', next)
      if (isOtpComplete(next, props.length)) emit('complete', next)
    }

    const isInteractive = computed(() => !props.disabled && !props.readonly)

    const handleSlotInput = (index: number, event: Event) => {
      if (!isInteractive.value) return
      const target = event.target as HTMLInputElement
      const result = applyOtpCharInput(
        currentValue.value,
        index,
        target.value,
        props.length,
        charOptions.value
      )
      // Vue only patches the DOM on state changes — sync rejected input manually
      target.value = displayChar(result.value, index)
      emitValue(result.value)
      focusSlot(result.nextIndex)
    }

    const handleSlotKeydown = (index: number, event: KeyboardEvent) => {
      if (!isInteractive.value) return
      switch (event.key) {
        case 'Backspace': {
          event.preventDefault()
          const result = applyOtpBackspace(currentValue.value, index)
          emitValue(result.value)
          focusSlot(result.nextIndex)
          break
        }
        case 'Delete': {
          event.preventDefault()
          const result = applyOtpDelete(currentValue.value, index)
          emitValue(result.value)
          break
        }
        case 'ArrowLeft':
          event.preventDefault()
          focusSlot(index - 1)
          break
        case 'ArrowRight':
          event.preventDefault()
          focusSlot(index + 1)
          break
        case 'Home':
          event.preventDefault()
          focusSlot(0)
          break
        case 'End':
          event.preventDefault()
          focusSlot(Math.min(currentValue.value.length, props.length - 1))
          break
      }
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (!isInteractive.value) return
      event.preventDefault()
      const text = event.clipboardData?.getData('text') ?? ''
      const result = distributeOtpPaste(text, props.length, charOptions.value)
      if (!result) return
      emitValue(result.value)
      focusSlot(result.nextIndex)
    }

    const handleSlotFocus = (event: FocusEvent) => {
      // Select the slot content so the next keystroke overwrites it
      ;(event.target as HTMLInputElement).select()
    }

    const containsNode = (node: EventTarget | null) =>
      node instanceof Node && !!containerRef.value?.contains(node)

    const handleGroupFocusin = (event: FocusEvent) => {
      if (!containsNode(event.relatedTarget)) emit('focus', event)
    }

    const handleGroupFocusout = (event: FocusEvent) => {
      if (!containsNode(event.relatedTarget)) emit('blur', event)
    }

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const activeError = effectiveStatus.value === 'error' && !!effectiveErrorMessage.value
      const slotClasses = getOtpSlotClasses(props.size, effectiveStatus.value, {
        disabled: props.disabled,
        readonly: props.readonly
      })

      const children: ReturnType<typeof h>[] = []
      for (let i = 0; i < props.length; i++) {
        children.push(
          h('input', {
            key: `slot-${i}`,
            ref: (el) => {
              slotRefs.value[i] = el as HTMLInputElement | null
            },
            class: slotClasses,
            type: 'text',
            inputmode: props.type === 'numeric' ? 'numeric' : undefined,
            autocomplete: i === 0 ? 'one-time-code' : 'off',
            value: displayChar(currentValue.value, i),
            disabled: props.disabled,
            readonly: props.readonly,
            'aria-label': formatOtpSlotLabel(labels.value.slotLabel, i + 1, props.length),
            ...(effectiveStatus.value === 'error' ? { 'aria-invalid': true } : {}),
            onInput: (event: Event) => handleSlotInput(i, event),
            onKeydown: (event: KeyboardEvent) => handleSlotKeydown(i, event),
            onFocus: handleSlotFocus
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

      if (props.name) {
        children.push(
          h('input', { key: 'hidden', type: 'hidden', name: props.name, value: currentValue.value })
        )
      }

      const groupNode = h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          id: props.id,
          role: 'group',
          'aria-label': props.ariaLabel ?? labels.value.groupLabel,
          ...(activeError ? { 'aria-describedby': errorMsgId } : {}),
          class: getOtpContainerClasses(props.size),
          onPaste: handlePaste,
          onFocusin: handleGroupFocusin,
          onFocusout: handleGroupFocusout
        },
        children
      )

      const nodes: ReturnType<typeof h>[] = [groupNode]
      if (activeError) {
        nodes.push(
          h('div', { id: errorMsgId, class: getOtpErrorClasses() }, effectiveErrorMessage.value)
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
