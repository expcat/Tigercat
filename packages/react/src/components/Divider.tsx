import React from 'react'
import {
  classNames,
  getDividerSpacingClasses,
  getDividerLineStyleClasses,
  getDividerOrientationClasses,
  type DividerProps as CoreDividerProps,
} from '@tigercat/core'

export interface DividerProps extends CoreDividerProps {
  /**
   * Additional CSS classes
   */
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
  const dividerClasses = classNames(
    getDividerOrientationClasses(orientation),
    getDividerLineStyleClasses(lineStyle),
    getDividerSpacingClasses(spacing, orientation),
    className
  )

  const dividerStyle: React.CSSProperties = {}
  
  if (color) {
    dividerStyle.borderColor = color
  }
  
  if (thickness) {
    if (orientation === 'horizontal') {
      dividerStyle.borderTopWidth = thickness
    } else {
      dividerStyle.borderLeftWidth = thickness
    }
  }

  return (
    <div
      className={dividerClasses}
      style={dividerStyle}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  )
}
