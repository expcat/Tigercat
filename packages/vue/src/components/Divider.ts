import { defineComponent, computed, h, PropType } from 'vue'
import {
  getDividerClasses,
  getDividerStyle,
  type DividerOrientation,
  type DividerLineStyle,
  type DividerSpacing
} from '@expcat/tigercat-core'

export const Divider = defineComponent({
  name: 'TigerDivider',
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
    thickness: String
  },
  setup(props, { attrs }) {
    const classes = computed(() =>
      getDividerClasses(props.orientation, props.lineStyle, props.spacing)
    )

    const style = computed(() =>
      getDividerStyle(props.orientation, props.color, props.thickness)
    )

    return () =>
      h('div', {
        ...attrs,
        class: [classes.value, attrs.class],
        style: [style.value, attrs.style],
        role: 'separator',
        'aria-orientation': props.orientation
      })
  }
})

export default Divider
