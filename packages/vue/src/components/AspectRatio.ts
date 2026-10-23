import { defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getAspectRatioContentClasses,
  getAspectRatioRootClasses,
  getAspectRatioStyle,
  ASPECT_RATIO_DEFAULT,
  type AspectRatioValue,
  type AspectRatioFit
} from '@expcat/tigercat-core'

export interface VueAspectRatioProps {
  ratio?: AspectRatioValue
  fit?: AspectRatioFit
  className?: string
  contentClassName?: string
}

export const AspectRatio = defineComponent({
  name: 'TigerAspectRatio',
  inheritAttrs: false,
  props: {
    ratio: {
      type: [Number, String] as PropType<AspectRatioValue>,
      default: ASPECT_RATIO_DEFAULT
    },
    fit: { type: String as PropType<AspectRatioFit>, default: undefined },
    className: { type: String, default: undefined },
    contentClassName: { type: String, default: undefined }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'div',
        {
          ...attrs,
          class: classNames(
            getAspectRatioRootClasses(undefined, props.fit),
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: mergeStyleValues(getAspectRatioStyle(props.ratio), attrs.style),
          'data-aspect-ratio': ''
        },
        [
          h(
            'div',
            {
              class: classNames(getAspectRatioContentClasses(), props.contentClassName),
              'data-aspect-ratio-content': ''
            },
            slots.default?.()
          )
        ]
      )
  }
})

export default AspectRatio
