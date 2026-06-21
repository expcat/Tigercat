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
  getIconDefinition,
  SVG_DEFAULT_FILL,
  SVG_DEFAULT_STROKE,
  SVG_DEFAULT_VIEWBOX_24,
  SVG_DEFAULT_XMLNS,
  type IconSize,
  type IconName
} from '@expcat/tigercat-core'

export interface VueIconProps {
  name?: IconName
  size?: IconSize
  color?: string
}

export const Icon = defineComponent({
  name: 'TigerIcon',
  inheritAttrs: false,
  props: {
    /**
     * Built-in icon name. Renders the matching glyph from the built-in icon
     * set when no custom SVG children are provided.
     */
    name: {
      type: String as PropType<IconName>,
      default: undefined
    },
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
      const hasSlotContent = Array.isArray(defaultSlot) && defaultSlot.length > 0
      const isDecorative =
        attrs['aria-label'] == null && attrs['aria-labelledby'] == null && attrs.role == null

      // Built-in icon: render the registered glyph when a `name` is provided and
      // no custom children override it.
      const definition = !hasSlotContent && props.name ? getIconDefinition(props.name) : undefined
      const builtInSvg = definition
        ? h(
            'svg',
            {
              class: svgClasses.value,
              xmlns: SVG_DEFAULT_XMLNS,
              viewBox: definition.viewBox,
              fill: definition.mode === 'fill' ? 'currentColor' : SVG_DEFAULT_FILL,
              stroke: definition.mode === 'stroke' ? 'currentColor' : SVG_DEFAULT_STROKE,
              'stroke-width': definition.mode === 'stroke' ? 1.5 : undefined,
              'stroke-linecap':
                definition.mode === 'stroke' ? iconSvgDefaultStrokeLinecap : undefined,
              'stroke-linejoin':
                definition.mode === 'stroke' ? iconSvgDefaultStrokeLinejoin : undefined
            },
            definition.paths.map((d) => h('path', { d }))
          )
        : null

      const normalizeSlotNode = (node: VNode): VNode => {
        if (node && typeof node === 'object' && node.type === 'svg') {
          const svgProps = (node.props ?? {}) as Record<string, unknown>
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
            (node.children === null ? undefined : node.children) as HChildren
          )
        }

        return node
      }

      const children = builtInSvg ? [builtInSvg] : (defaultSlot ?? []).map(normalizeSlotNode)

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
