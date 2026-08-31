import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getSkeletonClasses,
  getSkeletonInlineStyle,
  getParagraphRowWidth,
  isSkeletonNamed,
  resolveSkeletonAriaHidden,
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
    const visualOptions = computed(() => ({
      width: props.width,
      height: props.height
    }))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
      const attrsStyle = attrsRecord.style
      const named = isSkeletonNamed(attrsRecord['aria-label'], attrsRecord['aria-labelledby'])
      const computedAriaHidden = resolveSkeletonAriaHidden(attrsRecord['aria-hidden'], named)
      const namedStatus = named && computedAriaHidden !== true
      const inlineStyle = getSkeletonInlineStyle(props.width, props.height)
      const a11y = {
        'aria-hidden': computedAriaHidden,
        role: namedStatus ? 'status' : undefined,
        'aria-busy': namedStatus ? true : undefined
      }

      if (props.variant === 'text' && props.rows > 1) {
        const rows = []
        for (let i = 0; i < props.rows; i++) {
          const rowStyle: Record<string, string> = {}
          if (props.paragraph) {
            rowStyle.width = getParagraphRowWidth(i, props.rows)
          }
          if (props.height) rowStyle.height = props.height
          rows.push(
            h('div', {
              key: i,
              class: classNames(
                getSkeletonClasses(props.variant, props.animation, props.shape, {
                  height: props.height,
                  omitWidth: true
                }),
                !props.paragraph && 'w-full',
                i < props.rows - 1 && 'mb-2'
              ),
              style: Object.keys(rowStyle).length > 0 ? rowStyle : undefined
            })
          )
        }

        return h(
          'div',
          {
            ...attrs,
            class: classNames(
              'flex flex-col',
              !props.width && 'w-full',
              props.className,
              coerceClassValue(attrsClass)
            ),
            style: mergeStyleValues(inlineStyle, attrsStyle, props.style),
            'data-tiger-skeleton': '',
            ...a11y
          },
          rows
        )
      }

      return h('div', {
        ...attrs,
        class: classNames(
          getSkeletonClasses(props.variant, props.animation, props.shape, visualOptions.value),
          props.className,
          coerceClassValue(attrsClass)
        ),
        style: mergeStyleValues(inlineStyle, attrsStyle, props.style),
        'data-tiger-skeleton': '',
        ...a11y
      })
    }
  }
})

export default Skeleton
