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
    /**
     * Textarea value (for v-model)
     */
    modelValue: {
      type: String,
      default: '',
    },
    /**
     * Textarea size
     * @default 'md'
     */
    size: {
      type: String as PropType<TextareaSize>,
      default: 'md' as TextareaSize,
    },
    /**
     * Whether the textarea is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the textarea is readonly
     * @default false
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * Placeholder text
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Number of visible text rows
     * @default 3
     */
    rows: {
      type: Number,
      default: 3,
    },
    /**
     * Auto-resize height based on content
     * @default false
     */
    autoResize: {
      type: Boolean,
      default: false,
    },
    /**
     * Maximum number of rows (only with autoResize)
     */
    maxRows: {
      type: Number,
    },
    /**
     * Minimum number of rows (only with autoResize)
     */
    minRows: {
      type: Number,
    },
    /**
     * Maximum character length
     */
    maxLength: {
      type: Number,
    },
    /**
     * Show character count
     * @default false
     */
    showCount: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    /**
     * Emitted when value changes (for v-model)
     */
    'update:modelValue': (value: string) => typeof value === 'string',
    /**
     * Emitted on input event
     */
    input: (event: Event) => event instanceof Event,
    /**
     * Emitted on change event
     */
    change: (event: Event) => event instanceof Event,
    /**
     * Emitted on focus event
     */
    focus: (event: FocusEvent) => event instanceof FocusEvent,
    /**
     * Emitted on blur event
     */
    blur: (event: FocusEvent) => event instanceof FocusEvent,
  },
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
