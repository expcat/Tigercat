import { defineComponent, computed, h, PropType } from 'vue';
import {
  classNames,
  getButtonVariantClasses,
  type ButtonVariant,
  type ButtonSize,
} from '@tigercat/core';

const baseClasses =
  'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const LoadingSpinner = h(
  'svg',
  {
    class: 'animate-spin h-4 w-4',
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
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
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const buttonClasses = computed(() => {
      return classNames(
        baseClasses,
        getButtonVariantClasses(props.variant),
        sizeClasses[props.size],
        (props.disabled || props.loading) && 'cursor-not-allowed opacity-60',
        props.block && 'w-full'
      );
    });

    const handleClick = (event: MouseEvent) => {
      if (!props.disabled && !props.loading) {
        emit('click', event);
      }
    };

    const callForwardedOnClick = (event: MouseEvent) => {
      const forwarded = (attrs as { onClick?: unknown }).onClick;
      if (!forwarded) return;

      if (Array.isArray(forwarded)) {
        for (const fn of forwarded) {
          if (typeof fn === 'function') {
            fn(event);
          }
        }
        return;
      }

      if (typeof forwarded === 'function') {
        forwarded(event);
      }
    };

    return () => {
      const children = [];

      const attrsWithoutClass: Record<string, unknown> = { ...attrs };
      const attrsClass = (attrsWithoutClass as { class?: unknown }).class;
      delete (attrsWithoutClass as { class?: unknown }).class;

      if (props.loading) {
        children.push(h('span', { class: 'mr-2' }, LoadingSpinner));
      }

      if (slots.default) {
        children.push(slots.default());
      }

      return h(
        'button',
        {
          class: [buttonClasses.value, attrsClass],
          disabled: props.disabled || props.loading,
          type: 'button',
          onClick: (event: MouseEvent) => {
            handleClick(event);
            callForwardedOnClick(event);
          },
          ...attrsWithoutClass,
        },
        children
      );
    };
  },
});

export default Button;
