import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getColClasses,
  getColMergedStyleVars,
  type ColSpan,
  type Breakpoint,
  type ColProps as CoreColProps
} from '@expcat/tigercat-core'

export interface VueColProps extends CoreColProps {
  className?: string
}

export const Col = defineComponent({
  name: 'TigerCol',
  inheritAttrs: false,
  props: {
    span: {
      type: [Number, Object] as PropType<ColSpan>,
      default: 24
    },
    offset: {
      type: [Number, Object] as PropType<number | Partial<Record<Breakpoint, number>>>,
      default: 0
    },
    order: {
      type: [Number, Object] as PropType<number | Partial<Record<Breakpoint, number>>>
    },
    flex: {
      type: [String, Number] as PropType<string | number>
    },
    className: {
      type: String as PropType<string>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const colClasses = computed(() =>
      classNames(
        getColClasses({ flex: props.flex }),
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const colMergedStyle = computed(() =>
      getColMergedStyleVars(props.span, props.offset, props.order, props.flex)
    )

    return () => {
      const { class: _class, style: attrsStyle, ...rest } = attrs
      return h(
        'div',
        {
          ...rest,
          class: colClasses.value,
          style: [colMergedStyle.value, attrsStyle]
        },
        slots.default?.()
      )
    }
  }
})
