import React from 'react'
import { classNames, getTextClasses, type TextProps as CoreTextProps } from '@expcat/tigercat-core'

export type TextProps = CoreTextProps &
  Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'children'> & {
    children?: React.ReactNode
  }

export const Text: React.FC<TextProps> = ({
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
}) => {
  const textClasses = classNames(
    getTextClasses({ size, weight, align, color, truncate, italic, underline, lineThrough }),
    className
  )

  return React.createElement(tag, { ...props, className: textClasses }, children)
}
