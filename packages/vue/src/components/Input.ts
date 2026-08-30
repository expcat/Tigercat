import { defineComponent, computed, ref, watch, h, inject, getCurrentInstance, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeAriaDescribedBy,
  getInputFieldClasses,
  getInputWrapperClasses,
  getInputAffixClasses,
  getInputErrorClasses,
  getInputClearButtonClasses,
  getInputPasswordToggleClasses,
  getInputCountClasses,
  parseInputValue,
  injectShakeStyle,
  SHAKE_CLASS,
  type ComponentSize,
  type InputType,
  type InputStatus
} from '@expcat/tigercat-core'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

let inputIdCounter = 0

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
    /**
     * Input value (for v-model)
     */
    modelValue: {
      type: [String, Number] as PropType<string | number>
    },
    /**
     * Input size
     * @default 'md'
     */
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md'
    },
    /**
     * Input type
     * @default 'text'
     */
    type: {
      type: String as PropType<InputType>,
      default: 'text'
    },
    /**
     * Input status
     * @default 'default'
     */
    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    },
    /**
     * Error message to default display
     */
    errorMessage: String,
    /**
     * Prefix text/icon
     */
    prefix: String,
    /**
     * Suffix text/icon
     */
    suffix: String,
    /**
     * Placeholder text
     */
    placeholder: {
      type: String,
      default: ''
    },
    /**
     * Whether the input is disabled
     */
    disabled: Boolean,
    /**
     * Whether the input is readonly
     */
    readonly: Boolean,
    /**
     * Whether the input is required
     */
    required: Boolean,
    /** Maximum length */
    maxLength: Number,
    /** Minimum length */
    minLength: Number,
    /** Input name attribute */
    name: String,
    /** Input id attribute */
    id: String,
    /** Autocomplete attribute */
    autoComplete: String,
    /**
     * Whether to autofocus on mount
     */
    autoFocus: Boolean,

    /**
     * Whether to show a clear button
     */
    clearable: Boolean,

    /**
     * Whether to show a password toggle button
     */
    showPassword: Boolean,

    /**
     * Whether to show a character count
     */
    showCount: Boolean,

    /**
     * Internal shake trigger counter (used by FormItem)
     * @internal
     */
    _shakeTrigger: {
      type: Number,
      default: undefined
    },

    /** Additional CSS classes */
    className: String,

    /**
     * Inline styles
     */
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
  setup(props, { emit, attrs, slots }) {
    injectShakeStyle()
    const instance = getCurrentInstance()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
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
    const instanceId = ++inputIdCounter
    const errorMsgId = `tiger-input-error-${instanceId}`

    // Sync localValue with modelValue prop
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

    // flush post: wrapper class now includes status chrome, which Vue would
    // otherwise patch over a pre-flush classList.add(SHAKE_CLASS).
    watch(
      [effectiveStatus, effectiveShakeTrigger] as const,
      ([newStatus]) => {
        if (newStatus === 'error' && wrapperRef.value) {
          const el = wrapperRef.value
          el.classList.remove(SHAKE_CLASS)
          void el.offsetWidth // force reflow to restart animation
          el.classList.add(SHAKE_CLASS)
        }
      },
      { flush: 'post' }
    )

    const handleAnimationEnd = () => {
      wrapperRef.value?.classList.remove(SHAKE_CLASS)
    }

    const hasPrefix = computed(() => !!slots.prefix || !!props.prefix)
    const hasSuffix = computed(
      () => !!slots.suffix || !!props.suffix || props.clearable || props.showPassword
    )
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

    const handleClear = () => {
      localValue.value = ''
      emit('update:modelValue', '')
      emit('clear')
      formItemControl?.onChange('')
      inputRef.value?.focus()
    }

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value
    }

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const currentValStr = String(localValue.value)
      const showClear =
        props.clearable && !effectiveDisabled.value && !props.readonly && currentValStr.length > 0
      const showPasswordToggle =
        props.showPassword && props.type === 'password' && !effectiveDisabled.value
      const dualSuffix = showClear && showPasswordToggle
      const inputClasses = getInputFieldClasses({
        size: effectiveSize.value,
        status: effectiveStatus.value,
        hasPrefix: hasPrefix.value,
        hasSuffix: hasSuffix.value,
        hasDualSuffix: dualSuffix
      })

      const suffixNodes: ReturnType<typeof h>[] = []

      if (showClear) {
        suffixNodes.push(
          h(
            'button',
            {
              type: 'button',
              class: getInputClearButtonClasses(
                effectiveSize.value,
                dualSuffix ? { offset: true } : undefined
              ),
              onClick: handleClear,
              'aria-label': 'Clear input',
              tabindex: -1
            },
            '✕'
          )
        )
      }
      if (showPasswordToggle) {
        suffixNodes.push(
          h(
            'button',
            {
              type: 'button',
              class: getInputPasswordToggleClasses(effectiveSize.value),
              onClick: togglePasswordVisibility,
              'aria-label': passwordVisible.value ? 'Hide password' : 'Show password',
              tabindex: -1
            },
            passwordVisible.value ? '🙈' : '👁'
          )
        )
      }
      if (!showClear && !showPasswordToggle && hasSuffix.value) {
        suffixNodes.push(
          h(
            'div',
            { class: getInputAffixClasses('suffix', effectiveSize.value) },
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
          onInput: handleInput,
          onChange: handleChange,
          onFocus: handleFocus,
          onBlur: handleBlur
        }),
        ...suffixNodes
      ]

      const chromeNode = h(
        'div',
        {
          ref: wrapperRef,
          class: classNames(
            getInputWrapperClasses(effectiveStatus.value),
            props.className,
            coerceClassValue(attrClass)
          ),
          style: [attrStyle, props.style],
          onAnimationend: handleAnimationEnd
        },
        wrapperChildren
      )

      // Extras sit below the chrome: error first, then count.
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
        const isOver = props.maxLength !== undefined && count > props.maxLength
        const countText =
          props.maxLength !== undefined ? `${count} / ${props.maxLength}` : `${count}`
        extras.push(h('div', { class: getInputCountClasses(isOver) }, countText))
      }

      return extras.length === 0
        ? chromeNode
        : h('div', { class: 'w-full' }, [chromeNode, ...extras])
    }
  }
})

export default Input
