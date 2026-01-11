import { defineComponent, h, PropType, computed } from 'vue';
import { classNames, layoutFooterClasses } from '@tigercat/core';

export interface VueFooterProps {
  className?: string;
  height?: string;
  style?: Record<string, string | number>;
}

export const Footer = defineComponent({
  name: 'TigerFooter',
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
     * Footer height (CSS value)
     * @default 'auto'
     */
    height: {
      type: String as PropType<string>,
      default: 'auto',
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
    const footerClasses = computed(() =>
      classNames(
        layoutFooterClasses,
        props.className,
        (attrs as Record<string, unknown>).class as any
      )
    );

    return () => {
      return h(
        'footer',
        {
          ...attrs,
          class: footerClasses.value,
          style: [
            (attrs as Record<string, unknown>).style as any,
            props.style as any,
            { height: props.height },
          ],
        },
        slots.default?.()
      );
    };
  },
});

export default Footer;
