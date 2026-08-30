import { defineComponent, h, PropType, type VNodeChild } from 'vue'
import {
  composeComponentClasses,
  formatKbdSeparatorText,
  getKbdParts,
  getKbdRootClasses,
  kbdKeyClasses,
  kbdSeparatorClasses,
  mergeStyleValues,
  resolveKbdAccessibleName,
  type KbdSize,
  type KbdVariant
} from '@expcat/tigercat-core'

export interface VueKbdProps {
  keys?: string | string[]
  separator?: string
  size?: KbdSize
  variant?: KbdVariant
  className?: string
  style?: Record<string, unknown>
}

function hasSlotContent(nodes: unknown): boolean {
  return Array.isArray(nodes) && nodes.length > 0
}

function extraKeyText(nodes: unknown): string | undefined {
  if (!Array.isArray(nodes) || nodes.length !== 1) return undefined
  const node = nodes[0] as { children?: unknown; type?: unknown }
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (node && (typeof node.children === 'string' || typeof node.children === 'number')) {
    return String(node.children)
  }
  return undefined
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
      type: [String, Array] as PropType<string | string[]>,
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
      const accessibleName = resolveKbdAccessibleName(
        props.keys,
        props.separator,
        extraKeyText(slotNodes)
      )
      const isEmpty = !hasSlot && parts.length === 0
      const children: VNodeChild[] = []

      for (const part of parts) {
        if (part.type === 'separator') {
          children.push(
            h(
              'span',
              { class: kbdSeparatorClasses, 'data-kbd-separator': '', 'aria-hidden': 'true' },
              ` ${part.value} `
            )
          )
        } else {
          children.push(
            h(
              'kbd',
              { class: kbdKeyClasses, 'data-kbd-key': '', 'aria-hidden': 'true' },
              part.value
            )
          )
        }
      }

      if (hasSlot && slotNodes) {
        if (parts.length > 0) {
          children.push(
            h(
              'span',
              { class: kbdSeparatorClasses, 'data-kbd-separator': '', 'aria-hidden': 'true' },
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
          class: composeComponentClasses(
            getKbdRootClasses({
              size: props.size,
              variant: props.variant,
              className: props.className
            }),
            attrsRecord.class
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          'data-kbd': '',
          'data-kbd-size': props.size,
          'data-kbd-variant': props.variant,
          'aria-label': (attrsRecord['aria-label'] as string | undefined) ?? accessibleName,
          'aria-hidden': isEmpty ? 'true' : attrsRecord['aria-hidden']
        },
        children
      )
    }
  }
})

export default Kbd
