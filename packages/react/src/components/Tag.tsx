import React, { useCallback, useMemo, useState } from 'react';
import {
  classNames,
  getTagVariantClasses,
  defaultTagThemeColors,
  tagBaseClasses,
  tagSizeClasses,
  tagCloseButtonBaseClasses,
  tagCloseIconPath,
  type TagProps as CoreTagProps,
} from '@tigercat/core';

export interface TagProps extends CoreTagProps {
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Close event handler
   */
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Tag content
   */
  children?: React.ReactNode;
}

const CloseIcon: React.FC = () => (
  <svg
    className="h-3 w-3"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={tagCloseIconPath} />
  </svg>
);

export const Tag: React.FC<TagProps> = ({
  variant = 'default',
  size = 'md',
  closable = false,
  closeAriaLabel = 'Close tag',
  onClose,
  children,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const tagClasses = useMemo(
    () =>
      classNames(
        tagBaseClasses,
        getTagVariantClasses(variant),
        tagSizeClasses[size],
        className
      ),
    [variant, size, className]
  );

  const closeButtonClasses = useMemo(() => {
    const scheme = defaultTagThemeColors[variant];
    return classNames(
      tagCloseButtonBaseClasses,
      scheme.closeBgHover,
      scheme.text
    );
  }, [variant]);

  const handleClose = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (onClose) {
        onClose(event);
      }

      if (!event.defaultPrevented) {
        setIsVisible(false);
      }
    },
    [onClose]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <span className={tagClasses} role="status" {...props}>
      <span>{children}</span>
      {closable && (
        <button
          className={closeButtonClasses}
          onClick={handleClose}
          aria-label={closeAriaLabel}
          type="button">
          <CloseIcon />
        </button>
      )}
    </span>
  );
};
