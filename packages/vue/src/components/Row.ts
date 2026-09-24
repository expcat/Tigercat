import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getRowAlignJustifyVars,
  getRowClasses,
  getRowGutterStyleVars,
  resolveResponsiveAlign,
  resolveResponsiveGutter,
  resolveResponsiveJustify,
  type Align,
  type Justify,
  type GutterSize
} from '@expcat/tigercat-core'

export interface VueRowProps {
  gutter?: GutterSize
  align?: Align
  justify?: Justify
  wrap?: boolean
  className?: string
}

export const Row = defineComponent({
  name: 'TigerRow',
  inheritAttrs: false,
  props: {
    gutter: {
      type: [Number, Array, Object] as PropType<GutterSize>,
      default: 0
    },
    align: {
      type: String as PropType<Align>,
      default: 'top' as Align
    },
    justify: {
      type: String as PropType<Justify>,
      default: 'start' as Justify
    },
    wrap: {
      type: Boolean,
      default: true
    },
    className: {
      type: String as PropType<string>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const rowStyle = computed(() => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 0
      const gutter = resolveResponsiveGutter(props.gutter, width)
      const align = resolveResponsiveAlign(props.align as Align, width)
      const justify = resolveResponsiveJustify(props.justify as Justify, width)
      return {
        ...getRowGutterStyleVars([gutter.x, gutter.y]),
        ...getRowAlignJustifyVars(align, justify)
      }
    })

    const rowClasses = computed(() =>
      classNames(
        getRowClasses({ wrap: props.wrap }),
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    return () => {
      const { class: _class, style: attrsStyle, ...rest } = attrs
      return h(
        'div',
        {
          ...rest,
          class: rowClasses.value,
          style: [rowStyle.value, attrsStyle]
        },
        slots.default?.()
      )
    }
  }
})
