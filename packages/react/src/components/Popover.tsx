import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  classNames,
  getPopoverContainerClasses,
  getPopoverTriggerClasses,
  getPopoverContentClasses,
  getPopoverTitleClasses,
  getPopoverContentTextClasses,
  getDropdownMenuWrapperClasses,
  type PopoverProps as CorePopoverProps,
} from "@tigercat/core";

let popoverIdCounter = 0;
const createPopoverId = () => `tiger-popover-${++popoverIdCounter}`;

export type PopoverProps = Omit<CorePopoverProps, "style"> &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children" | "className" | "style" | "title"
  > & {
    children?: React.ReactNode;
    titleContent?: React.ReactNode;
    contentContent?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onVisibleChange?: (visible: boolean) => void;
  };

export const Popover: React.FC<PopoverProps> = ({
  visible,
  defaultVisible = false,
  title,
  content,
  trigger = "click",
  placement = "top",
  disabled = false,
  width,
  className,
  style,
  children,
  titleContent,
  contentContent,
  onVisibleChange,
  ...divProps
}) => {
  const isControlled = visible !== undefined;
  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  const currentVisible = isControlled ? visible : internalVisible;

  const containerRef = useRef<HTMLDivElement>(null);

  const popoverIdRef = useRef<string | null>(null);
  if (!popoverIdRef.current) {
    popoverIdRef.current = createPopoverId();
  }
  const popoverId = popoverIdRef.current;
  const titleId = `${popoverId}-title`;
  const contentId = `${popoverId}-content`;

  const setVisible = useCallback(
    (nextVisible: boolean) => {
      if (disabled && nextVisible) return;

      if (!isControlled) {
        setInternalVisible(nextVisible);
      }

      onVisibleChange?.(nextVisible);
    },
    [disabled, isControlled, onVisibleChange]
  );

  const handleTriggerClick = () => {
    if (disabled || trigger !== "click") return;
    setVisible(!currentVisible);
  };

  const handleTriggerMouseEnter = () => {
    if (disabled || trigger !== "hover") return;
    setVisible(true);
  };

  const handleTriggerMouseLeave = () => {
    if (disabled || trigger !== "hover") return;
    setVisible(false);
  };

  const handleTriggerFocus = () => {
    if (disabled || trigger !== "focus") return;
    setVisible(true);
  };

  const handleTriggerBlur = () => {
    if (disabled || trigger !== "focus") return;
    setVisible(false);
  };

  useEffect(() => {
    if (!currentVisible || trigger !== "click") return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!target) return;
      if (containerRef.current?.contains(target as Node)) return;
      setVisible(false);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [currentVisible, trigger, setVisible]);

  useEffect(() => {
    if (!currentVisible || trigger === "manual") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setVisible(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentVisible, trigger, setVisible]);

  const containerClasses = classNames(getPopoverContainerClasses(), className);
  const triggerClasses = getPopoverTriggerClasses(disabled);
  const contentWrapperClasses = getDropdownMenuWrapperClasses(
    currentVisible,
    placement
  );
  const contentClasses = getPopoverContentClasses(width);
  const titleClasses = getPopoverTitleClasses();
  const contentTextClasses = getPopoverContentTextClasses();

  const triggerHandlers: React.DOMAttributes<HTMLDivElement> = {};
  if (trigger === "click") {
    triggerHandlers.onClick = handleTriggerClick;
  } else if (trigger === "hover") {
    triggerHandlers.onMouseEnter = handleTriggerMouseEnter;
    triggerHandlers.onMouseLeave = handleTriggerMouseLeave;
  } else if (trigger === "focus") {
    triggerHandlers.onFocus = handleTriggerFocus;
    triggerHandlers.onBlur = handleTriggerBlur;
  }

  if (!children) {
    return null;
  }

  const hasTitle = Boolean(title || titleContent);
  const hasContent = Boolean(content || contentContent);
  const describedBy = hasContent ? contentId : undefined;

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={style}
      {...divProps}
    >
      <div
        className={triggerClasses}
        aria-haspopup="dialog"
        aria-disabled={disabled ? "true" : undefined}
        {...triggerHandlers}
      >
        {children}
      </div>

      <div
        className={contentWrapperClasses}
        hidden={!currentVisible}
        aria-hidden={!currentVisible}
      >
        <div
          id={popoverId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={describedBy}
          className={contentClasses}
        >
          {hasTitle && (
            <div id={titleId} className={titleClasses}>
              {titleContent || title}
            </div>
          )}

          {hasContent && (
            <div id={contentId} className={contentTextClasses}>
              {contentContent || content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
