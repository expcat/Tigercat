import {
  Comment,
  Fragment,
  Text,
  cloneVNode,
  defineComponent,
  h,
  isVNode,
  PropType,
  type VNode,
  type VNodeChild
} from 'vue'
import {
  composeComponentClasses,
  findHighlightRanges,
  getHighlightMarkClasses,
  getHighlightRootClasses,
  getHighlightSegments,
  mergeStyleValues,
  resolveHighlightText,
  sliceTextByHighlightRanges,
  type HighlightKeywords,
  type HighlightRange,
  type StyleValue
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

function renderMark(text: string, markClasses: string, markStyle: StyleValue | undefined): VNode {
  return h(
    'mark',
    {
      class: markClasses,
      style: markStyle,
      'data-highlight-mark': ''
    },
    text
  )
}

function highlightVueNode(
  input: unknown,
  ranges: HighlightRange[],
  offset: { value: number },
  markClasses: string,
  markStyle: StyleValue | undefined
): VNodeChild {
  if (input == null || typeof input === 'boolean') return null
  if (typeof input === 'string' || typeof input === 'number') {
    const text = String(input)
    const pieces = sliceTextByHighlightRanges(text, offset.value, ranges)
    offset.value += text.length
    if (pieces.length === 1 && !pieces[0].highlighted) return text
    return pieces.map((piece) =>
      piece.highlighted ? renderMark(piece.text, markClasses, markStyle) : piece.text
    )
  }
  if (Array.isArray(input)) {
    return input.map((item) => highlightVueNode(item, ranges, offset, markClasses, markStyle))
  }
  if (!isVNode(input)) return null
  if (input.type === Comment) return input
  if (input.type === Text) {
    return highlightVueNode(input.children, ranges, offset, markClasses, markStyle)
  }
  if (input.type === Fragment) {
    return highlightVueNode(input.children, ranges, offset, markClasses, markStyle)
  }
  if (typeof input.children === 'string' || typeof input.children === 'number') {
    const highlighted = highlightVueNode(input.children, ranges, offset, markClasses, markStyle)
    return h(input.type as string, input.props ?? undefined, highlighted ?? undefined)
  }
  if (Array.isArray(input.children)) {
    const highlighted = highlightVueNode(input.children, ranges, offset, markClasses, markStyle)
    if (typeof input.type === 'string') {
      return h(input.type, input.props ?? undefined, highlighted ?? undefined)
    }
    return cloneVNode(input, null, true)
  }
  if (input.children && typeof input.children === 'object') {
    const slots = input.children as { default?: () => unknown }
    if (typeof slots.default === 'function') {
      const highlighted = highlightVueNode(slots.default(), ranges, offset, markClasses, markStyle)
      return h(input.type as never, input.props, () => highlighted)
    }
  }
  return input
}

export const Highlight = defineComponent({
  name: 'TigerHighlight',
  inheritAttrs: false,
  props: {
    /**
     * Source text to search. When set, it wins over the default slot.
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
      const slotNodes = slots.default?.()
      const source = resolveHighlightText(props.text, flattenVueText(slotNodes))
      const options = {
        caseSensitive: props.caseSensitive,
        global: props.global
      }
      const markClasses = getHighlightMarkClasses(props.highlightClassName)
      const markStyle = mergeStyleValues(props.highlightStyle)
      let children: VNodeChild

      if (props.text != null) {
        const segments = getHighlightSegments(source, props.keywords, options)
        children = segments.map((segment) =>
          segment.highlighted ? renderMark(segment.text, markClasses, markStyle) : segment.text
        )
      } else {
        children = highlightVueNode(
          slotNodes,
          findHighlightRanges(source, props.keywords, options),
          { value: 0 },
          markClasses,
          markStyle
        )
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
        children ?? undefined
      )
    }
  }
})

export default Highlight
