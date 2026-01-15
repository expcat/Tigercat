import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  getDividerSpacingClasses,
  getDividerLineStyleClasses,
  getDividerOrientationClasses,
  type DividerOrientation,
  type DividerLineStyle,
  type DividerSpacing
} from '@expcat/tigercat-core'

export const Divider = defineComponent({
  name: 'TigerDivider',
  props: {
    orientation: {
      type: String as PropType<DividerOrientation>,
      default: 'horizontal' as DividerOrientation
    },
    lineStyle: {
      type: String as PropType<DividerLineStyle>,
      default: 'solid' as DividerLineStyle
    },
    spacing: {
      type: String as PropType<DividerSpacing>,
      default: 'md' as DividerSpacing
    },
    color: {
      type: String
    },
    thickness: {
      type: String
    }
  },
  setup(props, { attrs }) {
    const dividerClasses = computed(() =>
      classNames(
        getDividerOrientationClasses(props.orientation),
        getDividerLineStyleClasses(props.lineStyle),
        getDividerSpacingClasses(props.spacing, props.orientation)
      )
    )

    const dividerStyle = computed(() => {
      const style: Record<string, string> = {}

      if (props.color) style.borderColor = props.color
      if (props.thickness) {
        style[props.orientation === 'horizontal' ? 'borderTopWidth' : 'borderLeftWidth'] =
          props.thickness
      }

      return style
    })

    return () => {
      return h('div', {
        ...attrs,
        class: [dividerClasses.value, attrs.class],
        style: [dividerStyle.value, attrs.style],
        role: 'separator',
        'aria-orientation': props.orientation
      })
    }
  }
})

export default Divider
