import React, { forwardRef, useMemo } from 'react'
import {
  classNames,
  getDividerClasses,
  getDividerLineClasses,
  getDividerStyle,
  hasDividerLabel,
  type DividerProps as CoreDividerProps
} from '@expcat/tigercat-core'

export interface DividerProps
  extends CoreDividerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'children'> {
  className?: string
  children?: React.ReactNode
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    lineStyle = 'solid',
    spacing = 'md',
    color,
    thickness,
    className,
    style: styleProp,
    children,
    ...props
  },
  ref
) {
  const labeled = hasDividerLabel(children)
  const classes = useMemo(() => {
    const base = getDividerClasses(orientation, lineStyle, spacing, labeled)
    return classNames(base, className)
  }, [orientation, lineStyle, spacing, labeled, className])

  const lineStyleObj = useMemo(
    () =>
      getDividerStyle(orientation, color, thickness, lineStyle) as React.CSSProperties | undefined,
    [color, thickness, orientation, lineStyle]
  )

  const style = useMemo(
    () => ({
      ...lineStyleObj,
      ...styleProp
    }),
    [lineStyleObj, styleProp]
  )

  const lineClass = getDividerLineClasses(orientation, lineStyle, true)

  return (
    <div
      {...props}
      ref={ref}
      className={classes}
      style={labeled ? styleProp : style}
      role="separator"
      aria-orientation={orientation}
      data-tiger-divider="">
      {labeled ? (
        <>
          <span aria-hidden="true" className={lineClass} style={lineStyleObj} />
          <span>{children}</span>
          <span aria-hidden="true" className={lineClass} style={lineStyleObj} />
        </>
      ) : null}
    </div>
  )
})
Divider.displayName = 'Divider'
