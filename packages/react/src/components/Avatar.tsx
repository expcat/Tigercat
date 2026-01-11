import React, { useState } from 'react';
import {
  classNames,
  avatarBaseClasses,
  avatarSizeClasses,
  avatarShapeClasses,
  avatarDefaultBgColor,
  avatarDefaultTextColor,
  avatarImageClasses,
  getInitials,
  type AvatarProps as CoreAvatarProps,
} from '@tigercat/core';

export interface AvatarProps
  extends CoreAvatarProps,
    React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Icon content (children for icon mode)
   */
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  shape = 'circle',
  src,
  alt = '',
  text,
  bgColor = avatarDefaultBgColor,
  textColor = avatarDefaultTextColor,
  className,
  children,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const hasImage = Boolean(src) && !imageError;
  const displayText = text ? getInitials(text) : '';

  const ariaLabelProp = props['aria-label'];
  const ariaLabelledbyProp = props['aria-labelledby'];
  const ariaHiddenProp = props['aria-hidden'];

  const computedLabel =
    ariaLabelProp ??
    (alt.trim() ? alt : undefined) ??
    (text?.trim() || undefined);

  const isDecorative =
    ariaHiddenProp === true || (!computedLabel && !ariaLabelledbyProp);

  const avatarClasses = classNames(
    avatarBaseClasses,
    avatarSizeClasses[size],
    avatarShapeClasses[shape],
    !hasImage && bgColor,
    !hasImage && textColor,
    className
  );

  // Priority: image > text > icon (children)

  // If src is provided and not errored, show image
  if (hasImage) {
    return (
      <span
        {...props}
        className={avatarClasses}
        aria-hidden={isDecorative ? true : props['aria-hidden']}>
        <img
          src={src}
          alt={alt}
          className={avatarImageClasses}
          onError={() => setImageError(true)}
        />
      </span>
    );
  }

  // If text is provided, show text
  if (displayText) {
    return (
      <span
        {...props}
        className={avatarClasses}
        {...(isDecorative
          ? { 'aria-hidden': true }
          : {
              role: 'img',
              'aria-label': computedLabel,
              'aria-labelledby': ariaLabelledbyProp,
            })}>
        {displayText}
      </span>
    );
  }

  // Otherwise, show icon from children
  return (
    <span
      {...props}
      className={avatarClasses}
      {...(isDecorative
        ? { 'aria-hidden': true }
        : {
            role: 'img',
            'aria-label': computedLabel,
            'aria-labelledby': ariaLabelledbyProp,
          })}>
      {children}
    </span>
  );
};
