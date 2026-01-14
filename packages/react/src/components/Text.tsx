import React from 'react'
import {
  classNames,
  textAlignClasses,
  textColorClasses,
  textDecorationClasses,
  textSizeClasses,
  textWeightClasses,
  type TextProps as CoreTextProps
} from '@tigercat/core'

export type TextProps = CoreTextProps &
  Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'children'> & {
    children?: React.ReactNode
  }

export const Text: React.FC<TextProps> = ({
  tag = 'p',
  size = 'base',
  weight = 'normal',
  align,
  color = 'default',
  truncate = false,
  italic = false,
  underline = false,
  lineThrough = false,
  children,
  className,
  ...props
}) => {
  const textClasses = classNames(
    textSizeClasses[size],
    textWeightClasses[weight],
    align && textAlignClasses[align],
    textColorClasses[color],
    truncate && textDecorationClasses.truncate,
    italic && textDecorationClasses.italic,
    underline && textDecorationClasses.underline,
    lineThrough && textDecorationClasses.lineThrough,
    className
  )

  return React.createElement(tag, { ...props, className: textClasses }, children)
}
