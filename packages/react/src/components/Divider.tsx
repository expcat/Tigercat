import React, { useMemo } from 'react'
import {
  getDividerClasses,
  getDividerStyle,
  type DividerProps as CoreDividerProps
} from '@expcat/tigercat-core'

export interface DividerProps extends CoreDividerProps {
  /** Additional CSS classes */
  className?: string
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  lineStyle = 'solid',
  spacing = 'md',
  color,
  thickness,
  className,
  ...props
}) => {
  const classes = useMemo(() => {
    const base = getDividerClasses(orientation, lineStyle, spacing)
    return className ? `${base} ${className}` : base
  }, [orientation, lineStyle, spacing, className])

  const style = useMemo(
    () => getDividerStyle(orientation, color, thickness) as React.CSSProperties | undefined,
    [color, thickness, orientation]
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
