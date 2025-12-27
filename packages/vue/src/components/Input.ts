import { defineComponent, computed, ref, watch, h, PropType } from 'vue'
import { getInputClasses, type InputSize, type InputType } from '@tigercat/core'

export const Input = defineComponent({
  name: 'TigerInput',
  props: {
    /**
     * Input value (for v-model)
     */
    modelValue: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /**
     * Input size
     */
    size: {
      type: String as PropType<InputSize>,
      default: 'md',
    },
    /**
     * Input type
     */
    type: {
      type: String as PropType<InputType>,
      default: 'text',
    },
    /**
     * Placeholder text
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Whether the input is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the input is readonly
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the input is required
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * Maximum length
     */
    maxLength: {
      type: Number,
      default: undefined,
    },
    /**
     * Minimum length
     */
    minLength: {
      type: Number,
      default: undefined,
    },
    /**
     * Input name attribute
     */
    name: {
      type: String,
      default: undefined,
    },
    /**
     * Input id attribute
     */
    id: {
      type: String,
      default: undefined,
    },
    /**
     * Autocomplete attribute
     */
    autoComplete: {
      type: String,
      default: undefined,
    },
    /**
     * Whether to autofocus on mount
     */
    autoFocus: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'input', 'change', 'focus', 'blur'],
  setup(props, { emit, attrs }) {
    const inputRef = ref<HTMLInputElement | null>(null)
    const localValue = ref<string | number>(props.modelValue ?? '')

    // Sync localValue with modelValue prop
    watch(() => props.modelValue, (newValue) => {
      if (newValue !== undefined && newValue !== localValue.value) {
        localValue.value = newValue
      }
    })

    const inputClasses = computed(() => getInputClasses(props.size))

    /**
     * Helper to extract the correct value from input target
     * For number inputs, returns the numeric value if valid, otherwise the string value
     */
    const getInputValue = (target: HTMLInputElement): string | number => {
      return props.type === 'number' ? (Number.isNaN(target.valueAsNumber) ? target.value : target.valueAsNumber) : target.value
    }

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      const value = getInputValue(target)
      localValue.value = value
      emit('update:modelValue', value)
      emit('input', event)
    }

    const handleChange = (event: Event) => {
      emit('change', event)
    }

    const handleFocus = (event: FocusEvent) => {
      emit('focus', event)
    }

    const handleBlur = (event: FocusEvent) => {
      emit('blur', event)
    }

    return () => {
      return h('input', {
        ref: inputRef,
        class: inputClasses.value,
        type: props.type,
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
        onInput: handleInput,
        onChange: handleChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ...attrs,
      })
    }
  },
})

export default Input
