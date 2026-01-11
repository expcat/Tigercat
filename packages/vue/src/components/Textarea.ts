import {
  defineComponent,
  computed,
  ref,
  watch,
  nextTick,
  h,
  PropType,
} from 'vue';
import {
  autoResizeTextarea,
  classNames,
  getInputClasses,
  type TextareaSize,
} from '@tigercat/core';

export interface VueTextareaProps {
  modelValue?: string;
  size?: TextareaSize;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  rows?: number;
  autoResize?: boolean;
  maxRows?: number;
  minRows?: number;
  maxLength?: number;
  minLength?: number;
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  showCount?: boolean;
  className?: string;
  style?: Record<string, string | number>;
}

export const Textarea = defineComponent({
  name: 'TigerTextarea',
  inheritAttrs: false,
  props: {
    /**
     * Textarea value (for v-model)
     */
    modelValue: {
      type: String,
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
     * Whether the textarea is required
     * @default false
     */
    required: {
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
     * Minimum character length
     */
    minLength: {
      type: Number,
    },

    /**
     * Textarea name attribute
     */
    name: {
      type: String,
    },

    /**
     * Textarea id attribute
     */
    id: {
      type: String,
    },

    /**
     * Autocomplete attribute
     */
    autoComplete: {
      type: String,
    },

    /**
     * Whether to autofocus on mount
     */
    autoFocus: Boolean,
    /**
     * Show character count
     * @default false
     */
    showCount: {
      type: Boolean,
      default: false,
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
    },

    /**
     * Inline styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
    },
  },
  emits: {
    'update:modelValue': null,
    input: null,
    change: null,
    focus: null,
    blur: null,
  },
  setup(props, { emit, attrs }) {
    const textareaRef = ref<HTMLTextAreaElement | null>(null);

    const localValue = ref<string>(props.modelValue ?? '');

    watch(
      () => props.modelValue,
      (newValue) => {
        const next = newValue ?? '';
        if (next !== localValue.value) {
          localValue.value = next;
        }
      }
    );

    const textareaClasses = computed(() =>
      classNames(
        'block',
        getInputClasses(props.size),
        props.autoResize ? 'resize-none' : 'resize-y',
        props.className,
        attrs.class
      )
    );

    const currentLength = computed(() => localValue.value.length);

    const adjustHeight = () => {
      if (!props.autoResize || !textareaRef.value) return;
      autoResizeTextarea(textareaRef.value, {
        minRows: props.minRows,
        maxRows: props.maxRows,
      });
    };

    const handleInput = (event: Event) => {
      const target = event.target as HTMLTextAreaElement;
      const value = target.value;
      localValue.value = value;
      emit('update:modelValue', value);
      emit('input', event);

      if (props.autoResize) {
        nextTick(adjustHeight);
      }
    };

    const handleChange = (event: Event) => {
      emit('change', event);
    };

    const handleFocus = (event: FocusEvent) => {
      emit('focus', event);
    };

    const handleBlur = (event: FocusEvent) => {
      emit('blur', event);
    };

    watch(
      () => [props.modelValue, props.autoResize, props.minRows, props.maxRows],
      () => {
        if (!props.autoResize) return;
        nextTick(adjustHeight);
      }
    );

    watch(textareaRef, (textarea) => {
      if (!textarea || !props.autoResize) return;
      nextTick(adjustHeight);
    });

    return () => {
      const children = [
        h('textarea', {
          ...attrs,
          ref: textareaRef,
          class: textareaClasses.value,
          style: [attrs.style, props.style],
          value: localValue.value,
          disabled: props.disabled,
          readonly: props.readonly,
          required: props.required,
          placeholder: props.placeholder,
          rows: props.rows,
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
        }),
      ];

      // Add character count if enabled
      if (props.showCount) {
        const countText = props.maxLength
          ? `${currentLength.value}/${props.maxLength}`
          : `${currentLength.value}`;

        children.push(
          h(
            'div',
            {
              class: 'mt-1 text-sm text-gray-500 text-right',
            },
            countText
          )
        );
      }

      return h('div', { class: 'w-full' }, children);
    };
  },
});

export default Textarea;
