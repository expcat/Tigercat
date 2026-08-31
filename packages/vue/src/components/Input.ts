import {
  defineComponent,
  computed,
  ref,
  watch,
  h,
  inject,
  getCurrentInstance,
  useId,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeAriaDescribedBy,
  callUnknownEventHandler,
  getInputFieldClasses,
  getInputWrapperClasses,
  getInputAffixClasses,
  getInputErrorClasses,
  getInputClearButtonClasses,
  getInputPasswordToggleClasses,
  getInputCountClasses,
  formatInputCountText,
  parseInputValue,
  runShakeAnimation,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  getInputLabels,
  resolveInputTrailingLayout,
  type ComponentSize,
  type InputType,
  type InputStatus
} from '@expcat/tigercat-core'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { useTigerConfig } from './ConfigProvider'
import { Icon } from './Icon'

export interface VueInputProps {
  modelValue?: string | number
  size?: ComponentSize
  type?: InputType
  status?: InputStatus
  errorMessage?: string
  prefix?: string
  suffix?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  maxLength?: number
  minLength?: number
  name?: string
  id?: string
  autoComplete?: string
  autoFocus?: boolean
  clearable?: boolean
  showPassword?: boolean
  showCount?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Input = defineComponent({
  name: 'TigerInput',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number>
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md'
    },
    type: {
      type: String as PropType<InputType>,
      default: 'text'
    },
    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    },
    errorMessage: String,
    prefix: String,
    suffix: String,
    placeholder: {
      type: String,
      default: ''
    },
    disabled: Boolean,
    readonly: Boolean,
    required: Boolean,
    maxLength: Number,
    minLength: Number,
    name: String,
    id: String,
    autoComplete: String,
    autoFocus: Boolean,
    clearable: Boolean,
    showPassword: Boolean,
    showCount: Boolean,
    _shakeTrigger: {
      type: Number,
      default: undefined
    },
    className: String,
    style: {
      type: Object as PropType<Record<string, string | number>>
    }
  },
  emits: {
    'update:modelValue': null,
    input: null,
    change: null,
    focus: null,
    blur: null,
    clear: null
  },
  setup(props, { emit, attrs, slots, expose }) {
    const instance = getCurrentInstance()
    const config = useTigerConfig()
    const labels = computed(() => getInputLabels(config.value.locale))
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const inGroup = computed(() => inputGroup != null)
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
    const effectiveErrorMessage = computed(() => props.errorMessage)
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
    const localValue = ref<string | number>(
      props.modelValue ??
        (typeof formValue.value === 'string' || typeof formValue.value === 'number'
          ? formValue.value
          : '')
    )
    const passwordVisible = ref(false)
    const errorMsgId = `tiger-input-error-${useId()}`

    expose({
      focus: () => inputRef.value?.focus(),
      input: inputRef
    })

    watch(
      () => [props.modelValue, formValue.value] as const,
      ([modelValue, controlValue]) => {
        const source =
          modelValue !== undefined
            ? modelValue
            : typeof controlValue === 'string' || typeof controlValue === 'number'
              ? controlValue
              : undefined
        if (source === undefined) return
        if (source !== localValue.value) {
          localValue.value = source
        }
      }
    )

    watch(
      [effectiveStatus, effectiveShakeTrigger] as const,
      ([newStatus], oldValue) => {
        if (oldValue === undefined) return
        if (newStatus === 'error') runShakeAnimation(wrapperRef.value)
      },
      { flush: 'post' }
    )

    const handleAnimationEnd = () => {
      wrapperRef.value?.classList.remove(SHAKE_CLASS)
    }

    const hasPrefix = computed(() => !!slots.prefix || !!props.prefix)
    const hasCustomSuffix = computed(() => !!slots.suffix || !!props.suffix)
    const activeError = computed(
      () => effectiveStatus.value === 'error' && !!effectiveErrorMessage.value
    )

    const effectiveType = computed(() => {
      if (props.showPassword && props.type === 'password') {
        return passwordVisible.value ? 'text' : 'password'
      }
      return props.type
    })

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      const value = parseInputValue(target, props.type)
      localValue.value = value
      emit('update:modelValue', value)
      emit('input', event)
      formItemControl?.onChange(value)
    }

    const handleChange = (event: Event) => emit('change', event)
    const handleFocus = (event: FocusEvent) => emit('focus', event)
    const handleBlur = (event: FocusEvent) => {
      formItemControl?.onBlur()
      emit('blur', event)
    }

    const focusInput = () => {
      inputRef.value?.focus()
    }

    const handleClear = () => {
      localValue.value = ''
      emit('update:modelValue', '')
      emit('clear')
      formItemControl?.onChange('')
      focusInput()
    }

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value
      focusInput()
    }

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const currentValStr = String(localValue.value)
      const trailing = resolveInputTrailingLayout({
        clearable: props.clearable,
        showPassword: props.showPassword,
        type: props.type,
        disabled: effectiveDisabled.value,
        readOnly: props.readonly,
        valueLength: currentValStr.length,
        hasCustomSuffix: hasCustomSuffix.value
      })
      const hasExtras = activeError.value || props.showCount
      const inputClasses = getInputFieldClasses({
        size: effectiveSize.value,
        status: effectiveStatus.value,
        hasPrefix: hasPrefix.value,
        hasSuffix: trailing.hasSuffix,
        hasDualSuffix: trailing.hasDualSuffix,
        hasTripleSuffix: trailing.hasTripleSuffix
      })

      const suffixNodes: ReturnType<typeof h>[] = []

      if (trailing.showClear) {
        suffixNodes.push(
          h(
            'button',
            {
              type: 'button',
              class: getInputClearButtonClasses(effectiveSize.value, {
                offsetSlots: trailing.clearOffsetSlots
              }),
              onMousedown: (event: MouseEvent) => event.preventDefault(),
              onClick: handleClear,
              'aria-label': labels.value.clearAriaLabel
            },
            [h(Icon, { name: 'close', size: 'sm', 'aria-hidden': true })]
          )
        )
      }
      if (trailing.showPasswordToggle) {
        suffixNodes.push(
          h(
            'button',
            {
              type: 'button',
              class: getInputPasswordToggleClasses(effectiveSize.value, {
                offsetSlots: trailing.passwordOffsetSlots
              }),
              onMousedown: (event: MouseEvent) => event.preventDefault(),
              onClick: togglePasswordVisibility,
              'aria-label': passwordVisible.value
                ? labels.value.hidePasswordAriaLabel
                : labels.value.showPasswordAriaLabel
            },
            [
              h(Icon, {
                name: passwordVisible.value ? 'eye-off' : 'eye',
                size: 'sm',
                'aria-hidden': true
              })
            ]
          )
        )
      }
      if (trailing.showCustomSuffix) {
        suffixNodes.push(
          h(
            'div',
            {
              class: getInputAffixClasses('suffix', effectiveSize.value, {
                offsetSlots: trailing.suffixOffsetSlots
              })
            },
            slots.suffix ? slots.suffix() : props.suffix
          )
        )
      }

      const wrapperChildren = [
        hasPrefix.value &&
          h(
            'div',
            { class: getInputAffixClasses('prefix', effectiveSize.value) },
            slots.prefix ? slots.prefix() : props.prefix
          ),
        h('input', {
          ...restAttrs,
          ref: inputRef,
          class: inputClasses,
          type: effectiveType.value,
          value: localValue.value,
          placeholder: props.placeholder,
          disabled: effectiveDisabled.value,
          readonly: props.readonly,
          required: props.required,
          maxlength: props.maxLength,
          minlength: props.minLength,
          name: effectiveName.value,
          id: effectiveId.value,
          autocomplete: props.autoComplete,
          autofocus: props.autoFocus,
          ...(effectiveStatus.value === 'error' ? { 'aria-invalid': true } : {}),
          ...(formItemControl?.required.value ? { 'aria-required': true } : {}),
          'aria-describedby': mergeAriaDescribedBy(
            mergeAriaDescribedBy(
              restAttrs['aria-describedby'] as string | undefined,
              activeError.value ? errorMsgId : undefined
            ),
            formItemControl?.describedBy.value
          ),
          onInput: (event: Event) => {
            handleInput(event)
            callUnknownEventHandler(restAttrs.onInput, event)
          },
          onChange: (event: Event) => {
            handleChange(event)
            callUnknownEventHandler(restAttrs.onChange, event)
          },
          onFocus: (event: FocusEvent) => {
            handleFocus(event)
            callUnknownEventHandler(restAttrs.onFocus, event)
          },
          onBlur: (event: FocusEvent) => {
            handleBlur(event)
            callUnknownEventHandler(restAttrs.onBlur, event)
          }
        }),
        ...suffixNodes
      ]

      const chromeNode = h(
        'div',
        {
          ref: wrapperRef,
          [TIGER_CHROME_ATTR]: '',
          class: classNames(
            getInputWrapperClasses(effectiveStatus.value, {
              inGroup: inGroup.value && !hasExtras
            }),
            !hasExtras ? props.className : undefined,
            !hasExtras ? coerceClassValue(attrClass) : undefined
          ),
          style: !hasExtras ? [attrStyle, props.style] : undefined,
          onAnimationend: handleAnimationEnd
        },
        wrapperChildren
      )

      const extras: ReturnType<typeof h>[] = []
      if (activeError.value) {
        extras.push(
          h(
            'div',
            {
              id: errorMsgId,
              class: getInputErrorClasses(effectiveSize.value),
              'aria-live': 'polite'
            },
            effectiveErrorMessage.value
          )
        )
      }
      if (props.showCount) {
        const count = currentValStr.length
        extras.push(
          h(
            'div',
            {
              class: getInputCountClasses(props.maxLength !== undefined && count > props.maxLength)
            },
            formatInputCountText(count, props.maxLength)
          )
        )
      }

      if (!hasExtras) return chromeNode

      return h(
        'div',
        {
          class: classNames(
            inGroup.value ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
            props.className,
            coerceClassValue(attrClass)
          ),
          style: [attrStyle, props.style]
        },
        [chromeNode, ...extras]
      )
    }
  }
})

export default Input
