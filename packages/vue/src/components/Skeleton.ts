import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getSkeletonClasses,
  getSkeletonDimensions,
  getParagraphRowWidth,
  mergeStyleValues,
  type SkeletonVariant,
  type SkeletonAnimation,
  type SkeletonShape,
  type SkeletonProps
} from '@expcat/tigercat-core'

export interface VueSkeletonProps extends SkeletonProps {
  style?: Record<string, string | number>
}

export const Skeleton = defineComponent({
  name: 'TigerSkeleton',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<SkeletonVariant>,
      default: 'text' as SkeletonVariant
    },
    animation: {
      type: String as PropType<SkeletonAnimation>,
      default: 'pulse' as SkeletonAnimation
    },
    width: {
      type: String,
      default: undefined
    },
    height: {
      type: String,
      default: undefined
    },
    shape: {
      type: String as PropType<SkeletonShape>,
      default: 'circle' as SkeletonShape
    },
    rows: {
      type: Number,
      default: 1
    },
    paragraph: {
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
  setup(props, { attrs }) {
    const visualClasses = computed(() =>
      getSkeletonClasses(props.variant, props.animation, props.shape)
    )

    const dimensions = computed(() =>
      getSkeletonDimensions(props.variant, props.width, props.height)
    )

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
      const attrsStyle = attrsRecord.style
      const hasAriaLabel =
        typeof attrsRecord['aria-label'] === 'string' ||
        typeof attrsRecord['aria-labelledby'] === 'string'
      const ariaHiddenRaw = attrsRecord['aria-hidden']
      const computedAriaHidden =
        typeof ariaHiddenRaw === 'boolean' ? ariaHiddenRaw : hasAriaLabel ? undefined : true

      // Multi-row text variant
      if (props.variant === 'text' && props.rows > 1) {
        const rows = []
        for (let i = 0; i < props.rows; i++) {
          const rowStyle: Record<string, string> = {
            height: dimensions.value.height
          }
          if (props.paragraph) {
            rowStyle.width = getParagraphRowWidth(i, props.rows)
          } else if (dimensions.value.width) {
            rowStyle.width = dimensions.value.width
          }
          rows.push(
            h('div', {
              key: i,
              class: classNames(visualClasses.value, i < props.rows - 1 && 'mb-2'),
              style: rowStyle
            })
          )
        }

        return h(
          'div',
          {
            ...attrs,
            class: classNames('flex flex-col', props.className, coerceClassValue(attrsClass)),
            style: mergeStyleValues(attrsStyle, props.style),
            'aria-hidden': computedAriaHidden
          },
          rows
        )
      }

      // Single skeleton element
      const dim = dimensions.value
      return h('div', {
        ...attrs,
        class: classNames(visualClasses.value, props.className, coerceClassValue(attrsClass)),
        style: mergeStyleValues(attrsStyle, props.style, {
          ...(dim.width ? { width: dim.width } : undefined),
          height: dim.height
        }),
        'aria-hidden': computedAriaHidden
      })
    }
  }
})

export default Skeleton
