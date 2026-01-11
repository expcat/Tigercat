import React, { useMemo } from 'react';
import {
  classNames,
  getDividerSpacingClasses,
  getDividerLineStyleClasses,
  getDividerOrientationClasses,
  type DividerProps as CoreDividerProps,
} from '@tigercat/core';

export interface DividerProps extends CoreDividerProps {
  /**
   * Additional CSS classes
   */
  className?: string;
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
  const dividerClasses = useMemo(
    () =>
      classNames(
        getDividerOrientationClasses(orientation),
        getDividerLineStyleClasses(lineStyle),
        getDividerSpacingClasses(spacing, orientation),
        className
      ),
    [orientation, lineStyle, spacing, className]
  );

  const dividerStyle = useMemo((): React.CSSProperties => {
    const style: React.CSSProperties = {};

    if (color) {
      style.borderColor = color;
    }

    if (thickness) {
      if (orientation === 'horizontal') {
        style.borderTopWidth = thickness;
      } else {
        style.borderLeftWidth = thickness;
      }
    }

    return style;
  }, [color, thickness, orientation]);

  return (
    <div
      {...props}
      className={dividerClasses}
      style={dividerStyle}
      role="separator"
      aria-orientation={orientation}
    />
  );
};
