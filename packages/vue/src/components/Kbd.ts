import {
  Comment,
  Fragment,
  Text,
  defineComponent,
  h,
  isVNode,
  PropType,
  type VNodeChild
} from 'vue'
import {
  classNames,
  coerceClassValue,
  formatKbdSeparatorText,
  getKbdParts,
  getKbdRootClasses,
  kbdKeyClasses,
  kbdSeparatorClasses,
  mergeStyleValues,
  type KbdKeys,
  type KbdSize,
  type KbdVariant
} from '@expcat/tigercat-core'

export interface VueKbdProps {
  keys?: KbdKeys
  separator?: string
  size?: KbdSize
  variant?: KbdVariant
  className?: string
  style?: Record<string, unknown>
}

function hasRenderableSlotNode(node: unknown): boolean {
  if (node == null || typeof node === 'boolean') return false
  if (typeof node === 'string') return node.length > 0
  if (typeof node === 'number') return true
  if (Array.isArray(node)) return node.some(hasRenderableSlotNode)
  if (!isVNode(node)) return false
  if (node.type === Comment) return false
  if (node.type === Text || node.type === Fragment) return hasRenderableSlotNode(node.children)
  return true
}

function hasSlotContent(nodes: unknown): boolean {
  return hasRenderableSlotNode(nodes)
}

export const Kbd = defineComponent({
  name: 'TigerKbd',
  inheritAttrs: false,
  props: {
    /**
     * One key or a combo list. A string is a single key; an array is joined
     * with `separator`. Combine with the default slot to append a final key.
     */
    keys: {
      type: [String, Array] as PropType<KbdKeys>,
      default: undefined
    },
    /**
     * Separator between combo keys
     * @default '+'
     */
    separator: {
      type: String,
      default: undefined
    },
    /**
     * Visual size
     * @default 'md'
     */
    size: {
      type: String as PropType<KbdSize>,
      default: 'md'
    },
    /**
     * Visual variant. `default` is Kbd chrome; `subtle` is quieter.
     * @default 'default'
     */
    variant: {
      type: String as PropType<KbdVariant>,
      default: 'default'
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Inline styles
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const parts = getKbdParts(props.keys, props.separator)
      const slotNodes = slots.default?.()
      const hasSlot = hasSlotContent(slotNodes)
      const isEmpty = !hasSlot && parts.length === 0
      const children: VNodeChild[] = []

      for (const part of parts) {
        if (part.type === 'separator') {
          children.push(
            h('span', { class: kbdSeparatorClasses, 'data-kbd-separator': '' }, ` ${part.value} `)
          )
        } else {
          children.push(h('kbd', { class: kbdKeyClasses, 'data-kbd-key': '' }, part.value))
        }
      }

      if (hasSlot && slotNodes) {
        if (parts.length > 0) {
          children.push(
            h(
              'span',
              { class: kbdSeparatorClasses, 'data-kbd-separator': '' },
              formatKbdSeparatorText(props.separator)
            )
          )
        }
        children.push(...slotNodes)
      }

      return h(
        'kbd',
        {
          ...attrs,
          class: classNames(
            getKbdRootClasses({
              size: props.size,
              variant: props.variant,
              className: props.className
            }),
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          'data-kbd': '',
          'data-kbd-size': props.size,
          'data-kbd-variant': props.variant,
          'aria-hidden': isEmpty ? 'true' : attrsRecord['aria-hidden']
        },
        children
      )
    }
  }
})

export default Kbd
