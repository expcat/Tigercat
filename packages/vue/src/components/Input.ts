import { defineComponent, computed, ref, watch, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getInputClasses,
  getInputWrapperClasses,
  getInputAffixClasses,
  getInputErrorClasses,
  getInputClearButtonClasses,
  getInputPasswordToggleClasses,
  getInputCountClasses,
  parseInputValue,
  injectShakeStyle,
  SHAKE_CLASS,
  type InputSize,
  type InputType,
  type InputStatus
} from '@expcat/tigercat-core'

let inputIdCounter = 0

export interface VueInputProps {
  modelValue?: string | number
  size?: InputSize
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
      type: String as PropType<InputSize>,
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
    const inputRef = ref<HTMLInputElement | null>(null)
    const wrapperRef = ref<HTMLDivElement | null>(null)
    const localValue = ref<string | number>(props.modelValue ?? '')
    const passwordVisible = ref(false)
    const instanceId = ++inputIdCounter
    const errorMsgId = `tiger-input-error-${instanceId}`

    // Sync localValue with modelValue prop
    watch(
      () => props.modelValue,
      (newValue) => {
        const next = newValue ?? ''
        if (next !== localValue.value) {
          localValue.value = next
        }
      }
    )

    // Trigger shake animation via direct DOM manipulation for reliable re-trigger
    watch([() => props.status, () => props._shakeTrigger] as const, ([newStatus]) => {
      if (newStatus === 'error' && wrapperRef.value) {
        const el = wrapperRef.value
        el.classList.remove(SHAKE_CLASS)
        void el.offsetWidth // force reflow to restart animation
        el.classList.add(SHAKE_CLASS)
      }
    })

    const handleAnimationEnd = () => {
      wrapperRef.value?.classList.remove(SHAKE_CLASS)
    }

    const hasPrefix = computed(() => !!slots.prefix || !!props.prefix)
    const hasSuffix = computed(
      () => !!slots.suffix || !!props.suffix || props.clearable || props.showPassword
    )
    const activeError = computed(() => props.status === 'error' && !!props.errorMessage)

    const inputClasses = computed(() =>
      getInputClasses({
        size: props.size,
        status: props.status,
        hasPrefix: hasPrefix.value,
        hasSuffix: hasSuffix.value
      })
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
    }

    const handleChange = (event: Event) => emit('change', event)
    const handleFocus = (event: FocusEvent) => emit('focus', event)
    const handleBlur = (event: FocusEvent) => emit('blur', event)

    const handleClear = () => {
      localValue.value = ''
      emit('update:modelValue', '')
      emit('clear')
      inputRef.value?.focus()
    }

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value
    }

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const currentValStr = String(localValue.value)
      const showClear =
        props.clearable && !props.disabled && !props.readonly && currentValStr.length > 0
      const showPasswordToggle = props.showPassword && props.type === 'password' && !props.disabled

      const suffixNodes: ReturnType<typeof h>[] = []

      if (activeError.value) {
        suffixNodes.push(
          h('div', { id: errorMsgId, class: getInputErrorClasses(props.size) }, props.errorMessage)
        )
      } else {
        if (showClear) {
          suffixNodes.push(
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
        if (showPasswordToggle) {
          suffixNodes.push(
            h(
              'button',
              {
                type: 'button',
                class: getInputPasswordToggleClasses(props.size),
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
              { class: getInputAffixClasses('suffix', props.size) },
              slots.suffix ? slots.suffix() : props.suffix
            )
          )
        }
      }

      const wrapperChildren = [
        hasPrefix.value &&
          h(
            'div',
            { class: getInputAffixClasses('prefix', props.size) },
            slots.prefix ? slots.prefix() : props.prefix
          ),
        h('input', {
          ...restAttrs,
          ref: inputRef,
          class: inputClasses.value,
          type: effectiveType.value,
          value: localValue.value,
          placeholder: props.placeholder,
          disabled: props.disabled,
          readonly: props.readonly,
          required: props.required,
          maxlength: props.maxLength,
          minlength: props.minLength,
          name: props.name,
          id: props.id,
          autocomplete: props.autoComplete,
          autofocus: props.autoFocus,
          ...(props.status === 'error' ? { 'aria-invalid': true } : {}),
          ...(activeError.value ? { 'aria-describedby': errorMsgId } : {}),
          onInput: handleInput,
          onChange: handleChange,
          onFocus: handleFocus,
          onBlur: handleBlur
        }),
        ...suffixNodes
      ]

      const nodes = [
        h(
          'div',
          {
            ref: wrapperRef,
            class: classNames(
              getInputWrapperClasses(),
              props.className,
              coerceClassValue(attrClass)
            ),
            style: [attrStyle, props.style],
            onAnimationend: handleAnimationEnd
          },
          wrapperChildren
        )
      ]

      if (props.showCount) {
        const count = currentValStr.length
        const isOver = props.maxLength !== undefined && count > props.maxLength
        const countText =
          props.maxLength !== undefined ? `${count} / ${props.maxLength}` : `${count}`
        nodes.push(h('div', { class: getInputCountClasses(isOver) }, countText))
      }

      return nodes.length === 1 ? nodes[0] : h('div', null, nodes)
    }
  }
})

export default Input
