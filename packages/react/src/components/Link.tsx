import React, { useCallback, useMemo } from 'react';
import {
  classNames,
  getLinkVariantClasses,
  getSecureRel,
  linkBaseClasses,
  linkDisabledClasses,
  linkSizeClasses,
  type LinkProps as CoreLinkProps,
} from '@tigercat/core';

export interface LinkProps
  extends CoreLinkProps,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'target' | 'rel' | 'onClick' | 'children'
    > {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  children?: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  href,
  target,
  rel,
  underline = true,
  onClick,
  onKeyDown,
  tabIndex,
  children,
  className,
  ...props
}) => {
  const linkClasses = useMemo(
    () =>
      classNames(
        linkBaseClasses,
        getLinkVariantClasses(variant, undefined, { disabled }),
        linkSizeClasses[size],
        underline && 'hover:underline',
        disabled && linkDisabledClasses,
        className
      ),
    [variant, size, underline, disabled, className]
  );

  const computedRel = useMemo(() => getSecureRel(target, rel), [target, rel]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    },
    [disabled, onClick]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onKeyDown?.(event);
    },
    [disabled, onKeyDown]
  );

  return (
    <a
      className={linkClasses}
      href={disabled ? undefined : href}
      target={target}
      rel={computedRel}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}>
      {children}
    </a>
  );
};
