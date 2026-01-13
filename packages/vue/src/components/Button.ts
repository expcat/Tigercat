import { defineComponent, computed, h, PropType } from 'vue';
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  buttonBaseClasses,
  buttonSizeClasses,
  buttonDisabledClasses,
  getButtonVariantClasses,
  type ButtonVariant,
  type ButtonSize,
} from '@tigercat/core';

export interface VueButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: Record<string, unknown>;
}

const LoadingSpinner = h(
  'svg',
  {
    class: 'animate-spin h-4 w-4',
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
    focusable: 'false',
  },
  [
    h('circle', {
      class: 'opacity-25',
      cx: '12',
      cy: '12',
      r: '10',
      stroke: 'currentColor',
      'stroke-width': '4',
    }),
    h('path', {
      class: 'opacity-75',
      fill: 'currentColor',
      d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
    }),
  ]
);

export const Button = defineComponent({
  name: 'TigerButton',
  inheritAttrs: false,
  props: {
    /**
     * Button variant style
     * @default 'primary'
     */
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary' as ButtonVariant,
    },
    /**
     * Button size
     * @default 'md'
     */
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md' as ButtonSize,
    },
    /**
     * Whether the button is disabled
     */
    disabled: Boolean,
    /**
     * Whether the button is in loading state
     */
    loading: Boolean,

    /**
     * Whether the button should take full width of its parent
     */
    block: Boolean,

    /**
     * HTML button type
     * @default 'button'
     */
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button',
    },

    className: {
      type: String,
      default: undefined,
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined,
    },
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const buttonClasses = computed(() => {
      return classNames(
        buttonBaseClasses,
        getButtonVariantClasses(props.variant),
        buttonSizeClasses[props.size],
        (props.disabled || props.loading) && buttonDisabledClasses,
        props.block && 'w-full',
        props.className,
        coerceClassValue(attrs.class)
      );
    });

    const mergedStyle = computed(() =>
      mergeStyleValues(attrs.style, props.style)
    );

    return () => {
      type HChildren = Parameters<typeof h>[2];
      type HArrayChildren = Extract<NonNullable<HChildren>, unknown[]>;

      const children: HArrayChildren = [];

      const isDisabled = props.disabled || props.loading;
      const ariaBusy =
        attrs['aria-busy'] ?? (props.loading ? 'true' : undefined);
      const ariaDisabled =
        attrs['aria-disabled'] ?? (isDisabled ? 'true' : undefined);

      if (props.loading) {
        children.push(h('span', { class: 'mr-2' }, LoadingSpinner));
      }

      if (slots.default) {
        children.push(slots.default());
      }

      return h(
        'button',
        {
          ...attrs,
          class: buttonClasses.value,
          style: mergedStyle.value,
          'aria-busy': ariaBusy,
          'aria-disabled': ariaDisabled,
          disabled: isDisabled,
          type: props.type,
          onClick: (event: MouseEvent) => {
            if (isDisabled) return;
            emit('click', event);
          },
        },
        children
      );
    };
  },
});

export default Button;
