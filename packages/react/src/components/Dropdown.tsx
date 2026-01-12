import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  classNames,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getDropdownMenuWrapperClasses,
  type DropdownProps as CoreDropdownProps,
} from '@tigercat/core';

const getReactComponentName = (type: unknown): string | undefined => {
  if (typeof type === 'function') {
    const fn = type as { displayName?: unknown; name?: unknown };
    const displayName =
      typeof fn.displayName === 'string' ? fn.displayName : undefined;
    const name = typeof fn.name === 'string' ? fn.name : undefined;
    return displayName ?? name;
  }

  if (typeof type === 'object' && type != null) {
    const obj = type as { displayName?: unknown; name?: unknown };
    const displayName =
      typeof obj.displayName === 'string' ? obj.displayName : undefined;
    const name = typeof obj.name === 'string' ? obj.name : undefined;
    return displayName ?? name;
  }

  return undefined;
};

// Dropdown context interface
export interface DropdownContextValue {
  closeOnClick: boolean;
  handleItemClick: () => void;
}

// Create dropdown context
export const DropdownContext = createContext<DropdownContextValue | null>(null);

export interface DropdownProps extends CoreDropdownProps {
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
  trigger = 'hover',
  placement = 'bottom-start',
  disabled = false,
  visible: controlledVisible,
  defaultVisible = false,
  closeOnClick = true,
  className,
  style,
  onVisibleChange,
  children,
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
      if (disabled) return;

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
    if (trigger !== 'hover') return;

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      setVisible(true);
    }, 100);
  }, [trigger, setVisible]);

  // Handle mouse leave (for hover trigger)
  const handleMouseLeave = useCallback(() => {
    if (trigger !== 'hover') return;

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 150);
  }, [trigger, setVisible]);

  // Handle click (for click trigger)
  const handleClick = useCallback(() => {
    if (trigger !== 'click') return;
    setVisible(!visible);
  }, [trigger, visible, setVisible]);

  // Handle outside click to close dropdown
  useEffect(() => {
    if (trigger !== 'click') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [trigger, setVisible]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  // Container classes
  const containerClasses = useMemo(() => {
    return classNames(
      getDropdownContainerClasses(),
      'tiger-dropdown-container',
      className
    );
  }, [className]);

  // Trigger classes
  const triggerClasses = useMemo(() => {
    return getDropdownTriggerClasses(disabled);
  }, [disabled]);

  // Menu wrapper classes
  const menuWrapperClasses = useMemo(() => {
    return getDropdownMenuWrapperClasses(visible, placement);
  }, [visible, placement]);

  // Context value
  const contextValue = useMemo<DropdownContextValue>(
    () => ({
      closeOnClick,
      handleItemClick,
    }),
    [closeOnClick, handleItemClick]
  );

  // Parse children to find trigger and menu
  const childrenArray = React.Children.toArray(children);
  let triggerElement: React.ReactNode = null;
  let menuElement: React.ReactNode = null;

  childrenArray.forEach((child) => {
    if (React.isValidElement(child)) {
      const childTypeName = getReactComponentName(child.type);
      if (childTypeName === 'DropdownMenu') {
        menuElement = child;
      } else {
        triggerElement = child;
      }
    } else {
      triggerElement = child;
    }
  });

  return (
    <DropdownContext.Provider value={contextValue}>
      <div ref={containerRef} className={containerClasses} style={style}>
        {/* Trigger element */}
        <div
          className={triggerClasses}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          {triggerElement}
        </div>

        {/* Dropdown menu */}
        <div
          className={menuWrapperClasses}
          hidden={!visible}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          {menuElement}
        </div>
      </div>
    </DropdownContext.Provider>
  );
};
