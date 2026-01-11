import React from 'react';
import {
  classNames,
  getBadgeVariantClasses,
  badgeBaseClasses,
  badgeSizeClasses,
  dotSizeClasses,
  badgeTypeClasses,
  badgeWrapperClasses,
  badgePositionClasses,
  formatBadgeContent,
  shouldHideBadge,
  type BadgeProps as CoreBadgeProps,
} from '@tigercat/core';

export type BadgeProps = CoreBadgeProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'content'> & {
    /**
     * Badge content (children for wrapped mode)
     */
    children?: React.ReactNode;
  };

export const Badge: React.FC<BadgeProps> = ({
  variant = 'danger',
  size = 'md',
  type = 'number',
  content,
  max = 99,
  showZero = false,
  position = 'top-right',
  standalone = true,
  className,
  children,
  ['aria-label']: ariaLabelProp,
  ...props
}) => {
  const isDot = type === 'dot';
  const isHidden = shouldHideBadge(content, type, showZero);
  const displayContent = formatBadgeContent(content, max, showZero);

  const sizeClass = isDot ? dotSizeClasses[size] : badgeSizeClasses[size];
  const badgeClasses = classNames(
    badgeBaseClasses,
    getBadgeVariantClasses(variant),
    sizeClass,
    badgeTypeClasses[type],
    !standalone && badgePositionClasses[position],
    className
  );

  const computedAriaLabel =
    ariaLabelProp ??
    (isDot
      ? 'notification'
      : type === 'number'
      ? `${displayContent} notifications`
      : `${displayContent ?? ''}`);

  // If badge should be hidden, render only children (or nothing if standalone)
  if (isHidden) {
    if (standalone) {
      return null;
    }
    return <>{children}</>;
  }

  // Create badge element
  const badgeElement = (
    <span
      {...props}
      className={badgeClasses}
      role="status"
      aria-label={computedAriaLabel}>
      {!isDot && displayContent}
    </span>
  );

  // If standalone, return badge only
  if (standalone) {
    return badgeElement;
  }

  // If wrapping content, return wrapper with badge and children
  return (
    <span className={badgeWrapperClasses}>
      {children}
      {badgeElement}
    </span>
  );
};
