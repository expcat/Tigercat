import {
  defineComponent,
  ref,
  provide,
  computed,
  h,
  PropType,
  watch,
  getCurrentInstance,
  type ComputedRef,
} from 'vue';
import { classNames, coerceClassValue, type RadioSize } from '@tigercat/core';

export const RadioGroupKey = Symbol('RadioGroup');

export interface RadioGroupContext {
  value: string | number | undefined;
  name: string;
  disabled: boolean;
  size: RadioSize;
  onChange: (value: string | number) => void;
}

export interface VueRadioGroupProps {
  value?: string | number;
  defaultValue?: string | number;
  name?: string;
  disabled?: boolean;
  size?: RadioSize;
  className?: string;
  style?: Record<string, string | number>;
}

export const RadioGroup = defineComponent({
  name: 'TigerRadioGroup',
  inheritAttrs: false,
  props: {
    /**
     * Selected value (for v-model:value)
     */
    value: {
      type: [String, Number] as PropType<string | number | undefined>,
    },
    /**
     * Default selected value (uncontrolled mode)
     */
    defaultValue: {
      type: [String, Number] as PropType<string | number | undefined>,
    },
    /**
     * Input name attribute for all radios
     */
    name: {
      type: String,
    },
    /**
     * Whether all radios are disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Radio size for all radios
     * @default 'md'
     */
    size: {
      type: String as PropType<RadioSize>,
      default: 'md' as RadioSize,
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
    /**
     * Emitted when value changes (for v-model:value)
     */
    'update:value': (value: string | number) =>
      typeof value === 'string' || typeof value === 'number',
    /**
     * Emitted when value changes
     */
    change: (value: string | number) =>
      typeof value === 'string' || typeof value === 'number',
  },
  setup(props, { slots, emit, attrs }) {
    const instance = getCurrentInstance();

    // Internal state for uncontrolled mode
    const internalValue = ref<string | number | undefined>(props.defaultValue);

    // Determine if controlled or uncontrolled
    const isControlled = computed(() => {
      const rawProps = instance?.vnode.props as
        | Record<string, unknown>
        | null
        | undefined;
      return (
        !!rawProps && Object.prototype.hasOwnProperty.call(rawProps, 'value')
      );
    });

    // Current value - use prop value if controlled, otherwise use internal state
    const currentValue = computed(() => {
      return isControlled.value ? props.value : internalValue.value;
    });

    // Watch for changes to defaultValue in uncontrolled mode
    watch(
      () => props.defaultValue,
      (newVal) => {
        if (!isControlled.value) {
          internalValue.value = newVal;
        }
      }
    );

    const handleChange = (value: string | number) => {
      if (props.disabled) return;

      // Update internal state if uncontrolled
      if (!isControlled.value) {
        internalValue.value = value;
      }

      // Emit events
      emit('update:value', value);
      emit('change', value);
    };

    // Generate unique name if not provided
    const generatedName = `tiger-radio-group-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 11)}`;
    const groupName = computed(() => props.name || generatedName);

    // Provide context to child Radio components (reactive)
    provide<ComputedRef<RadioGroupContext>>(
      RadioGroupKey,
      computed(() => ({
        value: currentValue.value,
        name: groupName.value,
        disabled: props.disabled,
        size: props.size,
        onChange: handleChange,
      }))
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (props.disabled) return;
      if (
        event.key !== 'ArrowDown' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'ArrowUp' &&
        event.key !== 'ArrowLeft'
      ) {
        return;
      }

      const target = event.target as HTMLElement;
      const currentInput = target.closest(
        'input[type="radio"]'
      ) as HTMLInputElement | null;
      if (!currentInput) return;

      const container = event.currentTarget as HTMLElement;
      const inputs = Array.from(
        container.querySelectorAll('input[type="radio"]')
      ) as HTMLInputElement[];

      const enabledInputs = inputs.filter((input) => !input.disabled);
      if (enabledInputs.length === 0) return;

      const currentIndex = enabledInputs.indexOf(currentInput);
      if (currentIndex === -1) return;

      event.preventDefault();

      const direction =
        event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex =
        (currentIndex + direction + enabledInputs.length) %
        enabledInputs.length;
      const nextInput = enabledInputs[nextIndex];

      nextInput.focus();
      nextInput.click();
    };

    return () => {
      const rootStyle = [attrs.style, props.style];
      const hasCustomClass = !!(props.className || attrs.class);
      const rootClass = classNames(
        props.className,
        coerceClassValue(attrs.class),
        !hasCustomClass && 'space-y-2'
      );

      const { class: _class, style: _style, ...restAttrs } = attrs;

      return h(
        'div',
        {
          ...restAttrs,
          class: rootClass,
          style: rootStyle,
          role: 'radiogroup',
          onKeydown: handleKeyDown,
        },
        slots.default?.()
      );
    };
  },
});

export default RadioGroup;
