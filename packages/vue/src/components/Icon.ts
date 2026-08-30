import { defineComponent, computed, h, PropType, type VNode, type CSSProperties } from 'vue'
import {
  classNames,
  coerceClassValue,
  getIconDefinition,
  iconSizeClasses,
  iconSvgBaseClasses,
  iconWrapperClasses,
  mergeChildSvgAttrs,
  resolveIconSize,
  resolveIconSvgAttrs,
  resolveIconWrapperStyle,
  toVueSvgAttrs,
  warnUnknownIconName,
  type IconSize,
  type IconName,
  type IconDefinition
} from '@expcat/tigercat-core'

export interface VueIconProps {
  name?: IconName
  icon?: IconDefinition
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
     * Custom icon definition (viewBox + path data), e.g. an application logo.
     * Takes precedence over `name`; custom SVG children take precedence over both.
     */
    icon: {
      type: Object as PropType<IconDefinition>,
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
     * Icon color written onto the wrapper. Omitted values inherit CSS `color`.
     */
    color: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const wrapperClasses = computed(() =>
      classNames(iconWrapperClasses, coerceClassValue(attrs.class))
    )

    const svgClasses = computed(() =>
      classNames(iconSvgBaseClasses, iconSizeClasses[resolveIconSize(props.size)])
    )

    return () => {
      const defaultSlot = slots.default?.()
      const hasSlotContent = Array.isArray(defaultSlot) && defaultSlot.length > 0
      const isDecorative =
        attrs['aria-label'] == null && attrs['aria-labelledby'] == null && attrs.role == null

      const definition = !hasSlotContent
        ? (props.icon ?? (props.name ? getIconDefinition(props.name) : undefined))
        : undefined

      if (!hasSlotContent && !definition && props.name) {
        warnUnknownIconName(props.name)
      }

      const builtInSvg = definition
        ? h(
            'svg',
            {
              class: svgClasses.value,
              ...toVueSvgAttrs(
                resolveIconSvgAttrs({ mode: definition.mode, viewBox: definition.viewBox })
              )
            },
            definition.paths.map((d) => h('path', { d }))
          )
        : null

      const normalizeSlotNode = (node: VNode): VNode => {
        if (node && typeof node === 'object' && node.type === 'svg') {
          const svgProps = (node.props ?? {}) as Record<string, unknown>
          type HChildren = Parameters<typeof h>[2]
          const merged = mergeChildSvgAttrs(svgProps)

          return h(
            'svg',
            {
              ...svgProps,
              ...toVueSvgAttrs(merged),
              class: classNames(svgClasses.value, coerceClassValue(svgProps.class))
            },
            (node.children === null ? undefined : node.children) as HChildren
          )
        }

        return node
      }

      const children = builtInSvg ? [builtInSvg] : (defaultSlot ?? []).map(normalizeSlotNode)
      const attrsStyle = attrs.style as CSSProperties | string | undefined
      const styleObject =
        attrsStyle && typeof attrsStyle === 'object'
          ? (attrsStyle as Record<string, unknown>)
          : undefined

      return h(
        'span',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: resolveIconWrapperStyle(props.color, styleObject),
          ...(isDecorative ? { 'aria-hidden': 'true' } : { role: (attrs.role as string) ?? 'img' })
        },
        children
      )
    }
  }
})

export default Icon
