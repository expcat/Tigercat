import { defineComponent, computed, h, PropType, type VNode, type CSSProperties } from 'vue'
import {
  classNames,
  coerceClassValue,
  iconSizeClasses,
  iconSvgBaseClasses,
  iconWrapperClasses,
  SVG_DEFAULT_XMLNS,
  SVG_DEFAULT_VIEWBOX_24,
  SVG_DEFAULT_FILL,
  SVG_DEFAULT_STROKE,
  type IconSize
} from '@expcat/tigercat-core'

export interface VueIconProps {
  size?: IconSize
  color?: string
  className?: string
  style?: CSSProperties
}

export const Icon = defineComponent({
  name: 'TigerIcon',
  inheritAttrs: false,
  props: {
    /**
     * Icon size
     * @default 'md'
     */
    size: {
      type: String as PropType<IconSize>,
      default: 'md' as IconSize
    },
    /**
     * Icon color (CSS color value)
     * @default 'currentColor'
     */
    color: {
      type: String,
      default: 'currentColor'
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },

    /**
     * Custom styles for the wrapper
     */
    style: {
      type: Object as PropType<CSSProperties>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const wrapperClasses = computed(() => {
      return classNames(iconWrapperClasses, coerceClassValue(attrs.class), props.className)
    })

    const svgBaseClasses = computed(() => {
      return classNames(iconSvgBaseClasses, iconSizeClasses[props.size])
    })

    const wrapperStyle = computed((): CSSProperties => {
      return {
        ...(attrs.style as CSSProperties | undefined),
        ...(props.style ?? {}),
        color: props.color
      }
    })

    return () => {
      const defaultSlot = slots.default?.()

      const ariaLabel = attrs['aria-label']
      const ariaLabelledBy = attrs['aria-labelledby']
      const hasExplicitRole = attrs.role != null
      const isDecorative = ariaLabel == null && ariaLabelledBy == null && !hasExplicitRole

      const children = (defaultSlot ?? []).map((node) => {
        if (node && typeof node === 'object' && (node as VNode).type === 'svg') {
          const svgNode = node as VNode
          const svgProps = (svgNode.props ?? {}) as Record<string, unknown>
          const svgChildren = svgNode.children === null ? undefined : svgNode.children

          type HChildren = Parameters<typeof h>[2]

          return h(
            'svg',
            {
              ...svgProps,
              class: classNames(svgBaseClasses.value, coerceClassValue(svgProps.class)),
              xmlns: (svgProps.xmlns as string | undefined) ?? SVG_DEFAULT_XMLNS,
              viewBox: (svgProps.viewBox as string | undefined) ?? SVG_DEFAULT_VIEWBOX_24,
              fill: (svgProps.fill as string | undefined) ?? SVG_DEFAULT_FILL,
              stroke: (svgProps.stroke as string | undefined) ?? SVG_DEFAULT_STROKE,
              'stroke-width': (svgProps['stroke-width'] as string | number | undefined) ?? '2',
              'stroke-linecap': (svgProps['stroke-linecap'] as string | undefined) ?? 'round',
              'stroke-linejoin': (svgProps['stroke-linejoin'] as string | undefined) ?? 'round'
            },
            svgChildren as HChildren
          )
        }

        return node
      })

      return h(
        'span',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          ...(isDecorative
            ? { 'aria-hidden': 'true' }
            : { role: (attrs.role as string | undefined) ?? 'img' })
        },
        children
      )
    }
  }
})

export default Icon
