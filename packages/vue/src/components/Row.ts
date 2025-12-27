import { defineComponent, computed, h, PropType, provide, InjectionKey } from 'vue'
import {
  classNames,
  getAlignClasses,
  getJustifyClasses,
  getGutterStyles,
  type Align,
  type Justify,
  type GutterSize,
} from '@tigercat/core'

interface RowContext {
  gutter?: GutterSize
}

const RowContextKey: InjectionKey<RowContext> = Symbol('RowContext')

export const Row = defineComponent({
  name: 'TigerRow',
  props: {
    gutter: {
      type: [Number, Array] as PropType<GutterSize>,
      default: 0,
    },
    align: {
      type: String as PropType<Align>,
      default: 'top',
    },
    justify: {
      type: String as PropType<Justify>,
      default: 'start',
    },
    wrap: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const { rowStyle } = getGutterStyles(props.gutter)

    const rowClasses = computed(() => {
      return classNames(
        'flex',
        props.wrap && 'flex-wrap',
        getAlignClasses(props.align),
        getJustifyClasses(props.justify)
      )
    })

    // Provide gutter context to Col components
    provide(RowContextKey, {
      gutter: props.gutter,
    })

    return () => {
      return h(
        'div',
        {
          class: rowClasses.value,
          style: rowStyle,
        },
        slots.default ? slots.default() : []
      )
    }
  },
})

// Export context key for Col component
export { RowContextKey }
