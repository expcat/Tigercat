import { defineComponent, computed, h, PropType } from 'vue'
import {
  getSpaceClasses,
  getSpaceStyle,
  type SpaceProps,
  type SpaceSize
} from '@expcat/tigercat-core'

export type VueSpaceProps = SpaceProps

export const Space = defineComponent({
  name: 'TigerSpace',
  props: {
    direction: {
      type: String as PropType<SpaceProps['direction']>,
      default: 'horizontal'
    },
    size: {
      type: [String, Number] as PropType<SpaceSize>,
      default: 'md' as SpaceSize
    },
    align: {
      type: String as PropType<SpaceProps['align']>,
      default: 'start'
    },
    wrap: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots, attrs }) {
    const classes = computed(() => getSpaceClasses(props))
    const style = computed(() => getSpaceStyle(props.size))

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: [classes.value, attrs.class],
          style: [style.value, attrs.style]
        },
        slots.default?.()
      )
  }
})

export default Space
