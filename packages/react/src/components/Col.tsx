import React, { useContext } from 'react';
import {
  classNames,
  getSpanClasses,
  getOffsetClasses,
  getOrderClasses,
  getFlexClasses,
  getGutterStyles,
  type ColProps as CoreColProps,
} from '@tigercat/core';
import { RowContext } from './Row';

export type ColProps = React.HTMLAttributes<HTMLDivElement> & CoreColProps;

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
  const { gutter } = useContext(RowContext);

  const { colStyle } = getGutterStyles(gutter || 0);

  const colClasses = classNames(
    getSpanClasses(span),
    getOffsetClasses(offset),
    getOrderClasses(order),
    getFlexClasses(flex),
    className
  );

  const mergedStyle: React.CSSProperties = {
    ...colStyle,
    ...style,
  };

  return (
    <div className={colClasses} style={mergedStyle} {...divProps}>
      {children}
    </div>
  );
};
