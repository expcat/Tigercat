import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getSpaceClasses,
  getSpaceGapStyle,
  getSpaceStyle,
  type SpaceProps,
  type SpaceSize
} from '@expcat/tigercat-core'

export type VueSpaceProps = SpaceProps

export const Space = defineComponent({
  name: 'TigerSpace',
  inheritAttrs: false,
  props: {
    orientation: {
      type: String as PropType<SpaceProps['orientation']>,
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
    verticalSize: {
      type: Number,
      default: undefined
    },
    split: {
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
    const gapStyle = computed(() => {
      if (props.verticalSize != null) {
        return getSpaceGapStyle(typeof props.size === 'number' ? props.size : 0, props.verticalSize)
      }
      return getSpaceStyle(props.size)
    })

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const kids = slots.default?.() ?? []
      const flat = kids.flatMap((node) => (Array.isArray(node) ? node : [node]))
      const content =
        props.split && flat.length > 1
          ? flat.flatMap((node, index) =>
              index === 0
                ? [node]
                : [
                    h(
                      'span',
                      { 'data-tiger-space-split': '', 'aria-hidden': 'true' },
                      slots.split ? slots.split() : '|'
                    ),
                    node
                  ]
            )
          : kids
      return h(
        'div',
        {
          ...attrs,
          class: classNames(classes.value, props.className, coerceClassValue(attrsRecord.class)),
          style: mergeStyleValues(gapStyle.value, attrsRecord.style, props.style),
          'data-tiger-space': ''
        },
        content
      )
    }
  }
})

export default Space
