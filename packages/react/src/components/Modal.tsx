import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  classNames,
  getModalContentClasses,
  modalWrapperClasses,
  modalMaskClasses,
  getModalContainerClasses,
  modalHeaderClasses,
  modalTitleClasses,
  modalCloseButtonClasses,
  modalBodyClasses,
  modalFooterClasses,
  type ModalProps as CoreModalProps,
} from '@tigercat/core';

export interface ModalProps extends CoreModalProps {
  /**
   * Modal content
   */
  children?: React.ReactNode;

  /**
   * Modal title content (alternative to title prop)
   */
  titleContent?: React.ReactNode;

  /**
   * Modal footer content
   */
  footer?: React.ReactNode;

  /**
   * Callback when modal visibility changes
   */
  onVisibleChange?: (visible: boolean) => void;

  /**
   * Callback when modal is closed
   */
  onClose?: () => void;

  /**
   * Callback when cancel button or close action is triggered
   */
  onCancel?: () => void;

  /**
   * Callback when OK button is clicked
   */
  onOk?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  visible = false,
  size = 'md',
  title,
  titleContent,
  closable = true,
  mask = true,
  maskClosable = true,
  centered = false,
  destroyOnClose = false,
  zIndex = 1000,
  className,
  children,
  footer,
  onVisibleChange,
  onClose,
  onCancel,
}) => {
  const [hasRendered, setHasRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Track if modal has ever been rendered
  useEffect(() => {
    if (visible) {
      setHasRendered(true);
      setIsAnimating(true);
    } else {
      // Delay unmounting for exit animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Notify parent of visibility changes
  useEffect(() => {
    if (onVisibleChange) {
      onVisibleChange(visible);
    }
    if (!visible && onClose) {
      onClose();
    }
  }, [visible, onVisibleChange, onClose]);

  const shouldRender = destroyOnClose ? visible : hasRendered;

  const handleClose = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (maskClosable && event.target === event.currentTarget) {
        handleClose();
      }
    },
    [maskClosable, handleClose]
  );

  const contentClasses = useMemo(
    () => getModalContentClasses(size, className),
    [size, className]
  );

  const containerClasses = useMemo(
    () => getModalContainerClasses(centered),
    [centered]
  );

  // Close icon component
  const CloseIcon = (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  if (!shouldRender && !isAnimating) {
    return null;
  }

  const modalContent = (
    <div
      className={classNames(
        modalWrapperClasses,
        'transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
      style={{ zIndex }}>
      {/* Mask */}
      {mask && (
        <div
          className={classNames(
            modalMaskClasses,
            'transition-opacity duration-300',
            visible ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />
      )}

      {/* Content Container */}
      <div className={containerClasses} onClick={handleMaskClick}>
        <div
          className={classNames(
            contentClasses,
            'transition-all duration-300',
            visible
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-4'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title || titleContent ? 'modal-title' : undefined}>
          {/* Header */}
          {(title || titleContent || closable) && (
            <div className={modalHeaderClasses}>
              {/* Title */}
              {(title || titleContent) && (
                <h3 id="modal-title" className={modalTitleClasses}>
                  {titleContent || title}
                </h3>
              )}
              {/* Close button */}
              {closable && (
                <button
                  type="button"
                  className={modalCloseButtonClasses}
                  onClick={handleClose}
                  aria-label="Close">
                  {CloseIcon}
                </button>
              )}
            </div>
          )}

          {/* Body */}
          {children && <div className={modalBodyClasses}>{children}</div>}

          {/* Footer */}
          {footer && <div className={modalFooterClasses}>{footer}</div>}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
