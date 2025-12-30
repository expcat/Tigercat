import React, { useContext, useMemo } from 'react'
import {
  classNames,
  getSpanClasses,
  getOffsetClasses,
  getOrderClasses,
  getFlexClasses,
  getGutterStyles,
  type ColProps as CoreColProps,
} from '@tigercat/core'
import { RowContext } from './Row'

export interface ColProps extends CoreColProps {
  /**
   * Column content
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties
}

export const Col: React.FC<ColProps> = ({
  span = 24,
  offset = 0,
  order,
  flex,
  children,
  className,
  style,
  ...props
}) => {
  const { gutter } = useContext(RowContext)
  
  const gutterStyles = useMemo(() => getGutterStyles(gutter || 0), [gutter])

  const colClasses = useMemo(() => classNames(
    getSpanClasses(span),
    getOffsetClasses(offset),
    getOrderClasses(order),
    getFlexClasses(flex),
    className
  ), [span, offset, order, flex, className])

  const mergedStyle = useMemo((): React.CSSProperties => ({
    ...gutterStyles.colStyle,
    ...style
  }), [gutterStyles.colStyle, style])

  return (
    <div className={colClasses} style={mergedStyle} {...props}>
      {children}
    </div>
  )
}
