import React, { useMemo } from 'react'
import {
  getDividerClasses,
  getDividerStyle,
  type DividerProps as CoreDividerProps
} from '@expcat/tigercat-core'

export interface DividerProps
  extends CoreDividerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Additional CSS classes */
  className?: string
}

export const Divider: React.FC<DividerProps> = React.memo(
  ({
    orientation = 'horizontal',
    lineStyle = 'solid',
    spacing = 'md',
    color,
    thickness,
    className,
    style: styleProp,
    ...props
  }) => {
    const classes = useMemo(() => {
      const base = getDividerClasses(orientation, lineStyle, spacing)
      return className ? `${base} ${className}` : base
    }, [orientation, lineStyle, spacing, className])

    const style = useMemo(
      () => ({
        ...(getDividerStyle(orientation, color, thickness) as React.CSSProperties | undefined),
        ...styleProp
      }),
      [color, thickness, orientation, styleProp]
    )

    return (
      <div
        {...props}
        className={classes}
        style={style}
        role="separator"
        aria-orientation={orientation}
      />
    )
  }
)
Divider.displayName = 'Divider'
