import { defineComponent, computed, h, cloneVNode, isVNode, type PropType, type VNode } from 'vue'
import {
  classNames,
  coerceClassValue,
  menuItemGroupTitleClasses,
  mergeStyleValues
} from '@tigercat/core'

export interface VueMenuItemGroupProps {
  title?: string
  level?: number
  className?: string
  style?: Record<string, string | number>
}

export const MenuItemGroup = defineComponent({
  name: 'TigerMenuItemGroup',
  inheritAttrs: false,
  props: {
    /**
     * Group title
     */
    title: {
      type: String,
      default: ''
    },
    level: {
      type: Number,
      default: 0
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
    const groupClasses = computed(() => classNames(props.className, coerceClassValue(attrs.class)))

    const groupStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })

    const withLevel = (nodes: VNode[] | undefined): VNode[] | undefined => {
      if (!nodes || nodes.length === 0) return nodes
      const level = props.level

      return nodes.map((node) => {
        if (!isVNode(node)) return node
        const type = node.type as unknown
        const name =
          typeof type === 'object' && type != null && 'name' in type
            ? (type as { name?: unknown }).name
            : undefined

        const isTarget = name === 'TigerMenuItem' || name === 'TigerSubMenu'
        if (!isTarget) return node

        const existingProps = (node.props ?? {}) as Record<string, unknown>
        if (existingProps.level != null) return node

        return cloneVNode(node, { level })
      })
    }

    return () => {
      return h('li', { class: 'list-none' }, [
        props.title ? h('div', { class: menuItemGroupTitleClasses }, props.title) : null,
        slots.default
          ? h(
              'ul',
              {
                role: 'group',
                class: groupClasses.value,
                style: groupStyle.value,
                ...passthroughAttrs.value
              },
              withLevel(slots.default?.() as VNode[] | undefined)
            )
          : null
      ])
    }
  }
})

export default MenuItemGroup
