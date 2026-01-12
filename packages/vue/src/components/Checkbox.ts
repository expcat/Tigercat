import {
  defineComponent,
  computed,
  h,
  ref,
  watch,
  inject,
  type PropType,
} from 'vue';
import { classNames, coerceClassValue } from '@tigercat/core';
import {
  getCheckboxClasses,
  getCheckboxLabelClasses,
  type CheckboxSize,
} from '@tigercat/core';
import type { ComputedRef } from 'vue';
import { CheckboxGroupKey, type CheckboxGroupContext } from './CheckboxGroup';

export interface VueCheckboxProps {
  modelValue?: boolean | null;
  value?: string | number | boolean;
  size?: CheckboxSize;
  disabled?: boolean;
  indeterminate?: boolean;
  defaultChecked?: boolean;
  className?: string;
  style?: Record<string, string | number>;
}

export const Checkbox = defineComponent({
  name: 'TigerCheckbox',
  inheritAttrs: false,
  props: {
    /**
     * Checkbox value in controlled mode (v-model)
     */
    modelValue: {
      type: [Boolean, null] as PropType<boolean | null>,
      default: null,
    },
    /**
     * Checkbox value (for use in checkbox groups)
     */
    value: {
      type: [String, Number, Boolean] as PropType<string | number | boolean>,
    },
    /**
     * Checkbox size
     */
    size: {
      type: String as PropType<CheckboxSize>,
    },
    /**
     * Whether the checkbox is disabled
     */
    disabled: {
      type: Boolean,
    },
    /**
     * Whether the checkbox is in indeterminate state
     * @default false
     */
    indeterminate: {
      type: Boolean,
      default: false,
    },
    /**
     * Default checked state (uncontrolled mode)
     * @default false
     */
    defaultChecked: {
      type: Boolean,
      default: false,
    },

    /**
     * Additional CSS classes (applied to root element)
     */
    className: {
      type: String,
    },

    /**
     * Inline styles (applied to root element)
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
    },
  },
  emits: {
    /**
     * Emitted when checked state changes (for v-model)
     */
    'update:modelValue': (value: boolean) => typeof value === 'boolean',
    /**
     * Emitted when checked state changes
     */
    change: (value: boolean, event: Event) =>
      typeof value === 'boolean' && event instanceof Event,
  },
  setup(props, { slots, emit, attrs }) {
    // Get group context if inside CheckboxGroup
    const groupContextRef = inject<ComputedRef<CheckboxGroupContext> | null>(
      CheckboxGroupKey,
      null
    );

    const groupContext = computed(() => groupContextRef?.value);

    // Internal state for uncontrolled mode
    const internalChecked = ref(props.defaultChecked);

    // Determine if controlled or uncontrolled
    const isControlled = computed(() => props.modelValue !== null);

    // Determine effective size and disabled state
    const effectiveSize = computed(
      () => props.size || groupContext.value?.size || 'md'
    );
    const effectiveDisabled = computed(() => {
      if (props.disabled !== undefined) return props.disabled;
      return groupContext.value?.disabled || false;
    });

    // Current checked state
    const checked = computed(() => {
      // If in a group and has a value, check if value is in group's selected values
      if (groupContext.value && props.value !== undefined) {
        return groupContext.value.value.includes(props.value);
      }
      return isControlled.value ? props.modelValue : internalChecked.value;
    });

    const checkboxRef = ref<HTMLInputElement | null>(null);

    watch(
      () => [checkboxRef.value, props.indeterminate] as const,
      ([el]) => {
        if (el) el.indeterminate = props.indeterminate;
      },
      { immediate: true }
    );

    const handleChange = (event: Event) => {
      if (effectiveDisabled.value) return;

      const target = event.target as HTMLInputElement;
      const newValue = target.checked;

      // If in a group, update group value
      if (groupContext.value && props.value !== undefined) {
        groupContext.value.updateValue(props.value, newValue);
      } else {
        // Update internal state if uncontrolled
        if (!isControlled.value) {
          internalChecked.value = newValue;
        }

        emit('update:modelValue', newValue);
        emit('change', newValue, event);
      }
    };

    return () => {
      const checkboxClasses = getCheckboxClasses(
        effectiveSize.value,
        effectiveDisabled.value
      );

      const rootStyle = [attrs.style, props.style];
      const rootClass = classNames(
        props.className,
        coerceClassValue(attrs.class)
      );

      const { class: _class, style: _style, ...restAttrs } = attrs;

      const checkboxElement = h('input', {
        ref: checkboxRef,
        type: 'checkbox',
        class: checkboxClasses,
        checked: checked.value,
        disabled: effectiveDisabled.value,
        value: props.value,
        onChange: handleChange,
        ...restAttrs,
      });

      // If there's no label content, return just the checkbox
      if (!slots.default) {
        return h('input', {
          ref: checkboxRef,
          type: 'checkbox',
          class: classNames(checkboxClasses, rootClass),
          style: rootStyle,
          checked: checked.value,
          disabled: effectiveDisabled.value,
          value: props.value,
          onChange: handleChange,
          ...restAttrs,
        });
      }

      // Return label with checkbox and content
      const labelClasses = getCheckboxLabelClasses(
        effectiveSize.value,
        effectiveDisabled.value
      );
      return h(
        'label',
        { class: classNames(labelClasses, rootClass), style: rootStyle },
        [checkboxElement, h('span', { class: 'ml-2' }, slots.default())]
      );
    };
  },
});

export default Checkbox;
