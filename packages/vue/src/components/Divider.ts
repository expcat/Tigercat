import { defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getDividerClasses,
  getDividerLineClasses,
  getDividerStyle,
  hasDividerLabel,
  type DividerOrientation,
  type DividerLineStyle,
  type DividerSpacing
} from '@expcat/tigercat-core'

export interface VueDividerProps {
  orientation?: DividerOrientation
  lineStyle?: DividerLineStyle
  spacing?: DividerSpacing
  color?: string
  thickness?: string
  className?: string
  style?: Record<string, string | number>
}

export const Divider = defineComponent({
  name: 'TigerDivider',
  inheritAttrs: false,
  props: {
    orientation: {
      type: String as PropType<DividerOrientation>,
      default: 'horizontal'
    },
    lineStyle: {
      type: String as PropType<DividerLineStyle>,
      default: 'solid'
    },
    spacing: {
      type: String as PropType<DividerSpacing>,
      default: 'md'
    },
    color: String,
    thickness: String,
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const children = slots.default?.()
      const labeled = hasDividerLabel(children)
      const lineStyleObj = getDividerStyle(
        props.orientation,
        props.color,
        props.thickness,
        props.lineStyle
      )
      const classes = classNames(
        getDividerClasses(props.orientation, props.lineStyle, props.spacing, labeled),
        props.className,
        coerceClassValue(attrsRecord.class)
      )
      const lineClass = getDividerLineClasses(props.orientation, props.lineStyle, true)

      return h(
        'div',
        {
          ...attrs,
          class: classes,
          style: labeled
            ? mergeStyleValues(attrsRecord.style, props.style)
            : mergeStyleValues(lineStyleObj, attrsRecord.style, props.style),
          role: 'separator',
          'aria-orientation': props.orientation,
          'data-tiger-divider': ''
        },
        labeled
          ? [
              h('span', { 'aria-hidden': 'true', class: lineClass, style: lineStyleObj }),
              h('span', children),
              h('span', { 'aria-hidden': 'true', class: lineClass, style: lineStyleObj })
            ]
          : undefined
      )
    }
  }
})

export default Divider
