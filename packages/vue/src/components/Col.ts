import { defineComponent, computed, h, PropType, inject } from 'vue'
import {
  classNames,
  getSpanClasses,
  getOffsetClasses,
  getOrderClasses,
  getFlexClasses,
  getGutterStyles,
  type ColSpan,
  type Breakpoint,
} from '@tigercat/core'
import { RowContextKey } from './Row'

export const Col = defineComponent({
  name: 'TigerCol',
  props: {
    span: {
      type: [Number, Object] as PropType<ColSpan>,
      default: 24,
    },
    offset: {
      type: [Number, Object] as PropType<number | Partial<Record<Breakpoint, number>>>,
      default: 0,
    },
    order: {
      type: [Number, Object] as PropType<number | Partial<Record<Breakpoint, number>>>,
    },
    flex: {
      type: [String, Number] as PropType<string | number>,
    },
  },
  setup(props, { slots }) {
    // Inject gutter from Row context
    const rowContext = inject(RowContextKey, {})
    const { colStyle } = getGutterStyles(rowContext.gutter || 0)

    const colClasses = computed(() => {
      return classNames(
        getSpanClasses(props.span),
        getOffsetClasses(props.offset),
        getOrderClasses(props.order),
        getFlexClasses(props.flex)
      )
    })

    return () => {
      return h(
        'div',
        {
          class: colClasses.value,
          style: colStyle,
        },
        slots.default ? slots.default() : []
      )
    }
  },
})
