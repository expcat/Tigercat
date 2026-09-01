import {
  defineComponent,
  computed,
  ref,
  watch,
  onMounted,
  nextTick,
  h,
  inject,
  getCurrentInstance,
  useId,
  PropType
} from 'vue'
import {
  autoResizeTextarea,
  clearTextareaAutoResize,
  classNames,
  coerceClassValue,
  callUnknownEventHandler,
  formatInputCountText,
  getInputClasses,
  getInputCountClasses,
  getInputErrorClasses,
  mergeAriaDescribedBy,
  mergeStyleValues,
  runShakeAnimation,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export interface VueTextareaProps {
  modelValue?: string
  size?: ComponentSize
  status?: InputStatus
  errorMessage?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  rows?: number
  autoResize?: boolean
  maxRows?: number
  minRows?: number
  maxLength?: number
  minLength?: number
  name?: string
  id?: string
  autoComplete?: string
  autoFocus?: boolean
  showCount?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Textarea = defineComponent({
  name: 'TigerTextarea',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md' as ComponentSize
    },
    status: {
      type: String as PropType<InputStatus>,
      default: 'default'
    },
    errorMessage: String,
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    rows: {
      type: Number,
      default: 3
    },
    autoResize: {
      type: Boolean,
      default: false
    },
    maxRows: {
      type: Number
    },
    minRows: {
      type: Number
    },
    maxLength: {
      type: Number
    },
    minLength: {
      type: Number
    },
    name: {
      type: String
    },
    id: {
      type: String
    },
    autoComplete: {
      type: String
    },
    autoFocus: Boolean,
    showCount: {
      type: Boolean,
      default: false
    },
    _shakeTrigger: {
      type: Number,
      default: undefined
    },
    className: {
      type: String
    },
    style: {
      type: Object as PropType<Record<string, string | number>>
    }
  },
  emits: {
    'update:modelValue': null,
    input: null,
    change: null,
    focus: null,
    blur: null
  },
  setup(props, { emit, attrs, expose }) {
    const instance = getCurrentInstance()
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
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const formValue = computed(() => formItemControl?.value.value)
    const effectiveShakeTrigger = computed(
      () => props._shakeTrigger ?? formItemControl?.shakeTrigger.value
    )
    const textareaRef = ref<HTMLTextAreaElement | null>(null)
    const errorMsgId = `tiger-textarea-error-${useId()}`
    const localValue = ref<string>(
      props.modelValue ?? (typeof formValue.value === 'string' ? formValue.value : '')
    )

    expose({
      focus: () => textareaRef.value?.focus(),
      textarea: textareaRef
    })

    watch(
      () => [props.modelValue, formValue.value] as const,
      ([modelValue, controlValue]) => {
        const source =
          modelValue !== undefined
            ? modelValue
            : typeof controlValue === 'string'
              ? controlValue
              : undefined
        if (source === undefined) return
        if (source !== localValue.value) localValue.value = source
      }
    )

    const activeError = computed(() => effectiveStatus.value === 'error' && !!props.errorMessage)
    const hasExtras = computed(() => activeError.value || props.showCount)
    const resolvedMinRows = computed(() => props.minRows ?? props.rows)

    const textareaClasses = computed(() =>
      classNames(
        'block',
        getInputClasses({
          size: effectiveSize.value,
          status: effectiveStatus.value,
          inGroup: inGroup.value && !hasExtras.value
        }),
        props.autoResize ? 'resize-none' : 'resize-y',
        !hasExtras.value ? props.className : undefined,
        !hasExtras.value ? coerceClassValue(attrs.class) : undefined
      )
    )

    const currentLength = computed(() => localValue.value.length)

    const adjustHeight = () => {
      if (!textareaRef.value) return
      if (!props.autoResize) {
        clearTextareaAutoResize(textareaRef.value)
        return
      }
      autoResizeTextarea(textareaRef.value, {
        minRows: resolvedMinRows.value,
        maxRows: props.maxRows
      })
    }

    const handleInput = (event: Event) => {
      const target = event.target as HTMLTextAreaElement
      const value = target.value
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

    watch(
      [localValue, () => props.autoResize, resolvedMinRows, () => props.maxRows, () => props.rows],
      () => {
        nextTick(adjustHeight)
      }
    )

    watch(
      [effectiveStatus, effectiveShakeTrigger] as const,
      ([newStatus], oldValue) => {
        if (oldValue === undefined) return
        if (newStatus === 'error') runShakeAnimation(textareaRef.value)
      },
      { flush: 'post' }
    )

    onMounted(() => {
      nextTick(adjustHeight)
    })

    return () => {
      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs
      const field = h('textarea', {
        ...restAttrs,
        ref: textareaRef,
        class: textareaClasses.value,
        style: mergeStyleValues(attrStyle, props.style),
        value: localValue.value,
        disabled: effectiveDisabled.value,
        readonly: props.readonly,
        required: props.required || Boolean(formItemControl?.required.value),
        placeholder: props.placeholder,
        rows: props.rows,
        maxlength: props.maxLength,
        minlength: props.minLength,
        name: effectiveName.value,
        id: effectiveId.value,
        autocomplete: props.autoComplete,
        autofocus: props.autoFocus,
        [TIGER_CHROME_ATTR]: '',
        ...(effectiveStatus.value === 'error' ? { 'aria-invalid': true } : {}),
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
        },
        onAnimationend: () => textareaRef.value?.classList.remove(SHAKE_CLASS)
      })

      if (!hasExtras.value) return field

      const extras: ReturnType<typeof h>[] = [field]
      if (activeError.value) {
        extras.push(
          h(
            'div',
            {
              id: errorMsgId,
              class: getInputErrorClasses(effectiveSize.value),
              'aria-live': 'polite'
            },
            props.errorMessage
          )
        )
      }
      if (props.showCount) {
        extras.push(
          h(
            'div',
            {
              class: getInputCountClasses(
                props.maxLength !== undefined && currentLength.value > props.maxLength
              )
            },
            formatInputCountText(currentLength.value, props.maxLength)
          )
        )
      }

      return h(
        'div',
        {
          class: classNames(
            inGroup.value ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
            props.className,
            coerceClassValue(attrClass)
          )
        },
        extras
      )
    }
  }
})

export default Textarea
