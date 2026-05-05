import React, { useContext, useMemo } from 'react'
import {
  classNames,
  getColMergedStyleVars,
  getSpanClasses,
  getOffsetClasses,
  getOrderClasses,
  getFlexClasses,
  getColGutterClasses,
  type ColProps as CoreColProps
} from '@expcat/tigercat-core'
import { RowContext } from './Row'

export type ColProps = React.HTMLAttributes<HTMLDivElement> & CoreColProps

export const Col: React.FC<ColProps> = ({
  span = 24,
  offset = 0,
  order,
  flex,
  children,
  className,
  style,
  ...divProps
}) => {
  const { gutter } = useContext(RowContext)
  const isFlexSpanMode = flex !== undefined && span === 0

  const colClasses = useMemo(
    () =>
      classNames(
        isFlexSpanMode ? '' : getSpanClasses(span),
        getOffsetClasses(offset),
        getOrderClasses(order),
        getFlexClasses(flex),
        getColGutterClasses(gutter || 0),
        className
      ),
    [gutter, isFlexSpanMode, span, offset, order, flex, className]
  )

  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({
      ...getColMergedStyleVars(isFlexSpanMode ? undefined : span, offset, order, flex),
      ...style
    }),
    [isFlexSpanMode, span, offset, order, flex, style]
  )

  return (
    <div className={colClasses} style={mergedStyle} {...divProps}>
      {children}
    </div>
  )
}
