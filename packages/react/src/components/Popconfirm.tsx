import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  classNames,
  getPopconfirmContainerClasses,
  getPopconfirmTriggerClasses,
  getPopconfirmContentClasses,
  getPopconfirmTitleClasses,
  getPopconfirmDescriptionClasses,
  getPopconfirmIconClasses,
  getPopconfirmArrowClasses,
  getPopconfirmButtonsClasses,
  getPopconfirmCancelButtonClasses,
  getPopconfirmOkButtonClasses,
  getDropdownMenuWrapperClasses,
  mergeStyleValues,
  type PopconfirmProps as CorePopconfirmProps,
  type PopconfirmIconType,
} from "@tigercat/core";

let popconfirmIdCounter = 0;
const createPopconfirmId = () => `tiger-popconfirm-${++popconfirmIdCounter}`;

// Icon components
const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
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
    stroke="currentColor"
  >
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
    stroke="currentColor"
  >
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
    stroke="currentColor"
  >
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
    stroke="currentColor"
  >
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

export type PopconfirmProps = Omit<CorePopconfirmProps, "style"> &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children" | "className" | "style"
  > & {
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
    className?: string;
    style?: React.CSSProperties;
  };

export const Popconfirm: React.FC<PopconfirmProps> = ({
  visible,
  defaultVisible = false,
  title = "确定要执行此操作吗？",
  description,
  icon = "warning",
  showIcon = true,
  okText = "确定",
  cancelText = "取消",
  okType = "primary",
  placement = "top",
  disabled = false,
  className,
  style,
  children,
  titleContent,
  descriptionContent,
  onVisibleChange,
  onConfirm,
  onCancel,
  ...divProps
}) => {
  const isControlled = visible !== undefined;
  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const currentVisible = isControlled ? visible : internalVisible;

  // Ref to the container element
  const containerRef = useRef<HTMLDivElement>(null);

  const popconfirmIdRef = useRef<string | null>(null);
  if (!popconfirmIdRef.current) {
    popconfirmIdRef.current = createPopconfirmId();
  }
  const popconfirmId = popconfirmIdRef.current;
  const titleId = `${popconfirmId}-title`;
  const descriptionId = `${popconfirmId}-description`;
  const describedBy =
    description || descriptionContent ? descriptionId : undefined;

  // Handle visibility change
  const setVisible = (newVisible: boolean) => {
    if (disabled && newVisible) return;

    if (!isControlled) {
      setInternalVisible(newVisible);
    }

    onVisibleChange?.(newVisible);
  };

  // Handle confirm
  const handleConfirm = () => {
    onConfirm?.();
    setVisible(false);
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel?.();
    setVisible(false);
  };

  // Handle trigger click
  const handleTriggerClick = () => {
    if (disabled) return;
    setVisible(!currentVisible);
  };

  // Handle outside click to close popconfirm
  useEffect(() => {
    if (!currentVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!target) return;
      if (containerRef.current?.contains(target as Node)) return;
      setVisible(false);
    };

    const timeoutId = window.setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [currentVisible]);

  useEffect(() => {
    if (!currentVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setVisible(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentVisible]);

  // Container classes
  const containerClasses = useMemo(
    () => classNames(getPopconfirmContainerClasses(), className),
    [className]
  );

  const triggerClasses = useMemo(
    () => getPopconfirmTriggerClasses(disabled),
    [disabled]
  );

  const contentWrapperClasses = useMemo(
    () => getDropdownMenuWrapperClasses(Boolean(currentVisible), placement),
    [currentVisible, placement]
  );

  const arrowClasses = useMemo(
    () => getPopconfirmArrowClasses(placement),
    [placement]
  );
  const contentClasses = useMemo(() => getPopconfirmContentClasses(), []);
  const titleClasses = useMemo(() => getPopconfirmTitleClasses(), []);
  const descriptionClasses = useMemo(
    () => getPopconfirmDescriptionClasses(),
    []
  );
  const iconClasses = useMemo(() => getPopconfirmIconClasses(icon), [icon]);
  const buttonsClasses = useMemo(() => getPopconfirmButtonsClasses(), []);
  const cancelButtonClasses = useMemo(
    () => getPopconfirmCancelButtonClasses(),
    []
  );
  const okButtonClasses = useMemo(
    () => getPopconfirmOkButtonClasses(okType),
    [okType]
  );

  // Icon component
  const IconComponent = iconMap[icon];

  if (!children) {
    return null;
  }

  const mergedStyle = mergeStyleValues(style) as
    | React.CSSProperties
    | undefined;

  const triggerProps = {
    className: triggerClasses,
    onClick: (event: React.MouseEvent) => {
      const target = children;

      if (React.isValidElement(target)) {
        const onChildClick = (target.props as { onClick?: unknown }).onClick;
        if (typeof onChildClick === "function") {
          (onChildClick as (e: React.MouseEvent) => void)(event);
        }
      }

      if (event.defaultPrevented) return;
      handleTriggerClick();
    },
    "aria-haspopup": "dialog" as const,
    "aria-expanded": Boolean(currentVisible),
    "aria-controls": currentVisible ? popconfirmId : undefined,
  };

  const triggerNode = (() => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...(children.props || {}),
        ...triggerProps,
        className: classNames(
          (children.props as { className?: string }).className,
          triggerProps.className
        ),
      });
    }

    return (
      <div
        {...triggerProps}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleTriggerClick();
          }
        }}
      >
        {children}
      </div>
    );
  })();

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={mergedStyle}
      {...divProps}
    >
      {triggerNode}

      <div
        className={contentWrapperClasses}
        hidden={!currentVisible}
        aria-hidden={!currentVisible}
      >
        <div className="relative">
          <div className={arrowClasses} aria-hidden="true" />
          <div
            id={popconfirmId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            className={contentClasses}
          >
            <div className="flex items-start">
              {showIcon && (
                <div className={iconClasses} aria-hidden="true">
                  <IconComponent />
                </div>
              )}

              <div className="flex-1">
                <div id={titleId} className={titleClasses}>
                  {titleContent || title}
                </div>

                {(description || descriptionContent) && (
                  <div id={descriptionId} className={descriptionClasses}>
                    {descriptionContent || description}
                  </div>
                )}
              </div>
            </div>

            <div className={buttonsClasses}>
              <button
                type="button"
                className={cancelButtonClasses}
                onClick={handleCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={okButtonClasses}
                onClick={handleConfirm}
              >
                {okText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
