import React, { useState, useMemo } from 'react';
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

export interface AvatarProps extends CoreAvatarProps {
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

  const hasImage = Boolean(src && !imageError);

  const avatarClasses = useMemo(() => {
    return classNames(
      avatarBaseClasses,
      avatarSizeClasses[size],
      avatarShapeClasses[shape],
      // Apply background and text color only for text/icon avatars
      !hasImage && bgColor,
      !hasImage && textColor,
      className
    );
  }, [size, shape, hasImage, bgColor, textColor, className]);

  const displayText = useMemo(() => {
    if (text) {
      return getInitials(text);
    }
    return '';
  }, [text]);

  const handleImageError = () => {
    setImageError(true);
  };

  // Priority: image > text > icon (children)

  // If src is provided and not errored, show image
  if (hasImage) {
    return (
      <span
        className={avatarClasses}
        role="img"
        aria-label={alt || 'avatar'}
        {...props}>
        <img
          src={src}
          alt={alt || 'avatar'}
          className={avatarImageClasses}
          onError={handleImageError}
        />
      </span>
    );
  }

  // If text is provided, show text
  if (displayText) {
    return (
      <span
        className={avatarClasses}
        role="img"
        aria-label={alt || text || 'avatar'}
        {...props}>
        {displayText}
      </span>
    );
  }

  // Otherwise, show icon from children
  return (
    <span
      className={avatarClasses}
      role="img"
      aria-label={alt || 'avatar'}
      {...props}>
      {children}
    </span>
  );
};
