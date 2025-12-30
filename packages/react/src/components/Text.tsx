import React, { useMemo } from 'react'
import {
  classNames,
  textSizeClasses,
  textWeightClasses,
  textAlignClasses,
  textColorClasses,
  textDecorationClasses,
  type TextProps as CoreTextProps,
} from '@tigercat/core'

export interface TextProps extends CoreTextProps {
  /**
   * Text content
   */
  children?: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string
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
  const textClasses = useMemo(() => classNames(
    textSizeClasses[size],
    textWeightClasses[weight],
    align && textAlignClasses[align],
    textColorClasses[color],
    truncate && textDecorationClasses.truncate,
    italic && textDecorationClasses.italic,
    underline && textDecorationClasses.underline,
    lineThrough && textDecorationClasses.lineThrough,
    className
  ), [size, weight, align, color, truncate, italic, underline, lineThrough, className])

  return React.createElement(
    tag,
    { className: textClasses, ...props },
    children
  )
}
