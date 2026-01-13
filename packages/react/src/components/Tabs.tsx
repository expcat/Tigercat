import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useId,
  ReactElement,
} from "react";
import {
  classNames,
  getTabsContainerClasses,
  getTabNavClasses,
  getTabNavListClasses,
  tabAddButtonClasses,
  tabContentBaseClasses,
  type TabType,
  type TabSize,
  type TabPosition,
  type TabsProps as CoreTabsProps,
} from "@tigercat/core";
import { TabPane, type TabPaneProps } from "./TabPane";

// Tabs context interface
export interface TabsContextValue {
  activeKey: string | number | undefined;
  type: TabType;
  size: TabSize;
  tabPosition: TabPosition;
  closable: boolean;
  destroyInactiveTabPane: boolean;
  idBase: string;
  handleTabClick: (key: string | number) => void;
  handleTabClose: (key: string | number, event: React.SyntheticEvent) => void;
}

// Create tabs context
const TabsContext = createContext<TabsContextValue | null>(null);

// Hook to use tabs context
export function useTabsContext(): TabsContextValue | null {
  return useContext(TabsContext);
}

export interface TabsProps extends Omit<CoreTabsProps, "style"> {
  /**
   * Tab change event handler
   */
  onChange?: (key: string | number) => void;

  /**
   * Tab click event handler
   */
  onTabClick?: (key: string | number) => void;

  /**
   * Tab edit event handler (for closable tabs)
   */
  onEdit?: (info: {
    targetKey?: string | number;
    action: "add" | "remove";
  }) => void;

  /**
   * Tab panes
   */
  children?: React.ReactNode;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;
}

export const Tabs: React.FC<TabsProps> = ({
  activeKey: controlledActiveKey,
  defaultActiveKey,
  type = "line",
  tabPosition = "top",
  size = "medium",
  closable = false,
  centered = false,
  destroyInactiveTabPane = false,
  className,
  style,
  onChange,
  onTabClick,
  onEdit,
  children,
}) => {
  const reactId = useId();
  const idBase = useMemo(
    () => `tiger-tabs-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [reactId]
  );

  // Internal state for uncontrolled mode
  const [internalActiveKey, setInternalActiveKey] = useState<
    string | number | undefined
  >(defaultActiveKey);

  // Container classes
  const containerClasses = useMemo(() => {
    return classNames(getTabsContainerClasses(tabPosition), className);
  }, [tabPosition, className]);

  // Tab nav classes
  const tabNavClasses = useMemo(() => {
    return getTabNavClasses(tabPosition, type);
  }, [tabPosition, type]);

  // Tab nav list classes
  const tabNavListClasses = useMemo(() => {
    return getTabNavListClasses(tabPosition, centered);
  }, [tabPosition, centered]);

  // Tab content classes
  const tabContentClasses = useMemo(() => {
    return tabContentBaseClasses;
  }, []);

  // Extract tab items and tab panes from children
  const { tabItems, tabPanes, firstTabKey } = useMemo(() => {
    const items: ReactElement[] = [];
    const panes: ReactElement[] = [];
    let firstKey: string | number | undefined;

    const childrenArray: ReactElement<TabPaneProps>[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<TabPaneProps>(child) && child.type === TabPane) {
        childrenArray.push(child);
      }
    });

    const resolvedFirstKey = childrenArray[0]?.props.tabKey;
    if (resolvedFirstKey !== undefined) {
      firstKey = resolvedFirstKey;
    }

    const resolvedActiveKey =
      controlledActiveKey !== undefined
        ? controlledActiveKey
        : defaultActiveKey !== undefined
        ? defaultActiveKey
        : firstKey;

    childrenArray.forEach((child) => {
      if (React.isValidElement<TabPaneProps>(child) && child.type === TabPane) {
        const key = child.props.tabKey;
        const tabId = `${idBase}-tab-${String(key)}`;
        const panelId = `${idBase}-panel-${String(key)}`;

        items.push(
          React.cloneElement(child, {
            renderMode: "tab",
            tabId,
            panelId,
            tabIndex: key === resolvedActiveKey ? 0 : -1,
          })
        );
        panes.push(
          React.cloneElement(child, { renderMode: "pane", tabId, panelId })
        );
      }
    });

    return { tabItems: items, tabPanes: panes, firstTabKey: firstKey };
  }, [children, controlledActiveKey, defaultActiveKey, idBase]);

  // Use controlled or uncontrolled state, defaulting to the first tab if none is specified
  const activeKey =
    controlledActiveKey !== undefined
      ? controlledActiveKey
      : internalActiveKey !== undefined
      ? internalActiveKey
      : firstTabKey;

  // Handle tab click
  const handleTabClick = useCallback(
    (key: string | number) => {
      onTabClick?.(key);

      if (key === activeKey) {
        return;
      }

      // Update internal state if uncontrolled
      if (controlledActiveKey === undefined) {
        setInternalActiveKey(key);
      }

      onChange?.(key);
    },
    [activeKey, controlledActiveKey, onChange, onTabClick]
  );

  // Handle tab close
  const handleTabClose = useCallback(
    (key: string | number, event: React.SyntheticEvent) => {
      event.stopPropagation();

      onEdit?.({ targetKey: key, action: "remove" });
    },
    [onEdit]
  );

  const handleTabAdd = useCallback(() => {
    onEdit?.({ targetKey: undefined, action: "add" });
  }, [onEdit]);

  // Context value
  const contextValue = useMemo<TabsContextValue>(
    () => ({
      activeKey,
      type,
      size,
      tabPosition,
      closable,
      destroyInactiveTabPane,
      idBase,
      handleTabClick,
      handleTabClose,
    }),
    [
      activeKey,
      type,
      size,
      tabPosition,
      closable,
      destroyInactiveTabPane,
      idBase,
      handleTabClick,
      handleTabClose,
    ]
  );

  // Render tab nav
  const tabNavContent = (
    <div className={tabNavClasses} role="tablist">
      <div className={tabNavListClasses}>
        {tabItems}
        {type === "editable-card" && (
          <button
            type="button"
            className={tabAddButtonClasses}
            onClick={handleTabAdd}
            aria-label="Add tab"
          >
            +
          </button>
        )}
      </div>
    </div>
  );

  // Render tab content
  const tabContent = <div className={tabContentClasses}>{tabPanes}</div>;

  // Render container based on position
  let content: React.ReactNode;
  if (tabPosition === "left" || tabPosition === "right") {
    content = (
      <>
        {tabNavContent}
        {tabContent}
      </>
    );
  } else if (tabPosition === "bottom") {
    content = (
      <>
        {tabContent}
        {tabNavContent}
      </>
    );
  } else {
    content = (
      <>
        {tabNavContent}
        {tabContent}
      </>
    );
  }

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={containerClasses} style={style}>
        {content}
      </div>
    </TabsContext.Provider>
  );
};
