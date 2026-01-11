import { defineComponent, computed, h, PropType } from 'vue';
import { classNames, type ContainerMaxWidth } from '@tigercat/core';

const maxWidthClasses: Record<Exclude<ContainerMaxWidth, false>, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'w-full',
};

export const Container = defineComponent({
  name: 'TigerContainer',
  inheritAttrs: false,
  props: {
    /**
     * Maximum width constraint (false for no constraint)
     * @default false
     */
    maxWidth: {
      type: [String, Boolean] as PropType<ContainerMaxWidth>,
      default: false,
    },
    /**
     * Center container horizontally
     * @default true
     */
    center: {
      type: Boolean,
      default: true,
    },
    /**
     * Add responsive horizontal padding
     * @default true
     */
    padding: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots, attrs }) {
    const containerClasses = computed(() =>
      classNames(
        'w-full',
        props.maxWidth !== false && maxWidthClasses[props.maxWidth],
        props.center && 'mx-auto',
        props.padding && 'px-4 sm:px-6 lg:px-8'
      )
    );

    return () => {
      const { class: attrsClass, style: attrsStyle, ...restAttrs } = attrs;
      return h(
        'div',
        {
          ...restAttrs,
          class: [containerClasses.value, attrsClass],
          style: attrsStyle,
        },
        slots.default?.()
      );
    };
  },
});

export default Container;
