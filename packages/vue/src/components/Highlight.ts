import { Comment, defineComponent, h, PropType, type VNode, type VNodeChild } from 'vue'
import {
  composeComponentClasses,
  getHighlightMarkClasses,
  getHighlightRootClasses,
  getHighlightSegments,
  mergeStyleValues,
  resolveHighlightText,
  type HighlightKeywords
} from '@expcat/tigercat-core'

export interface VueHighlightProps {
  text?: string
  keywords?: HighlightKeywords
  caseSensitive?: boolean
  global?: boolean
  highlightClassName?: string
  highlightStyle?: Record<string, unknown>
  className?: string
  style?: Record<string, unknown>
}

function flattenVueText(input: unknown): string {
  if (input == null || typeof input === 'boolean') return ''
  if (typeof input === 'string' || typeof input === 'number') return String(input)
  if (typeof input === 'function') {
    return flattenVueText((input as () => unknown)())
  }
  if (Array.isArray(input)) {
    let out = ''
    for (const item of input) out += flattenVueText(item)
    return out
  }
  if (typeof input !== 'object') return ''
  const node = input as VNode
  if (node.type === Comment) return ''
  if (typeof node.children === 'string' || typeof node.children === 'number') {
    return String(node.children)
  }
  if (typeof node.children === 'function') {
    return flattenVueText((node.children as () => unknown)())
  }
  if (Array.isArray(node.children)) {
    return flattenVueText(node.children)
  }
  if (node.children && typeof node.children === 'object') {
    const slots = node.children as { default?: unknown }
    if (typeof slots.default === 'function') {
      return flattenVueText(slots.default())
    }
  }
  return ''
}

export const Highlight = defineComponent({
  name: 'TigerHighlight',
  inheritAttrs: false,
  props: {
    /**
     * Source text to search. When omitted, the default slot is flattened to a string.
     */
    text: {
      type: String,
      default: undefined
    },
    /**
     * Keyword string(s) and/or regular expression(s) to highlight.
     */
    keywords: {
      type: [String, Array, RegExp] as PropType<HighlightKeywords>,
      default: undefined
    },
    /**
     * Match case for string keywords. Regular expressions keep their own `i` flag.
     * @default false
     */
    caseSensitive: {
      type: Boolean,
      default: false
    },
    /**
     * Highlight every occurrence. When false, only the first match of each keyword.
     * @default true
     */
    global: {
      type: Boolean,
      default: true
    },
    /**
     * Additional CSS classes on highlighted `mark` elements
     */
    highlightClassName: {
      type: String,
      default: undefined
    },
    /**
     * Inline styles on highlighted `mark` elements
     */
    highlightStyle: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
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
      const source = resolveHighlightText(props.text, flattenVueText(slots.default?.()))
      const segments = getHighlightSegments(source, props.keywords, {
        caseSensitive: props.caseSensitive,
        global: props.global
      })
      const markClasses = getHighlightMarkClasses(props.highlightClassName)
      const markStyle = mergeStyleValues(props.highlightStyle)
      const children: VNodeChild[] = []

      for (const segment of segments) {
        if (segment.highlighted) {
          children.push(
            h(
              'mark',
              {
                class: markClasses,
                style: markStyle,
                'data-highlight-mark': ''
              },
              segment.text
            )
          )
        } else {
          children.push(segment.text)
        }
      }

      return h(
        'span',
        {
          ...attrs,
          class: composeComponentClasses(
            getHighlightRootClasses(props.className),
            attrsRecord.class
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          'data-highlight': '',
          'data-highlight-case-sensitive': props.caseSensitive ? 'true' : 'false',
          'data-highlight-global': props.global ? 'true' : 'false'
        },
        children
      )
    }
  }
})

export default Highlight
