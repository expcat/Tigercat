import React, { createContext } from 'react';
import {
  classNames,
  getAlignClasses,
  getJustifyClasses,
  getGutterStyles,
  type RowProps as CoreRowProps,
} from '@tigercat/core';

export type RowProps = React.HTMLAttributes<HTMLDivElement> & CoreRowProps;

interface RowContextType {
  gutter?: CoreRowProps['gutter'];
}

export const RowContext = createContext<RowContextType>({});

export const Row: React.FC<RowProps> = ({
  gutter = 0,
  align = 'top',
  justify = 'start',
  wrap = true,
  children,
  className,
  style,
  ...divProps
}) => {
  const { rowStyle } = getGutterStyles(gutter);

  const rowClasses = classNames(
    'flex',
    'w-full',
    wrap && 'flex-wrap',
    getAlignClasses(align),
    getJustifyClasses(justify),
    className
  );

  const mergedStyle: React.CSSProperties = {
    ...rowStyle,
    ...style,
  };

  const contextValue = { gutter };

  return (
    <RowContext.Provider value={contextValue}>
      <div className={rowClasses} style={mergedStyle} {...divProps}>
        {children}
      </div>
    </RowContext.Provider>
  );
};
