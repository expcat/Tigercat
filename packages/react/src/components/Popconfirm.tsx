import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from 'react';
import {
  classNames,
  getPopconfirmContainerClasses,
  getPopconfirmTriggerClasses,
  getPopconfirmContentClasses,
  getPopconfirmTitleClasses,
  getPopconfirmDescriptionClasses,
  getPopconfirmIconClasses,
  getPopconfirmButtonsClasses,
  getPopconfirmCancelButtonClasses,
  getPopconfirmOkButtonClasses,
  getDropdownMenuWrapperClasses,
  type PopconfirmProps as CorePopconfirmProps,
  type PopconfirmIconType,
} from '@tigercat/core';

// Icon components
const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const QuestionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
    />
  </svg>
);

const iconMap: Record<PopconfirmIconType, React.FC> = {
  warning: WarningIcon,
  info: InfoIcon,
  error: ErrorIcon,
  success: SuccessIcon,
  question: QuestionIcon,
};

export interface PopconfirmProps extends CorePopconfirmProps {
  /**
   * The element to trigger the popconfirm
   */
  children?: React.ReactNode;

  /**
   * Custom title content (alternative to title prop)
   */
  titleContent?: React.ReactNode;

  /**
   * Custom description content (alternative to description prop)
   */
  descriptionContent?: React.ReactNode;

  /**
   * Callback when visibility changes
   */
  onVisibleChange?: (visible: boolean) => void;

  /**
   * Callback when confirm button is clicked
   */
  onConfirm?: () => void;

  /**
   * Callback when cancel button is clicked
   */
  onCancel?: () => void;
}

export const Popconfirm: React.FC<PopconfirmProps> = ({
  visible,
  defaultVisible = false,
  title = '确定要执行此操作吗？',
  description,
  icon = 'warning',
  showIcon = true,
  okText = '确定',
  cancelText = '取消',
  okType = 'primary',
  placement = 'top',
  disabled = false,
  className,
  children,
  titleContent,
  descriptionContent,
  onVisibleChange,
  onConfirm,
  onCancel,
}) => {
  // Internal state for uncontrolled mode
  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  // Computed visible state (controlled or uncontrolled)
  const currentVisible = visible !== undefined ? visible : internalVisible;

  // Ref to the container element
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle visibility change
  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (disabled) return;

      // Update internal state if uncontrolled
      if (visible === undefined) {
        setInternalVisible(newVisible);
      }

      // Notify parent
      if (onVisibleChange) {
        onVisibleChange(newVisible);
      }
    },
    [disabled, visible, onVisibleChange]
  );

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }
    setVisible(false);
  }, [onConfirm, setVisible]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
    setVisible(false);
  }, [onCancel, setVisible]);

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (disabled) return;
    setVisible(!currentVisible);
  }, [disabled, currentVisible, setVisible]);

  // Handle outside click to close popconfirm
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (containerRef.current && !containerRef.current.contains(target)) {
        // Close by calling onVisibleChange if in controlled mode, or update internal state
        if (visible !== undefined && onVisibleChange) {
          onVisibleChange(false);
        } else {
          setInternalVisible(false);
        }
      }
    };

    if (currentVisible) {
      // Use setTimeout to avoid immediate triggering on the same click that opened it
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [currentVisible, visible, onVisibleChange]);

  // Container classes
  const containerClasses = useMemo(
    () => classNames(getPopconfirmContainerClasses(), className),
    [className]
  );

  // Trigger classes
  const triggerClasses = useMemo(
    () => getPopconfirmTriggerClasses(disabled),
    [disabled]
  );

  // Content wrapper classes
  const contentWrapperClasses = useMemo(
    () => getDropdownMenuWrapperClasses(currentVisible, placement),
    [currentVisible, placement]
  );

  // Content classes
  const contentClasses = useMemo(() => getPopconfirmContentClasses(), []);

  // Title classes
  const titleClasses = useMemo(() => getPopconfirmTitleClasses(), []);

  // Description classes
  const descriptionClasses = useMemo(
    () => getPopconfirmDescriptionClasses(),
    []
  );

  // Icon classes
  const iconClasses = useMemo(() => getPopconfirmIconClasses(icon), [icon]);

  // Buttons classes
  const buttonsClasses = useMemo(() => getPopconfirmButtonsClasses(), []);

  // Cancel button classes
  const cancelButtonClasses = useMemo(
    () => getPopconfirmCancelButtonClasses(),
    []
  );

  // OK button classes
  const okButtonClasses = useMemo(
    () => getPopconfirmOkButtonClasses(okType),
    [okType]
  );

  // Icon component
  const IconComponent = iconMap[icon];

  if (!children) {
    return null;
  }

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Trigger */}
      <div className={triggerClasses} onClick={handleTriggerClick}>
        {children}
      </div>

      {/* Popconfirm content */}
      <div className={contentWrapperClasses} hidden={!currentVisible}>
        <div className={contentClasses}>
          {/* Title section with icon */}
          <div className="flex items-start">
            {/* Icon */}
            {showIcon && (
              <div className={iconClasses}>
                <IconComponent />
              </div>
            )}

            {/* Title and description */}
            <div className="flex-1">
              {/* Title */}
              <div className={titleClasses}>{titleContent || title}</div>

              {/* Description */}
              {(description || descriptionContent) && (
                <div className={descriptionClasses}>
                  {descriptionContent || description}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className={buttonsClasses}>
            {/* Cancel button */}
            <button
              type="button"
              className={cancelButtonClasses}
              onClick={handleCancel}>
              {cancelText}
            </button>

            {/* OK button */}
            <button
              type="button"
              className={okButtonClasses}
              onClick={handleConfirm}>
              {okText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
