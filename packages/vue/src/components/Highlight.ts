import {
  Comment,
  defineComponent,
  Fragment,
  h,
  PropType,
  Text,
  type VNode,
  type VNodeChild
} from 'vue'
import {
  classNames,
  coerceClassValue,
  findHighlightRanges,
  getHighlightMarkClasses,
  getHighlightRootClasses,
  getHighlightSegments,
  mergeStyleValues,
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

/**
 * Plain text of native element / fragment / text subtrees, used to measure
 * global match offsets. Component VNodes are opaque: their slots are never
 * invoked here, so slot props stay with the component's own render.
 */
function flattenVueText(input: unknown): string {
  if (input == null || typeof input === 'boolean') return ''
  if (typeof input === 'string' || typeof input === 'number') return String(input)
  if (Array.isArray(input)) {
    let out = ''
    for (const item of input) out += flattenVueText(item)
    return out
  }
  if (typeof input !== 'object') return ''
  const node = input as VNode
  if (node.type === Comment) return ''
  if (typeof node.type !== 'string' && node.type !== Text && node.type !== Fragment) {
    return ''
  }
  if (typeof node.children === 'string' || typeof node.children === 'number') {
    return String(node.children)
  }
  if (Array.isArray(node.children)) {
    return flattenVueText(node.children)
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

/** Shared cursor so offsets stay global across sibling text and elements. */
interface HighlightOffset {
  current: number
}

function wrapTextByRanges(
  text: string,
  offset: HighlightOffset,
  ranges: readonly HighlightRange[],
  markClasses: string,
  markStyle: StyleValue | undefined
): string | VNodeChild[] {
  const pieces = sliceTextByHighlightRanges(text, offset.current, ranges)
  offset.current += text.length
  if (pieces.length === 1 && !pieces[0].highlighted) return text
  return pieces.map((piece) =>
    piece.highlighted ? renderMark(piece.text, markClasses, markStyle) : piece.text
  )
}

// Vue shape flags for text vs array children (stable since Vue 3.0). The
// clone helper realigns them when a text child becomes mark pieces.
const SHAPE_TEXT_CHILDREN = 8
const SHAPE_ARRAY_CHILDREN = 16

/**
 * Clone an element or fragment VNode with replaced children. The patch
 * flags are cleared because split text pieces shift dynamic children, and
 * the stale dynamicChildren list must go with them: it indexes the OLD
 * children, so keeping it would make later updates patch replaced subtrees.
 * Refs, attrs, and events stay untouched on the spread.
 */
function cloneVueNodeWithChildren(vnode: VNode, children: VNodeChild[]): VNode {
  const cloned = {
    ...vnode,
    children,
    patchFlag: 0,
    dynamicProps: null,
    dynamicChildren: null
  } as VNode
  cloned.shapeFlag = (vnode.shapeFlag & ~SHAPE_TEXT_CHILDREN) | SHAPE_ARRAY_CHILDREN
  return cloned
}

/**
 * Walk slot VNodes, wrapping matched text in marks while keeping elements,
 * fragments, props, and events intact. Component VNodes stay opaque nodes
 * and contribute no text, matching flattenVueText.
 */
function highlightVueNode(
  node: VNodeChild,
  ranges: readonly HighlightRange[],
  offset: HighlightOffset,
  markClasses: string,
  markStyle: StyleValue | undefined
): VNodeChild {
  if (node == null || typeof node === 'boolean') return node
  if (typeof node === 'string' || typeof node === 'number') {
    return wrapTextByRanges(String(node), offset, ranges, markClasses, markStyle)
  }
  if (Array.isArray(node)) {
    return node.map((child) => highlightVueNode(child, ranges, offset, markClasses, markStyle))
  }
  if (typeof node === 'object') {
    const vnode = node as VNode
    if (vnode.type === Comment) return vnode
    if (typeof vnode.type !== 'string' && vnode.type !== Text && vnode.type !== Fragment) {
      return vnode
    }
    if (vnode.type === Text) {
      const text =
        typeof vnode.children === 'string' ? vnode.children : String(vnode.children ?? '')
      return wrapTextByRanges(text, offset, ranges, markClasses, markStyle)
    }
    if (typeof vnode.children === 'string' || typeof vnode.children === 'number') {
      const wrapped = wrapTextByRanges(
        String(vnode.children),
        offset,
        ranges,
        markClasses,
        markStyle
      )
      if (typeof wrapped === 'string') return vnode
      return cloneVueNodeWithChildren(vnode, wrapped)
    }
    if (Array.isArray(vnode.children)) {
      return cloneVueNodeWithChildren(
        vnode,
        vnode.children.map((child) =>
          highlightVueNode(child, ranges, offset, markClasses, markStyle)
        )
      )
    }
    return vnode
  }
  return node
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
     * Keyword string or strings to highlight. Matched literally.
     */
    keywords: {
      type: [String, Array] as PropType<HighlightKeywords>,
      default: undefined
    },
    /**
     * Match case for string keywords.
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
      const options = {
        caseSensitive: props.caseSensitive,
        global: props.global
      }
      const markClasses = getHighlightMarkClasses(props.highlightClassName)
      const markStyle = mergeStyleValues(props.highlightStyle)

      // Explicit text wins; otherwise walk the slot VNodes so links,
      // emphasis, and handlers survive highlighting.
      let children: VNodeChild
      if (props.text != null) {
        children = getHighlightSegments(props.text, props.keywords, options).map((segment) =>
          segment.highlighted ? renderMark(segment.text, markClasses, markStyle) : segment.text
        )
      } else {
        const slotNodes = slots.default?.()
        const ranges = findHighlightRanges(flattenVueText(slotNodes), props.keywords, options)
        const offset = { current: 0 }
        children = slotNodes?.map((node) =>
          highlightVueNode(node, ranges, offset, markClasses, markStyle)
        )
      }

      return h(
        'span',
        {
          ...attrs,
          class: classNames(
            getHighlightRootClasses(props.className),
            coerceClassValue(attrsRecord.class)
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
