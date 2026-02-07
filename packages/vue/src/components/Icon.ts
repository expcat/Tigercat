import { defineComponent, computed, h, PropType, type VNode, type CSSProperties } from 'vue'
import {
  classNames,
  coerceClassValue,
  iconSizeClasses,
  iconSvgBaseClasses,
  iconSvgDefaultStrokeLinecap,
  iconSvgDefaultStrokeLinejoin,
  iconSvgDefaultStrokeWidth,
  iconWrapperClasses,
  SVG_DEFAULT_FILL,
  SVG_DEFAULT_STROKE,
  SVG_DEFAULT_VIEWBOX_24,
  SVG_DEFAULT_XMLNS,
  type IconSize
} from '@expcat/tigercat-core'

export interface VueIconProps {
  size?: IconSize
  color?: string
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
    }
  },
  setup(props, { slots, attrs }) {
    const wrapperClasses = computed(() =>
      classNames(iconWrapperClasses, coerceClassValue(attrs.class))
    )

    const svgClasses = computed(() => classNames(iconSvgBaseClasses, iconSizeClasses[props.size]))

    return () => {
      const defaultSlot = slots.default?.()
      const isDecorative =
        attrs['aria-label'] == null && attrs['aria-labelledby'] == null && attrs.role == null

      const children = (defaultSlot ?? []).map((node) => {
        if (node && typeof node === 'object' && (node as VNode).type === 'svg') {
          const svgNode = node as VNode
          const svgProps = (svgNode.props ?? {}) as Record<string, unknown>
          type HChildren = Parameters<typeof h>[2]

          return h(
            'svg',
            {
              ...svgProps,
              class: classNames(svgClasses.value, coerceClassValue(svgProps.class)),
              xmlns: (svgProps.xmlns as string) ?? SVG_DEFAULT_XMLNS,
              viewBox: (svgProps.viewBox as string) ?? SVG_DEFAULT_VIEWBOX_24,
              fill: (svgProps.fill as string) ?? SVG_DEFAULT_FILL,
              stroke: (svgProps.stroke as string) ?? SVG_DEFAULT_STROKE,
              'stroke-width':
                (svgProps['stroke-width'] as string | number) ?? iconSvgDefaultStrokeWidth,
              'stroke-linecap':
                (svgProps['stroke-linecap'] as string) ?? iconSvgDefaultStrokeLinecap,
              'stroke-linejoin':
                (svgProps['stroke-linejoin'] as string) ?? iconSvgDefaultStrokeLinejoin
            },
            (svgNode.children === null ? undefined : svgNode.children) as HChildren
          )
        }

        return node
      })

      return h(
        'span',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: { ...(attrs.style as CSSProperties | undefined), color: props.color },
          ...(isDecorative ? { 'aria-hidden': 'true' } : { role: (attrs.role as string) ?? 'img' })
        },
        children
      )
    }
  }
})

export default Icon
