import React, { forwardRef, useMemo } from 'react'
import {
  getRowAlignJustifyVars,
  getRowClasses,
  getRowGutterStyleVars,
  resolveResponsiveAlign,
  resolveResponsiveGutter,
  resolveResponsiveJustify,
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

  const mergedStyle = useMemo<React.CSSProperties>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0
    const resolved = resolveResponsiveGutter(gutter, width)
    return {
      ...getRowGutterStyleVars([resolved.x, resolved.y]),
      ...getRowAlignJustifyVars(
        resolveResponsiveAlign(align, width),
        resolveResponsiveJustify(justify, width)
      ),
      ...style
    }
  }, [gutter, align, justify, style])

  return (
    <div ref={ref} className={rowClasses} style={mergedStyle} {...divProps}>
      {children}
    </div>
  )
})

Row.displayName = 'TigerRow'
