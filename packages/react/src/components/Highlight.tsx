import React, { cloneElement, forwardRef, isValidElement } from 'react'
import {
  findHighlightRanges,
  getHighlightMarkClasses,
  getHighlightRootClasses,
  getHighlightSegments,
  resolveHighlightText,
  sliceTextByHighlightRanges,
  type HighlightProps as CoreHighlightProps,
  type HighlightRange
} from '@expcat/tigercat-core'

export interface HighlightProps
  extends
    Omit<CoreHighlightProps, 'style' | 'highlightStyle'>,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof CoreHighlightProps> {
  children?: React.ReactNode
  style?: React.CSSProperties
  highlightStyle?: React.CSSProperties
}

function flattenReactText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) {
    let out = ''
    for (const item of node) out += flattenReactText(item)
    return out
  }
  if (isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return flattenReactText(props.children)
  }
  return ''
}

function highlightReactNode(
  node: React.ReactNode,
  ranges: HighlightRange[],
  offset: { current: number },
  markClasses: string,
  highlightStyle?: React.CSSProperties
): React.ReactNode {
  if (node == null || typeof node === 'boolean') return node
  if (typeof node === 'string' || typeof node === 'number') {
    const text = String(node)
    const pieces = sliceTextByHighlightRanges(text, offset.current, ranges)
    offset.current += text.length
    if (pieces.length === 1 && !pieces[0].highlighted) return text
    return pieces.map((piece, index) =>
      piece.highlighted ? (
        <mark
          key={`mark-${piece.start}-${index}`}
          className={markClasses}
          style={highlightStyle}
          data-highlight-mark="">
          {piece.text}
        </mark>
      ) : (
        <React.Fragment key={`text-${piece.start}-${index}`}>{piece.text}</React.Fragment>
      )
    )
  }
  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <React.Fragment key={index}>
        {highlightReactNode(child, ranges, offset, markClasses, highlightStyle)}
      </React.Fragment>
    ))
  }
  if (isValidElement(node)) {
    const children = (node.props as { children?: React.ReactNode }).children
    if (children == null) return node
    return cloneElement(
      node,
      undefined,
      highlightReactNode(children, ranges, offset, markClasses, highlightStyle)
    )
  }
  return node
}

export const Highlight = forwardRef<HTMLSpanElement, HighlightProps>(
  (
    {
      text,
      keywords,
      caseSensitive = false,
      global = true,
      highlightClassName,
      highlightStyle,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const markClasses = getHighlightMarkClasses(highlightClassName)
    const source = resolveHighlightText(text, flattenReactText(children))
    const options = { caseSensitive, global }
    const content =
      text != null
        ? getHighlightSegments(source, keywords, options).map((segment) =>
            segment.highlighted ? (
              <mark
                key={`mark-${segment.start}-${segment.end}`}
                className={markClasses}
                style={highlightStyle}
                data-highlight-mark="">
                {segment.text}
              </mark>
            ) : (
              <React.Fragment key={`text-${segment.start}-${segment.end}`}>
                {segment.text}
              </React.Fragment>
            )
          )
        : highlightReactNode(
            children,
            findHighlightRanges(source, keywords, options),
            { current: 0 },
            markClasses,
            highlightStyle
          )

    return (
      <span
        ref={ref}
        data-highlight=""
        data-highlight-case-sensitive={caseSensitive ? 'true' : 'false'}
        data-highlight-global={global ? 'true' : 'false'}
        className={getHighlightRootClasses(className)}
        style={style}
        {...rest}>
        {content}
      </span>
    )
  }
)
Highlight.displayName = 'Highlight'

export default Highlight
