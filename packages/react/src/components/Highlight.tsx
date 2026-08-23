import React, { forwardRef, isValidElement } from 'react'
import {
  getHighlightMarkClasses,
  getHighlightRootClasses,
  getHighlightSegments,
  resolveHighlightText,
  type HighlightProps as CoreHighlightProps
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
    const source = resolveHighlightText(text, flattenReactText(children))
    const segments = getHighlightSegments(source, keywords, { caseSensitive, global })
    const markClasses = getHighlightMarkClasses(highlightClassName)

    return (
      <span
        ref={ref}
        data-highlight=""
        data-highlight-case-sensitive={caseSensitive ? 'true' : 'false'}
        data-highlight-global={global ? 'true' : 'false'}
        className={getHighlightRootClasses(className)}
        style={style}
        {...rest}>
        {segments.map((segment) =>
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
        )}
      </span>
    )
  }
)
Highlight.displayName = 'Highlight'

export default Highlight
