import React from 'react';
import {
  classNames,
  layoutFooterClasses,
  type FooterProps as CoreFooterProps,
} from '@tigercat/core';

export interface ReactFooterProps
  extends CoreFooterProps,
    Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'height'> {
  children?: React.ReactNode;
}

export const Footer: React.FC<ReactFooterProps> = ({
  className,
  height = 'auto',
  style,
  children,
  ...props
}) => {
  const footerClasses = classNames(layoutFooterClasses, className);
  const footerStyle: React.CSSProperties = { ...style, height };

  return (
    <footer className={footerClasses} style={footerStyle} {...props}>
      {children}
    </footer>
  );
};
