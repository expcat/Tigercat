import { defineComponent, computed, h, PropType, inject } from 'vue'
import {
  classNames,
  getColMergedStyleVars,
  getSpanClasses,
  getOffsetClasses,
  getOrderClasses,
  getFlexClasses,
  getGutterStyles,
  type ColSpan,
  type Breakpoint,
  type ColProps as CoreColProps
} from '@expcat/tigercat-core'
import { RowContextKey } from './Row'

export interface VueColProps extends CoreColProps {}

export const Col = defineComponent({
  name: 'TigerCol',
  props: {
    /** Column span (1-24) or responsive object @default 24 */
    span: {
      type: [Number, Object] as PropType<ColSpan>,
      default: 24
    },
    /** Column offset (0-24) or responsive object @default 0 */
    offset: {
      type: [Number, Object] as PropType<number | Partial<Record<Breakpoint, number>>>,
      default: 0
    },
    /** Column order or responsive object */
    order: {
      type: [Number, Object] as PropType<number | Partial<Record<Breakpoint, number>>>
    },
    /** Flex layout style */
    flex: {
      type: [String, Number] as PropType<string | number>
    }
  },
  setup(props, { slots, attrs }) {
    const rowContext = inject(RowContextKey, null)
    const gutter = computed(() => rowContext?.gutter.value ?? 0)

    const isFlexSpanMode = computed(() => props.flex !== undefined && props.span === 0)

    const colClasses = computed(() =>
      classNames(
        isFlexSpanMode.value ? '' : getSpanClasses(props.span),
        getOffsetClasses(props.offset),
        getOrderClasses(props.order),
        getFlexClasses(props.flex)
      )
    )

    const colMergedStyle = computed(() => ({
      ...getGutterStyles(gutter.value).colStyle,
      ...getColMergedStyleVars(
        isFlexSpanMode.value ? undefined : props.span,
        props.offset,
        props.order,
        props.flex
      )
    }))

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: [colClasses.value, attrs.class],
          style: [colMergedStyle.value, attrs.style]
        },
        slots.default?.()
      )
  }
})
