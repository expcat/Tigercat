import React, { useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  classNames,
  getDrawerMaskClasses,
  getDrawerContainerClasses,
  getDrawerPanelClasses,
  getDrawerHeaderClasses,
  getDrawerBodyClasses,
  getDrawerFooterClasses,
  getDrawerCloseButtonClasses,
  getDrawerTitleClasses,
  type DrawerProps as CoreDrawerProps,
} from '@tigercat/core';

export interface DrawerProps extends CoreDrawerProps {
  /**
   * Callback when drawer requests to close
   */
  onClose?: () => void;

  /**
   * Callback after drawer enter transition completes
   */
  onAfterEnter?: () => void;

  /**
   * Callback after drawer leave transition completes
   */
  onAfterLeave?: () => void;

  /**
   * Header content (alternative to title prop)
   */
  header?: React.ReactNode;

  /**
   * Drawer body content
   */
  children?: React.ReactNode;

  /**
   * Footer content
   */
  footer?: React.ReactNode;
}

const CloseIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const Drawer: React.FC<DrawerProps> = ({
  visible = false,
  placement = 'right',
  size = 'md',
  title,
  header,
  closable = true,
  mask = true,
  maskClosable = true,
  zIndex = 1000,
  className,
  bodyClassName,
  destroyOnClose = false,
  onClose,
  onAfterEnter,
  onAfterLeave,
  children,
  footer,
}) => {
  // Track if drawer has ever been opened (for destroyOnClose)
  const [hasBeenOpened, setHasBeenOpened] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setHasBeenOpened(true);
    }
  }, [visible]);

  // Handle close request
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Handle mask click
  const handleMaskClick = useCallback(() => {
    if (maskClosable) {
      handleClose();
    }
  }, [maskClosable, handleClose]);

  // Handle panel click (stop propagation)
  const handlePanelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [visible, handleClose]);

  // Track transition state for callbacks
  const [, setIsTransitioning] = React.useState(false);
  const previousVisible = React.useRef(false);

  useEffect(() => {
    if (visible !== previousVisible.current) {
      setIsTransitioning(true);
      previousVisible.current = visible;

      // Trigger after transition callbacks
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        if (visible) {
          onAfterEnter?.();
        } else {
          onAfterLeave?.();
        }
      }, 300); // Match transition duration

      return () => clearTimeout(timer);
    }
  }, [visible, onAfterEnter, onAfterLeave]);

  // Computed classes
  const maskClasses = useMemo(() => getDrawerMaskClasses(visible), [visible]);

  const containerClasses = useMemo(
    () => getDrawerContainerClasses(zIndex),
    [zIndex]
  );

  const panelClasses = useMemo(
    () =>
      classNames(
        getDrawerPanelClasses(placement, visible, size),
        'flex flex-col',
        className
      ),
    [placement, visible, size, className]
  );

  const headerClasses = useMemo(() => getDrawerHeaderClasses(), []);

  const bodyClasses = useMemo(
    () => getDrawerBodyClasses(bodyClassName),
    [bodyClassName]
  );

  const footerClasses = useMemo(() => getDrawerFooterClasses(), []);

  const closeButtonClasses = useMemo(() => getDrawerCloseButtonClasses(), []);

  const titleClasses = useMemo(() => getDrawerTitleClasses(), []);

  // Don't render if destroyOnClose is true and drawer has never been opened
  if (destroyOnClose && !hasBeenOpened) {
    return null;
  }

  // Don't render if destroyOnClose is true and drawer is not visible
  if (destroyOnClose && !visible) {
    return null;
  }

  // Match library expectations: when not visible, do not render anything.
  // This also prevents portal DOM from lingering in tests.
  if (!visible) {
    return null;
  }

  // Render drawer content
  const drawerContent = (
    <div className={containerClasses}>
      {mask && (
        <div
          className={maskClasses}
          onClick={handleMaskClick}
          aria-hidden="true"
        />
      )}
      <div
        className={panelClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        onClick={handlePanelClick}>
        {(title || header || closable) && (
          <div className={headerClasses}>
            {(title || header) && (
              <div className={titleClasses} id="drawer-title">
                {header || title}
              </div>
            )}
            {closable && (
              <button
                type="button"
                className={closeButtonClasses}
                onClick={handleClose}
                aria-label="Close drawer">
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className={bodyClasses}>{children}</div>
        {footer && <div className={footerClasses}>{footer}</div>}
      </div>
    </div>
  );

  // Use portal to render at document body
  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }

  return null;
};
