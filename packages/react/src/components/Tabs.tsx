import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactElement,
} from 'react';
import {
  classNames,
  getTabsContainerClasses,
  getTabNavClasses,
  getTabNavListClasses,
  tabContentBaseClasses,
  type TabType,
  type TabSize,
  type TabsProps as CoreTabsProps,
} from '@tigercat/core';
import { TabPane, type TabPaneProps } from './TabPane';

// Tabs context interface
export interface TabsContextValue {
  activeKey: string | number | undefined;
  type: TabType;
  size: TabSize;
  closable: boolean;
  destroyInactiveTabPane: boolean;
  handleTabClick: (key: string | number) => void;
  handleTabClose: (key: string | number, event: React.MouseEvent) => void;
}

// Create tabs context
const TabsContext = createContext<TabsContextValue | null>(null);

// Hook to use tabs context
export function useTabsContext(): TabsContextValue | null {
  return useContext(TabsContext);
}

export interface TabsProps extends CoreTabsProps {
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
    targetKey: string | number;
    action: 'add' | 'remove';
  }) => void;

  /**
   * Tab panes
   */
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  activeKey: controlledActiveKey,
  defaultActiveKey,
  type = 'line',
  tabPosition = 'top',
  size = 'medium',
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
  // Internal state for uncontrolled mode
  const [internalActiveKey, setInternalActiveKey] = useState<
    string | number | undefined
  >(defaultActiveKey);

  // Use controlled or uncontrolled state
  const activeKey =
    controlledActiveKey !== undefined ? controlledActiveKey : internalActiveKey;

  // Handle tab click
  const handleTabClick = useCallback(
    (key: string | number) => {
      // Update internal state if uncontrolled
      if (controlledActiveKey === undefined) {
        setInternalActiveKey(key);
      }

      // Call event handlers
      onChange?.(key);
      onTabClick?.(key);
    },
    [controlledActiveKey, onChange, onTabClick]
  );

  // Handle tab close
  const handleTabClose = useCallback(
    (key: string | number, event: React.MouseEvent) => {
      event.stopPropagation();

      // Call event handler
      onEdit?.({ targetKey: key, action: 'remove' });
    },
    [onEdit]
  );

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

  // Context value
  const contextValue = useMemo<TabsContextValue>(
    () => ({
      activeKey,
      type,
      size,
      closable,
      destroyInactiveTabPane,
      handleTabClick,
      handleTabClose,
    }),
    [
      activeKey,
      type,
      size,
      closable,
      destroyInactiveTabPane,
      handleTabClick,
      handleTabClose,
    ]
  );

  // Extract tab items and tab panes from children
  const { tabItems, tabPanes } = useMemo(() => {
    const items: ReactElement[] = [];
    const panes: ReactElement[] = [];

    React.Children.forEach(children, (child) => {
      if (React.isValidElement<TabPaneProps>(child) && child.type === TabPane) {
        items.push(React.cloneElement(child, { renderMode: 'tab' }));
        panes.push(React.cloneElement(child, { renderMode: 'pane' }));
      }
    });

    return { tabItems: items, tabPanes: panes };
  }, [children]);

  // Render tab nav
  const tabNavContent = (
    <div className={tabNavClasses} role="tablist">
      <div className={tabNavListClasses}>{tabItems}</div>
    </div>
  );

  // Render tab content
  const tabContent = <div className={tabContentClasses}>{tabPanes}</div>;

  // Render container based on position
  let content: React.ReactNode;
  if (tabPosition === 'left' || tabPosition === 'right') {
    content = (
      <>
        {tabNavContent}
        {tabContent}
      </>
    );
  } else if (tabPosition === 'bottom') {
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
