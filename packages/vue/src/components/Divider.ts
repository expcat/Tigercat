import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  getDividerSpacingClasses,
  getDividerLineStyleClasses,
  getDividerOrientationClasses,
  type DividerOrientation,
  type DividerLineStyle,
  type DividerSpacing,
} from '@tigercat/core'

export const Divider = defineComponent({
  name: 'TigerDivider',
  props: {
    orientation: {
      type: String as PropType<DividerOrientation>,
      default: 'horizontal',
    },
    lineStyle: {
      type: String as PropType<DividerLineStyle>,
      default: 'solid',
    },
    spacing: {
      type: String as PropType<DividerSpacing>,
      default: 'md',
    },
    color: {
      type: String,
      default: undefined,
    },
    thickness: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const dividerClasses = computed(() => {
      return classNames(
        getDividerOrientationClasses(props.orientation),
        getDividerLineStyleClasses(props.lineStyle),
        getDividerSpacingClasses(props.spacing, props.orientation)
      )
    })

    const dividerStyle = computed(() => {
      const style: Record<string, string> = {}
      
      if (props.color) {
        style.borderColor = props.color
      }
      
      if (props.thickness) {
        if (props.orientation === 'horizontal') {
          style.borderTopWidth = props.thickness
        } else {
          style.borderLeftWidth = props.thickness
        }
      }
      
      return style
    })

    return () => {
      return h('div', {
        class: dividerClasses.value,
        style: dividerStyle.value,
        role: 'separator',
        'aria-orientation': props.orientation,
      })
    }
  },
})

export default Divider
