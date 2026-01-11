import React from 'react';
import {
  classNames,
  type IconProps as CoreIconProps,
  type IconSize,
} from '@tigercat/core';

export interface IconProps
  extends CoreIconProps,
    React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

const sizeClasses: Record<IconSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const;

export const Icon: React.FC<IconProps> = ({
  size = 'md',
  color = 'currentColor',
  className,
  children,
  ...props
}) => {
  const iconStyle: React.CSSProperties = { ...props.style, color };
  const iconClasses = classNames('inline-flex align-middle', className);

  const ariaLabel = props['aria-label'];
  const ariaLabelledBy = props['aria-labelledby'];
  const isDecorative =
    ariaLabel == null && ariaLabelledBy == null && props.role == null;

  const processedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || child.type !== 'svg') return child;

    const svgProps = child.props as React.SVGProps<SVGSVGElement>;

    return React.cloneElement(
      child as React.ReactElement<React.SVGProps<SVGSVGElement>>,
      {
        ...svgProps,
        className: classNames(
          'inline-block',
          sizeClasses[size],
          svgProps.className
        ),
        xmlns: svgProps.xmlns ?? 'http://www.w3.org/2000/svg',
        viewBox: svgProps.viewBox ?? '0 0 24 24',
        fill: svgProps.fill ?? 'none',
        stroke: svgProps.stroke ?? 'currentColor',
        strokeWidth: svgProps.strokeWidth ?? 2,
        strokeLinecap: svgProps.strokeLinecap ?? 'round',
        strokeLinejoin: svgProps.strokeLinejoin ?? 'round',
      }
    );
  });

  return (
    <span
      {...props}
      className={iconClasses}
      style={iconStyle}
      {...(isDecorative
        ? { 'aria-hidden': true }
        : { role: props.role ?? 'img' })}>
      {processedChildren}
    </span>
  );
};
