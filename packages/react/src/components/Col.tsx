import React, { forwardRef, useMemo } from 'react'
import {
  getColClasses,
  getColMergedStyleVars,
  type ColProps as CoreColProps
} from '@expcat/tigercat-core'

export type ColProps = React.HTMLAttributes<HTMLDivElement> & CoreColProps

export const Col = forwardRef<HTMLDivElement, ColProps>(function Col(
  { span = 24, offset = 0, order, flex, children, className, style, ...divProps },
  ref
) {
  const colClasses = useMemo(() => getColClasses({ flex, className }), [flex, className])

  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({
      ...getColMergedStyleVars(span, offset, order, flex),
      ...style
    }),
    [span, offset, order, flex, style]
  )

  return (
    <div ref={ref} className={colClasses} style={mergedStyle} {...divProps}>
      {children}
    </div>
  )
})

Col.displayName = 'TigerCol'
