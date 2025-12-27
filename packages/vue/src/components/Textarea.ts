import { defineComponent, computed, ref, watch, nextTick, h, PropType } from 'vue'
import { classNames, type TextareaSize } from '@tigercat/core'

const baseClasses = 'block w-full rounded-md border border-gray-300 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:border-[var(--tiger-primary,#2563eb)] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500'

const sizeClasses = {
  sm: 'px-2 py-1.5 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
}

export const Textarea = defineComponent({
  name: 'TigerTextarea',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<TextareaSize>,
      default: 'md',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
    rows: {
      type: Number,
      default: 3,
    },
    autoResize: {
      type: Boolean,
      default: false,
    },
    maxRows: {
      type: Number,
      default: undefined,
    },
    minRows: {
      type: Number,
      default: undefined,
    },
    maxLength: {
      type: Number,
      default: undefined,
    },
    showCount: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'input', 'change', 'focus', 'blur'],
  setup(props, { emit, attrs }) {
    const textareaRef = ref<HTMLTextAreaElement | null>(null)
    
    const textareaClasses = computed(() => {
      return classNames(
        baseClasses,
        sizeClasses[props.size],
        props.autoResize && 'resize-none',
        !props.autoResize && 'resize-y'
      )
    })

    const currentLength = computed(() => props.modelValue?.length || 0)

    const adjustHeight = () => {
      if (!props.autoResize || !textareaRef.value) return

      const textarea = textareaRef.value
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10)
      const paddingTop = parseInt(getComputedStyle(textarea).paddingTop, 10)
      const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom, 10)
      
      let newHeight = textarea.scrollHeight
      
      // Apply minRows constraint
      if (props.minRows) {
        const minHeight = lineHeight * props.minRows + paddingTop + paddingBottom
        newHeight = Math.max(newHeight, minHeight)
      }
      
      // Apply maxRows constraint
      if (props.maxRows) {
        const maxHeight = lineHeight * props.maxRows + paddingTop + paddingBottom
        newHeight = Math.min(newHeight, maxHeight)
      }
      
      textarea.style.height = `${newHeight}px`
    }

    const handleInput = (event: Event) => {
      const target = event.target as HTMLTextAreaElement
      const value = target.value
      
      emit('update:modelValue', value)
      emit('input', event)
      
      if (props.autoResize) {
        nextTick(() => adjustHeight())
      }
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

    // Watch for external value changes
    watch(() => props.modelValue, () => {
      if (props.autoResize) {
        nextTick(() => adjustHeight())
      }
    })

    // Initialize height on mount
    watch(textareaRef, (textarea) => {
      if (textarea && props.autoResize) {
        nextTick(() => adjustHeight())
      }
    })

    return () => {
      const children = [
        h('textarea', {
          ref: textareaRef,
          class: textareaClasses.value,
          value: props.modelValue,
          disabled: props.disabled,
          readonly: props.readonly,
          placeholder: props.placeholder,
          rows: props.rows,
          maxlength: props.maxLength,
          onInput: handleInput,
          onChange: handleChange,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ...attrs,
        })
      ]

      // Add character count if enabled
      if (props.showCount) {
        const countText = props.maxLength
          ? `${currentLength.value}/${props.maxLength}`
          : `${currentLength.value}`
        
        children.push(
          h('div', {
            class: 'mt-1 text-sm text-gray-500 text-right',
          }, countText)
        )
      }

      return h('div', { class: 'w-full' }, children)
    }
  },
})

export default Textarea
