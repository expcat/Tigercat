import React, { forwardRef, useMemo } from 'react'
import {
  getRowAlignJustifyVars,
  getRowClasses,
  getRowGutterStyleVars,
  type RowProps as CoreRowProps
} from '@expcat/tigercat-core'

export type RowProps = React.HTMLAttributes<HTMLDivElement> & CoreRowProps

export const Row = forwardRef<HTMLDivElement, RowProps>(function Row(
  {
    gutter = 0,
    align = 'top',
    justify = 'start',
    wrap = true,
    children,
    className,
    style,
    ...divProps
  },
  ref
) {
  const rowClasses = useMemo(() => getRowClasses({ wrap, className }), [wrap, className])

  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({
      ...getRowGutterStyleVars(gutter),
      ...getRowAlignJustifyVars(align, justify),
      ...style
    }),
    [gutter, align, justify, style]
  )

  return (
    <div ref={ref} className={rowClasses} style={mergedStyle} {...divProps}>
      {children}
    </div>
  )
})

Row.displayName = 'TigerRow'
