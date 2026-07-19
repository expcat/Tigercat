import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  ref,
  watch,
  type PropType
} from 'vue'
import {
  applyMaskInput,
  classNames,
  coerceClassValue,
  formatMaskValue,
  getInputClasses,
  getInputClearButtonClasses,
  getInputErrorClasses,
  getInputWrapperClasses,
  injectShakeStyle,
  mergeStyleValues,
  parseMask,
  SHAKE_CLASS,
  type ComponentSize,
  type InputStatus,
  type MaskInputChangeDetail,
  type MaskToken
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

let maskInputIdCounter = 0

export type VueMaskInputProps = InstanceType<typeof MaskInput>['$props']

export const MaskInput = defineComponent({
  name: 'TigerMaskInput',
  inheritAttrs: false,
  props: {
    /**
     * Raw (unmasked) value for v-model
     */
    modelValue: { type: String, default: undefined },
    /**
     * Default raw value (for uncontrolled mode)
     */
    defaultValue: { type: String, default: '' },
    /**
     * Mask template. Built-in tokens: `#` digit, `a` letter, `*` alphanumeric,
     * `!` escapes the next character to a literal
     */
    mask: { type: String, required: true },
    /**
     * Custom tokens merged over the built-ins
     */
    tokens: { type: Object as PropType<Record<string, MaskToken>>, default: undefined },
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
    /** Error message to display */
    errorMessage: String,
    /** Placeholder text */
    placeholder: { type: String, default: '' },
    /** Whether the input is disabled */
    disabled: Boolean,
    /** Whether the input is readonly */
    readonly: Boolean,
    /** Whether to show a clear button when the input has value */
    clearable: Boolean,
    /** Input name attribute */
    name: String,
    /** Input id attribute */
    id: String,
    /** Autocomplete attribute */
    autoComplete: String,
    /** Whether to autofocus on mount */
    autoFocus: Boolean,
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
    change: null,
    complete: null,
    focus: null,
    blur: null,
    clear: null
  },
  setup(props, { emit, attrs }) {
    injectShakeStyle()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    // config kept for locale-aware future use; parity with sibling inputs
    useTigerConfig()
    const effectiveStatus = computed(() =>
      props.status !== 'default' ? props.status : (formItemControl?.status.value ?? props.status)
    )
    const effectiveErrorMessage = computed(
      () => props.errorMessage ?? formItemControl?.errorMessage.value
    )
    const effectiveShakeTrigger = computed(
      () => props._shakeTrigger ?? formItemControl?.shakeTrigger.value
    )

    const instanceId = ++maskInputIdCounter
    const errorMsgId = `tiger-mask-input-error-${instanceId}`

    const wrapperRef = ref<HTMLDivElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const isComposing = ref(false)

    const spec = computed(() => parseMask(props.mask, props.tokens))
    const isControlled = computed(() => props.modelValue !== undefined)
    const innerRaw = ref(props.defaultValue ?? '')
    const rawValue = computed(() => (isControlled.value ? (props.modelValue ?? '') : innerRaw.value))
    const formatted = computed(() => formatMaskValue(rawValue.value, spec.value))
    const maskedValue = computed(() => formatted.value.maskedValue)

    watch([effectiveStatus, effectiveShakeTrigger] as const, ([newStatus]) => {
      if (newStatus === 'error' && wrapperRef.value) {
        const el = wrapperRef.value
        el.classList.remove(SHAKE_CLASS)
        void el.offsetWidth // force reflow to restart animation
        el.classList.add(SHAKE_CLASS)
      }
    })

    const commit = (raw: string, detail: MaskInputChangeDetail, previousMasked: string) => {
      if (!isControlled.value) innerRaw.value = raw
      emit('update:modelValue', raw)
      emit('change', raw, detail)
      if (detail.completed && !formatMaskValue(previousMasked, spec.value).completed) {
        emit('complete', raw, detail.maskedValue)
      }
    }

    const applyValue = (inputValue: string, caret: number) => {
      const previousMasked = maskedValue.value
      const result = applyMaskInput(inputValue, caret, spec.value, previousMasked)
      if (inputRef.value) inputRef.value.value = result.maskedValue
      commit(
        result.rawValue,
        { maskedValue: result.maskedValue, completed: result.completed },
        previousMasked
      )
      // Restore caret after Vue patches the value back
      nextTick(() => {
        if (inputRef.value) inputRef.value.setSelectionRange(result.caret, result.caret)
      })
    }

    const processInput = (target: HTMLInputElement) => {
      applyValue(target.value, target.selectionStart ?? target.value.length)
    }

    const handleInput = (event: Event) => {
      if (isComposing.value) return
      processInput(event.target as HTMLInputElement)
    }

    const handlePaste = (event: ClipboardEvent) => {
      if (props.disabled || props.readonly) return
      event.preventDefault()
      const input = event.target as HTMLInputElement
      const text = event.clipboardData?.getData('text') ?? ''
      const start = input.selectionStart ?? input.value.length
      const end = input.selectionEnd ?? input.value.length
      applyValue(input.value.slice(0, start) + text + input.value.slice(end), start + text.length)
    }

    const handleCompositionStart = () => {
      isComposing.value = true
    }

    const handleCompositionEnd = (event: Event) => {
      isComposing.value = false
      processInput(event.target as HTMLInputElement)
    }

    const handleClear = () => {
      if (!isControlled.value) innerRaw.value = ''
      emit('update:modelValue', '')
      emit('change', '', { maskedValue: '', completed: false })
      emit('clear')
      inputRef.value?.focus()
    }

    const handleFocus = (event: FocusEvent) => emit('focus', event)
    const handleBlur = (event: FocusEvent) => emit('blur', event)

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const activeError = effectiveStatus.value === 'error' && !!effectiveErrorMessage.value
      const hasSuffix = props.clearable
      const showClear =
        props.clearable && !props.disabled && !props.readonly && rawValue.value.length > 0

      const inputClasses = getInputClasses({
        size: props.size,
        status: effectiveStatus.value,
        hasPrefix: false,
        hasSuffix
      })

      const children: ReturnType<typeof h>[] = [
        h('input', {
          ...restAttrs,
          ref: inputRef,
          class: inputClasses,
          type: 'text',
          value: maskedValue.value,
          placeholder: props.placeholder,
          disabled: props.disabled,
          readonly: props.readonly,
          name: props.name,
          id: props.id,
          autocomplete: props.autoComplete,
          autofocus: props.autoFocus,
          ...(effectiveStatus.value === 'error' ? { 'aria-invalid': true } : {}),
          ...(activeError ? { 'aria-describedby': errorMsgId } : {}),
          onInput: handleInput,
          onPaste: handlePaste,
          onCompositionstart: handleCompositionStart,
          onCompositionend: handleCompositionEnd,
          onFocus: handleFocus,
          onBlur: handleBlur
        })
      ]

      if (activeError) {
        children.push(
          h(
            'div',
            { id: errorMsgId, class: getInputErrorClasses(props.size) },
            effectiveErrorMessage.value
          )
        )
      } else if (showClear) {
        children.push(
          h(
            'button',
            {
              type: 'button',
              class: getInputClearButtonClasses(props.size),
              onClick: handleClear,
              'aria-label': 'Clear input',
              tabindex: -1
            },
            '✕'
          )
        )
      }

      return h(
        'div',
        {
          ref: wrapperRef,
          class: classNames(
            getInputWrapperClasses(),
            props.className,
            coerceClassValue(attrClass)
          ),
          style: mergeStyleValues(props.style, attrStyle as Record<string, unknown> | undefined)
        },
        children
      )
    }
  }
})

export default MaskInput
