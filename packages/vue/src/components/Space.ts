import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  getSpaceGapSize,
  getSpaceAlignClass,
  getSpaceDirectionClass,
  type SpaceDirection,
  type SpaceSize,
  type SpaceAlign
} from '@expcat/tigercat-core'

const baseClasses = 'inline-flex'

export interface VueSpaceProps {
  direction?: SpaceDirection
  size?: SpaceSize
  align?: SpaceAlign
  wrap?: boolean
}

export const Space = defineComponent({
  name: 'TigerSpace',
  props: {
    direction: {
      type: String as PropType<SpaceDirection>,
      default: 'horizontal' as SpaceDirection
    },
    size: {
      type: [String, Number] as PropType<SpaceSize>,
      default: 'md' as SpaceSize
    },
    align: {
      type: String as PropType<SpaceAlign>,
      default: 'start' as SpaceAlign
    },
    wrap: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots, attrs }) {
    const gapSize = computed(() => getSpaceGapSize(props.size))

    const spaceClasses = computed(() =>
      classNames(
        baseClasses,
        getSpaceDirectionClass(props.direction),
        getSpaceAlignClass(props.align),
        gapSize.value.class,
        props.wrap && 'flex-wrap'
      )
    )

    const spaceStyle = computed(() =>
      gapSize.value.style ? { gap: gapSize.value.style } : undefined
    )

    return () => {
      return h(
        'div',
        {
          ...attrs,
          class: [spaceClasses.value, attrs.class],
          style: [spaceStyle.value, attrs.style]
        },
        slots.default?.()
      )
    }
  }
})

export default Space
