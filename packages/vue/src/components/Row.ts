import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getRowAlignJustifyVars,
  getRowClasses,
  getRowGutterStyleVars,
  type Align,
  type Justify,
  type GutterSize,
  type ResponsiveAlign,
  type ResponsiveJustify
} from '@expcat/tigercat-core'

export interface VueRowProps {
  gutter?: GutterSize
  align?: ResponsiveAlign
  justify?: ResponsiveJustify
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
      type: [String, Object] as PropType<ResponsiveAlign>,
      default: 'top' as Align
    },
    justify: {
      type: [String, Object] as PropType<ResponsiveJustify>,
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
      return {
        ...getRowGutterStyleVars(props.gutter),
        ...getRowAlignJustifyVars(props.align, props.justify)
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
