import { defineComponent, h, PropType, type VNodeChild } from 'vue'
import {
  composeComponentClasses,
  formatKbdSeparatorText,
  getKbdParts,
  getKbdRootClasses,
  kbdKeyClasses,
  kbdSeparatorClasses,
  mergeStyleValues,
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
     * Visual variant. `default` reuses Tag default chrome; `subtle` is quieter.
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
          'data-kbd-variant': props.variant
        },
        children
      )
    }
  }
})

export default Kbd
