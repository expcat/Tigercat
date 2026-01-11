import { defineComponent, h, PropType, computed } from 'vue';
import { classNames, layoutRootClasses } from '@tigercat/core';

export interface VueLayoutProps {
  className?: string;
  style?: Record<string, string | number>;
}

export const Layout = defineComponent({
  name: 'TigerLayout',
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
    const layoutClasses = computed(() =>
      classNames(
        layoutRootClasses,
        props.className,
        (attrs as Record<string, unknown>).class as any
      )
    );

    return () => {
      return h(
        'div',
        {
          ...attrs,
          class: layoutClasses.value,
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

export default Layout;
