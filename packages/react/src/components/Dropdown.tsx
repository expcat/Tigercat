import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  classNames,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getDropdownMenuWrapperClasses,
  type DropdownProps as CoreDropdownProps,
} from "@tigercat/core";
import { DropdownMenu } from "./DropdownMenu";

// Dropdown context interface
export interface DropdownContextValue {
  closeOnClick: boolean;
  handleItemClick: () => void;
}

// Create dropdown context
export const DropdownContext = createContext<DropdownContextValue | null>(null);

export interface DropdownProps
  extends Omit<CoreDropdownProps, "style">,
    Omit<React.HTMLAttributes<HTMLDivElement>, "style"> {
  style?: React.CSSProperties;

  /**
   * Visibility change event handler
   */
  onVisibleChange?: (visible: boolean) => void;

  /**
   * Dropdown content (trigger and menu)
   */
  children?: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger = "hover",
  placement = "bottom-start",
  disabled = false,
  visible: controlledVisible,
  defaultVisible = false,
  closeOnClick = true,
  className,
  style,
  onVisibleChange,
  children,
  onKeyDown,
  ...divProps
}) => {
  // Internal state for uncontrolled mode
  const [internalVisible, setInternalVisible] = useState(defaultVisible);

  // Use controlled or uncontrolled state
  const visible =
    controlledVisible !== undefined ? controlledVisible : internalVisible;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle visibility change
  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (disabled && newVisible) return;

      // Update internal state if uncontrolled
      if (controlledVisible === undefined) {
        setInternalVisible(newVisible);
      }

      // Call event handler
      onVisibleChange?.(newVisible);
    },
    [disabled, controlledVisible, onVisibleChange]
  );

  // Handle item click (close dropdown)
  const handleItemClick = useCallback(() => {
    if (closeOnClick) {
      setVisible(false);
    }
  }, [closeOnClick, setVisible]);

  // Handle mouse enter (for hover trigger)
  const handleMouseEnter = useCallback(() => {
    if (trigger !== "hover") return;

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      setVisible(true);
    }, 100);
  }, [trigger, setVisible]);

  // Handle mouse leave (for hover trigger)
  const handleMouseLeave = useCallback(() => {
    if (trigger !== "hover") return;

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 150);
  }, [trigger, setVisible]);

  // Handle click (for click trigger)
  const handleClick = useCallback(() => {
    if (trigger !== "click") return;
    setVisible(!visible);
  }, [trigger, visible, setVisible]);

  // Handle outside click to close dropdown
  useEffect(() => {
    if (trigger !== "click") return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [trigger, setVisible]);

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, setVisible]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const containerClasses = classNames(
    getDropdownContainerClasses(),
    "tiger-dropdown-container",
    className
  );

  const triggerClasses = getDropdownTriggerClasses(disabled);

  const menuWrapperClasses = getDropdownMenuWrapperClasses(visible, placement);

  const contextValue: DropdownContextValue = {
    closeOnClick,
    handleItemClick,
  };

  // Parse children to find trigger and menu
  const childrenArray = React.Children.toArray(children);
  let triggerElement: React.ReactNode = null;
  let menuElement: React.ReactNode = null;

  childrenArray.forEach((child) => {
    if (!React.isValidElement(child)) {
      if (triggerElement == null) triggerElement = child;
      return;
    }

    if (child.type === DropdownMenu) {
      menuElement = child;
      return;
    }

    if (triggerElement == null) {
      triggerElement = child;
    }
  });

  const handleContainerKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      setVisible(false);
    }
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={containerClasses}
        style={style}
        onKeyDown={handleContainerKeyDown}
        {...divProps}
      >
        {/* Trigger element */}
        <div
          className={triggerClasses}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-haspopup="menu"
          aria-expanded={visible}
        >
          {triggerElement}
        </div>

        {/* Dropdown menu */}
        <div
          className={menuWrapperClasses}
          hidden={!visible}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {menuElement}
        </div>
      </div>
    </DropdownContext.Provider>
  );
};
