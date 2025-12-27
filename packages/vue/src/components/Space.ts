import { defineComponent, computed, h, PropType } from 'vue'
import { 
  classNames,
  getSpaceGapSize,
  getSpaceAlignClass,
  getSpaceDirectionClass,
  type SpaceDirection,
  type SpaceSize,
  type SpaceAlign
} from '@tigercat/core'

const baseClasses = 'inline-flex'

export const Space = defineComponent({
  name: 'TigerSpace',
  props: {
    direction: {
      type: String as PropType<SpaceDirection>,
      default: 'horizontal',
    },
    size: {
      type: [String, Number] as PropType<SpaceSize>,
      default: 'md',
    },
    align: {
      type: String as PropType<SpaceAlign>,
      default: 'start',
    },
    wrap: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const gapSize = computed(() => getSpaceGapSize(props.size))
    
    const spaceClasses = computed(() => {
      return classNames(
        baseClasses,
        getSpaceDirectionClass(props.direction),
        getSpaceAlignClass(props.align),
        gapSize.value.class,
        props.wrap && 'flex-wrap'
      )
    })

    const spaceStyle = computed(() => {
      if (gapSize.value.style) {
        return { gap: gapSize.value.style }
      }
      return undefined
    })

    return () => {
      return h(
        'div',
        {
          class: spaceClasses.value,
          style: spaceStyle.value,
        },
        slots.default?.()
      )
    }
  },
})

export default Space
