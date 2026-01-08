import {
  defineComponent,
  computed,
  h,
  PropType,
  provide,
  InjectionKey,
} from 'vue';
import {
  classNames,
  getAlignClasses,
  getJustifyClasses,
  getGutterStyles,
  type Align,
  type Justify,
  type GutterSize,
} from '@tigercat/core';

interface RowContext {
  gutter?: GutterSize;
}

const RowContextKey: InjectionKey<RowContext> = Symbol('RowContext');

export const Row = defineComponent({
  name: 'TigerRow',
  props: {
    /**
     * Gutter size between columns (number or [horizontal, vertical])
     * @default 0
     */
    gutter: {
      type: [Number, Array] as PropType<GutterSize>,
      default: 0,
    },
    /**
     * Vertical alignment of columns
     * @default 'top'
     */
    align: {
      type: String as PropType<Align>,
      default: 'top' as Align,
    },
    /**
     * Horizontal alignment of columns
     * @default 'start'
     */
    justify: {
      type: String as PropType<Justify>,
      default: 'start' as Justify,
    },
    /**
     * Whether to wrap columns
     * @default true
     */
    wrap: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots, attrs }) {
    const { rowStyle } = getGutterStyles(props.gutter);

    const rowClasses = computed(() => {
      return classNames(
        'flex',
        props.wrap && 'flex-wrap',
        getAlignClasses(props.align),
        getJustifyClasses(props.justify)
      );
    });

    // Provide gutter context to Col components
    provide(RowContextKey, {
      gutter: props.gutter,
    });

    return () => {
      return h(
        'div',
        {
          ...attrs,
          class: [rowClasses.value, attrs.class],
          style: [rowStyle, attrs.style],
        },
        slots.default ? slots.default() : []
      );
    };
  },
});

// Export context key for Col component
export { RowContextKey };
