import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  ref,
  useId,
  watch,
  type PropType
} from 'vue'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  applyMaskInput,
  callUnknownEventHandler,
  classNames,
  coerceClassValue,
  formatMaskValue,
  getInputClearButtonClasses,
  getInputErrorClasses,
  getInputFieldClasses,
  getInputLabels,
  getInputWrapperClasses,
  getMaskInputMode,
  mergeAriaDescribedBy,
  mergeStyleValues,
  parseMask,
  runShakeAnimation,
  shouldEmitMaskComplete,
  type ComponentSize,
  type InputStatus,
  type MaskInputChangeDetail,
  type MaskToken
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { Icon } from './Icon'

export type VueMaskInputProps = InstanceType<typeof MaskInput>['$props']
export type MaskInputProps = VueMaskInputProps

export const MaskInput = defineComponent({
  name: 'TigerMaskInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    mask: { type: String, required: true },
    tokens: { type: Object as PropType<Record<string, MaskToken>>, default: undefined },
    size: { type: String as PropType<ComponentSize>, default: undefined },
    status: { type: String as PropType<InputStatus>, default: undefined },
    errorMessage: String,
    placeholder: { type: String, default: '' },
    disabled: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    name: String,
    id: String,
    autoComplete: String,
    autoFocus: Boolean,
    _shakeTrigger: { type: Number, default: undefined },
    className: String,
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
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const labels = computed(() => getInputLabels(config.value.locale))
    const inGroup = computed(() => inputGroup != null)
    const effectiveSize = computed(() => props.size ?? inputGroup?.size ?? 'md')
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const formValue = computed(() => formItemControl?.value.value)
    const errorMsgId = `tiger-mask-input-error-${useId()}`

    const chromeRef = ref<HTMLDivElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const isComposing = ref(false)

    const spec = computed(() => parseMask(props.mask, props.tokens))
    const localRaw = ref(
      props.modelValue ??
        (typeof formValue.value === 'string' ? formValue.value : undefined) ??
        props.defaultValue ??
        ''
    )
    const rawValue = computed(() =>
      props.modelValue !== undefined
        ? props.modelValue
        : typeof formValue.value === 'string'
          ? formValue.value
          : localRaw.value
    )
    const formatted = computed(() => formatMaskValue(rawValue.value, spec.value))
    const maskedValue = computed(() => formatted.value.maskedValue)
    const resolvedInputMode = computed(() => getMaskInputMode(props.mask, spec.value))

    watch(
      () => [props.modelValue, formValue.value] as const,
      ([model, controlValue]) => {
        const source =
          model !== undefined ? model : typeof controlValue === 'string' ? controlValue : undefined
        if (source === undefined) return
        if (source !== localRaw.value) localRaw.value = source
      }
    )

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value, props._shakeTrigger] as const,
      (current, previous) => {
        if (!previous) return
        if (current[0] === 'error') runShakeAnimation(chromeRef.value ?? inputRef.value)
      },
      { flush: 'post' }
    )

    function commit(raw: string, detail: MaskInputChangeDetail, wasCompleted: boolean) {
      if (props.modelValue === undefined && typeof formValue.value !== 'string') {
        localRaw.value = raw
      }
      emit('update:modelValue', raw)
      emit('change', raw, detail)
      formItemControl?.onChange(raw)
      if (shouldEmitMaskComplete(wasCompleted, detail.completed)) {
        emit('complete', raw, detail.maskedValue)
      }
    }

    function applyValue(inputValue: string, caret: number) {
      const wasCompleted = formatted.value.completed
      const result = applyMaskInput(inputValue, caret, spec.value, maskedValue.value)
      if (inputRef.value) inputRef.value.value = result.maskedValue
      commit(
        result.rawValue,
        { maskedValue: result.maskedValue, completed: result.completed },
        wasCompleted
      )
      nextTick(() => {
        if (inputRef.value) inputRef.value.setSelectionRange(result.caret, result.caret)
      })
    }

    function handleInput(event: Event) {
      if (isComposing.value) return
      const target = event.target as HTMLInputElement
      applyValue(target.value, target.selectionStart ?? target.value.length)
    }

    function handlePaste(event: ClipboardEvent) {
      if (effectiveDisabled.value || props.readonly) return
      event.preventDefault()
      const input = event.target as HTMLInputElement
      const text = event.clipboardData?.getData('text') ?? ''
      const start = input.selectionStart ?? input.value.length
      const end = input.selectionEnd ?? input.value.length
      applyValue(input.value.slice(0, start) + text + input.value.slice(end), start + text.length)
    }

    function handleClear() {
      commit('', { maskedValue: '', completed: false }, formatted.value.completed)
      emit('clear')
      inputRef.value?.focus()
    }

    expose({
      focus: () => inputRef.value?.focus(),
      input: inputRef
    })

    return () => {
      const { class: attrClass, style: attrStyle, type: attrType, ...restAttrs } = attrs
      const activeError = status.value === 'error' && !!props.errorMessage
      const showClear =
        props.clearable && !effectiveDisabled.value && !props.readonly && rawValue.value.length > 0
      const hasExtras = activeError
      const describedBy = mergeAriaDescribedBy(
        mergeAriaDescribedBy(
          typeof restAttrs['aria-describedby'] === 'string'
            ? restAttrs['aria-describedby']
            : undefined,
          activeError ? errorMsgId : undefined
        ),
        formItemControl?.describedBy.value
      )
      const attrInputMode =
        typeof restAttrs.inputmode === 'string' ? restAttrs.inputmode : undefined

      const field = h('input', {
        ...restAttrs,
        ref: inputRef,
        class: getInputFieldClasses({
          size: effectiveSize.value,
          status: status.value,
          hasSuffix: showClear
        }),
        type: typeof attrType === 'string' ? attrType : 'text',
        inputmode: attrInputMode ?? resolvedInputMode.value,
        value: maskedValue.value,
        placeholder: props.placeholder,
        disabled: effectiveDisabled.value,
        readonly: props.readonly,
        id: effectiveId.value,
        autocomplete: props.autoComplete,
        autofocus: props.autoFocus,
        'aria-invalid': status.value === 'error' ? true : restAttrs['aria-invalid'],
        'aria-required': formItemControl?.required.value ? true : restAttrs['aria-required'],
        'aria-describedby': describedBy,
        onInput: (event: Event) => {
          handleInput(event)
          callUnknownEventHandler(restAttrs.onInput, event)
        },
        onPaste: handlePaste,
        onCompositionstart: () => {
          isComposing.value = true
        },
        onCompositionend: (event: Event) => {
          isComposing.value = false
          const target = event.target as HTMLInputElement
          applyValue(target.value, target.selectionStart ?? target.value.length)
        },
        onFocus: (event: FocusEvent) => emit('focus', event),
        onBlur: (event: FocusEvent) => {
          formItemControl?.onBlur()
          emit('blur', event)
        }
      })

      const chrome = h(
        'div',
        {
          ref: chromeRef,
          class: classNames(
            getInputWrapperClasses(status.value, { inGroup: inGroup.value && !hasExtras }),
            !hasExtras ? props.className : undefined,
            !hasExtras ? coerceClassValue(attrClass) : undefined
          ),
          style: !hasExtras ? mergeStyleValues(props.style, attrStyle) : undefined,
          [TIGER_CHROME_ATTR]: '',
          onAnimationend: () => chromeRef.value?.classList.remove(SHAKE_CLASS)
        },
        [
          field,
          effectiveName.value
            ? h('input', {
                type: 'hidden',
                name: effectiveName.value,
                value: rawValue.value,
                disabled: effectiveDisabled.value
              })
            : null,
          showClear
            ? h(
                'button',
                {
                  type: 'button',
                  class: getInputClearButtonClasses(effectiveSize.value),
                  onMousedown: (event: Event) => event.preventDefault(),
                  onClick: handleClear,
                  'aria-label': labels.value.clearAriaLabel,
                  tabindex: -1
                },
                [
                  h(Icon, {
                    name: 'close',
                    size: 'sm',
                    'aria-hidden': true
                  })
                ]
              )
            : null
        ]
      )

      if (!hasExtras) return chrome

      return h(
        'div',
        {
          class: classNames(
            inGroup.value ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
            props.className,
            coerceClassValue(attrClass)
          ),
          style: mergeStyleValues(props.style, attrStyle)
        },
        [
          chrome,
          activeError
            ? h(
                'div',
                {
                  id: errorMsgId,
                  class: getInputErrorClasses(effectiveSize.value),
                  'aria-live': 'polite'
                },
                props.errorMessage
              )
            : null
        ]
      )
    }
  }
})

export default MaskInput
