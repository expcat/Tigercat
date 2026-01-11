import { defineComponent, h, PropType, computed } from 'vue';
import { classNames, layoutContentClasses } from '@tigercat/core';

export interface VueContentProps {
  className?: string;
  style?: Record<string, string | number>;
}

export const Content = defineComponent({
  name: 'TigerContent',
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS classes
     */
    className: {
      type: String as PropType<string>,
      default: undefined,
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const contentClasses = computed(() =>
      classNames(
        layoutContentClasses,
        props.className,
        (attrs as Record<string, unknown>).class as any
      )
    );

    return () => {
      return h(
        'main',
        {
          ...attrs,
          class: contentClasses.value,
          style: [
            (attrs as Record<string, unknown>).style as any,
            props.style as any,
          ],
        },
        slots.default?.()
      );
    };
  },
});

export default Content;
