import React, { forwardRef } from 'react'
import {
  classNames,
  getTextClasses,
  resolveTextTag,
  type TextProps as CoreTextProps
} from '@expcat/tigercat-core'

export type TextProps = CoreTextProps &
  Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'children'> &
  Pick<React.LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> & {
    children?: React.ReactNode
  }

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    tag = 'p',
    size,
    weight,
    align,
    color,
    truncate,
    italic,
    underline,
    lineThrough,
    children,
    className,
    ...props
  },
  ref
) {
  const resolvedTag = resolveTextTag(tag)
  const textClasses = classNames(
    getTextClasses({ size, weight, align, color, truncate, italic, underline, lineThrough }),
    className
  )

  return React.createElement(resolvedTag, { ...props, ref, className: textClasses }, children)
})
Text.displayName = 'Text'
