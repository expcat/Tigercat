import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getSpaceClasses,
  getSpaceStyle,
  type SpaceProps,
  type SpaceSize
} from '@expcat/tigercat-core'

export type VueSpaceProps = SpaceProps

export const Space = defineComponent({
  name: 'TigerSpace',
  inheritAttrs: false,
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
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const classes = computed(() => getSpaceClasses(props))
    const gapStyle = computed(() => getSpaceStyle(props.size))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      return h(
        'div',
        {
          ...attrs,
          class: classNames(classes.value, props.className, coerceClassValue(attrsRecord.class)),
          style: mergeStyleValues(gapStyle.value, attrsRecord.style, props.style),
          'data-tiger-space': ''
        },
        slots.default?.()
      )
    }
  }
})

export default Space
