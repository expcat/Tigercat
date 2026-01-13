import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  classNames,
  getPopconfirmIconPath,
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
  popconfirmIconPathStrokeLinecap,
  popconfirmIconPathStrokeLinejoin,
  popconfirmIconStrokeWidth,
  popconfirmIconViewBox,
  type PopconfirmProps as CorePopconfirmProps,
  type PopconfirmIconType,
} from '@tigercat/core';

let popconfirmIdCounter = 0;
const createPopconfirmId = () => `tiger-popconfirm-${++popconfirmIdCounter}`;

const PopconfirmIcon: React.FC<{ type: PopconfirmIconType }> = ({ type }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={popconfirmIconViewBox}
    strokeWidth={popconfirmIconStrokeWidth}
    stroke="currentColor">
    <path
      strokeLinecap={popconfirmIconPathStrokeLinecap}
      strokeLinejoin={popconfirmIconPathStrokeLinejoin}
      d={getPopconfirmIconPath(type)}
    />
  </svg>
);

export type PopconfirmProps = Omit<CorePopconfirmProps, 'style'> &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'style'
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
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [currentVisible]);

  useEffect(() => {
    if (!currentVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

      if (React.isValidElement<{ onClick?: unknown }>(target)) {
        const onChildClick = target.props.onClick;
        if (typeof onChildClick === 'function') {
          (onChildClick as (e: React.MouseEvent) => void)(event);
        }
      }

      if (event.defaultPrevented) return;
      handleTriggerClick();
    },
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': Boolean(currentVisible),
    'aria-controls': currentVisible ? popconfirmId : undefined,
  };

  type TriggerChildProps = {
    className?: string;
    onClick?: unknown;
  };

  const triggerNode = (() => {
    if (React.isValidElement<TriggerChildProps>(children)) {
      return React.cloneElement(children, {
        ...triggerProps,
        className: classNames(children.props.className, triggerProps.className),
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
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleTriggerClick();
          }
        }}>
        {children}
      </div>
    );
  })();

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={mergedStyle}
      {...divProps}>
      {triggerNode}

      <div
        className={contentWrapperClasses}
        hidden={!currentVisible}
        aria-hidden={!currentVisible}>
        <div className="relative">
          <div className={arrowClasses} aria-hidden="true" />
          <div
            id={popconfirmId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            className={contentClasses}>
            <div className="flex items-start">
              {showIcon && (
                <div className={iconClasses} aria-hidden="true">
                  <PopconfirmIcon type={icon} />
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
                onClick={handleCancel}>
                {cancelText}
              </button>
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
    </div>
  );
};
