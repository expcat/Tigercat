import { defineComponent, computed, h, PropType, inject } from 'vue';
import {
  classNames,
  getSpanClasses,
  getOffsetClasses,
  getOrderClasses,
  getFlexClasses,
  getGutterStyles,
  type ColSpan,
  type Breakpoint,
  type ColProps as CoreColProps,
} from '@tigercat/core';
import { RowContextKey } from './Row';

export interface VueColProps extends CoreColProps {}

export const Col = defineComponent({
  name: 'TigerCol',
  props: {
    /**
     * Column span (1-24) or responsive object
     * @default 24
     */
    span: {
      type: [Number, Object] as PropType<ColSpan>,
      default: 24,
    },
    /**
     * Column offset (0-24) or responsive object
     * @default 0
     */
    offset: {
      type: [Number, Object] as PropType<
        number | Partial<Record<Breakpoint, number>>
      >,
      default: 0,
    },
    /**
     * Column order or responsive object
     */
    order: {
      type: [Number, Object] as PropType<
        number | Partial<Record<Breakpoint, number>>
      >,
    },
    /**
     * Flex layout style
     */
    flex: {
      type: [String, Number] as PropType<string | number>,
    },
  },
  setup(props, { slots, attrs }) {
    // Inject gutter from Row context
    const rowContext = inject(RowContextKey, null);
    const gutter = computed(() => rowContext?.gutter.value ?? 0);
    const colStyle = computed(() => getGutterStyles(gutter.value).colStyle);

    const colClasses = computed(() => {
      return classNames(
        getSpanClasses(props.span),
        getOffsetClasses(props.offset),
        getOrderClasses(props.order),
        getFlexClasses(props.flex)
      );
    });

    return () => {
      return h(
        'div',
        {
          ...attrs,
          class: [colClasses.value, attrs.class],
          style: [colStyle.value, attrs.style],
        },
        slots.default ? slots.default() : []
      );
    };
  },
});
