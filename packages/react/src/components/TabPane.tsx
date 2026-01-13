import React, { useMemo } from "react";
import {
  classNames,
  getTabItemClasses,
  getTabPaneClasses,
  isKeyActive,
  tabCloseButtonClasses,
  type TabPaneProps as CoreTabPaneProps,
} from "@tigercat/core";
import { useTabsContext } from "./Tabs";

export interface TabPaneProps
  extends Omit<CoreTabPaneProps, "tabKey" | "icon" | "style"> {
  /**
   * Unique key for the tab pane (required)
   * Note: In React we use 'key' prop, but internally we use 'tabKey' to avoid conflicts
   */
  tabKey: string | number;

  /**
   * Icon for the tab
   */
  icon?: React.ReactNode;

  /**
   * Tab pane content
   */
  children?: React.ReactNode;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * Render mode - 'tab' for tab item, 'pane' for content pane
   * @internal
   */
  renderMode?: "tab" | "pane";

  /**
   * @internal
   */
  tabId?: string;

  /**
   * @internal
   */
  panelId?: string;

  /**
   * @internal
   */
  tabIndex?: number;
}

export const TabPane: React.FC<TabPaneProps> = ({
  tabKey,
  label,
  disabled = false,
  closable,
  icon,
  className,
  style,
  children,
  renderMode = "pane",
  tabId,
  panelId,
  tabIndex,
}) => {
  // Get tabs context
  const tabsContext = useTabsContext();

  if (!tabsContext) {
    throw new Error("TabPane must be used within a Tabs component");
  }

  // Check if this tab is active
  const isActive = useMemo(() => {
    return isKeyActive(tabKey, tabsContext.activeKey);
  }, [tabKey, tabsContext.activeKey]);

  // Check if tab is closable
  const isClosable = useMemo(() => {
    return closable !== undefined
      ? closable
      : tabsContext.closable && tabsContext.type === "editable-card";
  }, [closable, tabsContext.closable, tabsContext.type]);

  // Tab item classes
  const tabItemClasses = useMemo(() => {
    return classNames(
      getTabItemClasses(isActive, disabled, tabsContext.type, tabsContext.size)
    );
  }, [isActive, disabled, tabsContext.type, tabsContext.size]);

  // Tab pane classes
  const tabPaneClasses = useMemo(() => {
    return classNames(getTabPaneClasses(isActive), className);
  }, [isActive, className]);

  // Handle tab click
  const handleClick = () => {
    if (!disabled) {
      tabsContext.handleTabClick(tabKey);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }

    if (isClosable && (event.key === "Backspace" || event.key === "Delete")) {
      event.preventDefault();
      tabsContext.handleTabClose(tabKey, event);
      return;
    }

    const isVertical =
      tabsContext.tabPosition === "left" || tabsContext.tabPosition === "right";

    const nextKeys = isVertical ? ["ArrowDown"] : ["ArrowRight"];
    const prevKeys = isVertical ? ["ArrowUp"] : ["ArrowLeft"];

    const key = event.key;
    if (
      nextKeys.includes(key) ||
      prevKeys.includes(key) ||
      key === "Home" ||
      key === "End" ||
      key === "Enter" ||
      key === " "
    ) {
      event.preventDefault();
    }

    if (key === "Enter" || key === " ") {
      tabsContext.handleTabClick(tabKey);
      return;
    }

    const tabList = (event.currentTarget as HTMLElement | null)?.closest(
      '[role="tablist"]'
    );

    const tabButtons = Array.from(
      tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
    );

    const enabled = tabButtons.filter((b) => !b.disabled);
    const currentIndex = enabled.findIndex((b) => b.id === tabId);
    if (currentIndex === -1) {
      return;
    }

    const focusByIndex = (index: number) => {
      const next = enabled[index];
      if (!next) return;
      next.focus();
      const nextKey = next.getAttribute("data-tiger-tab-key");
      if (nextKey != null) {
        const parsed: string | number = nextKey.startsWith("n:")
          ? Number(nextKey.slice(2))
          : nextKey.startsWith("s:")
          ? nextKey.slice(2)
          : nextKey;
        tabsContext.handleTabClick(parsed);
      }
    };

    if (nextKeys.includes(key)) {
      focusByIndex((currentIndex + 1) % enabled.length);
      return;
    }

    if (prevKeys.includes(key)) {
      focusByIndex((currentIndex - 1 + enabled.length) % enabled.length);
      return;
    }

    if (key === "Home") {
      focusByIndex(0);
      return;
    }

    if (key === "End") {
      focusByIndex(enabled.length - 1);
    }
  };

  // Handle close click
  const handleClose = (event: React.MouseEvent) => {
    if (!disabled) {
      tabsContext.handleTabClose(tabKey, event);
    }
  };

  // Render tab item (in the tab nav)
  if (renderMode === "tab") {
    return (
      <button
        type="button"
        className={tabItemClasses}
        role="tab"
        id={tabId}
        aria-controls={panelId}
        aria-selected={isActive}
        aria-disabled={disabled}
        disabled={disabled}
        tabIndex={typeof tabIndex === "number" ? tabIndex : isActive ? 0 : -1}
        data-tiger-tabs-id={tabsContext.idBase}
        data-tiger-tab-key={
          typeof tabKey === "number" ? `n:${tabKey}` : `s:${tabKey}`
        }
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Icon */}
        {icon && <span className="flex items-center">{icon}</span>}
        {/* Label */}
        <span>{label}</span>
        {/* Close button */}
        {isClosable && (
          <button
            type="button"
            className={tabCloseButtonClasses}
            aria-label={`Close ${String(label)}`}
            tabIndex={-1}
            onClick={handleClose}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </button>
    );
  }

  // Render tab pane content
  const shouldRender = isActive || !tabsContext.destroyInactiveTabPane;
  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={tabPaneClasses}
      style={style}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
};
