import React, { useContext } from 'react';
import {
  classNames,
  getColStyleVars,
  getColOrderStyleVars,
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
  const isFlexSpanMode = flex !== undefined && span === 0;
  const colStyleVars = getColStyleVars(
    isFlexSpanMode ? undefined : span,
    offset
  );
  const colOrderVars = getColOrderStyleVars(order);

  const colFlexVar: Record<string, string> =
    flex === undefined
      ? {}
      : {
          '--tiger-col-flex': String(flex).replace(/_/g, ' '),
        };

  const colClasses = classNames(
    isFlexSpanMode ? '' : getSpanClasses(span),
    getOffsetClasses(offset),
    getOrderClasses(order),
    getFlexClasses(flex),
    className
  );

  const mergedStyle: React.CSSProperties = {
    ...colStyle,
    ...colStyleVars,
    ...colOrderVars,
    ...colFlexVar,
    ...style,
  };

  return (
    <div className={colClasses} style={mergedStyle} {...divProps}>
      {children}
    </div>
  );
};
