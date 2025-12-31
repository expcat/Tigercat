import React, { useMemo } from 'react'
import {
  classNames,
  getTabItemClasses,
  getTabPaneClasses,
  isKeyActive,
  type TabPaneProps as CoreTabPaneProps,
} from '@tigercat/core'
import { useTabsContext } from './Tabs'

export interface TabPaneProps extends Omit<CoreTabPaneProps, 'tabKey' | 'icon'> {
  /**
   * Unique key for the tab pane (required)
   * Note: In React we use 'key' prop, but internally we use 'tabKey' to avoid conflicts
   */
  tabKey: string | number

  /**
   * Icon for the tab
   */
  icon?: React.ReactNode

  /**
   * Tab pane content
   */
  children?: React.ReactNode

  /**
   * Render mode - 'tab' for tab item, 'pane' for content pane
   * @internal
   */
  renderMode?: 'tab' | 'pane'
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
  renderMode = 'pane',
}) => {
  // Get tabs context
  const tabsContext = useTabsContext()

  if (!tabsContext) {
    throw new Error('TabPane must be used within a Tabs component')
  }

  // Check if this tab is active
  const isActive = useMemo(() => {
    return isKeyActive(tabKey, tabsContext.activeKey)
  }, [tabKey, tabsContext.activeKey])

  // Check if tab is closable
  const isClosable = useMemo(() => {
    return closable !== undefined
      ? closable
      : tabsContext.closable && tabsContext.type === 'editable-card'
  }, [closable, tabsContext.closable, tabsContext.type])

  // Tab item classes
  const tabItemClasses = useMemo(() => {
    return classNames(
      getTabItemClasses(isActive, disabled, tabsContext.type, tabsContext.size)
    )
  }, [isActive, disabled, tabsContext.type, tabsContext.size])

  // Tab pane classes
  const tabPaneClasses = useMemo(() => {
    return classNames(getTabPaneClasses(isActive), className)
  }, [isActive, className])

  // Handle tab click
  const handleClick = () => {
    if (!disabled) {
      tabsContext.handleTabClick(tabKey)
    }
  }

  // Handle close click
  const handleClose = (event: React.MouseEvent) => {
    if (!disabled) {
      tabsContext.handleTabClose(tabKey, event)
    }
  }

  // Render tab item (in the tab nav)
  if (renderMode === 'tab') {
    return (
      <div
        className={tabItemClasses}
        role="tab"
        aria-selected={isActive}
        aria-disabled={disabled}
        onClick={handleClick}
      >
        {/* Icon */}
        {icon && <span className="flex items-center">{icon}</span>}
        {/* Label */}
        <span>{label}</span>
        {/* Close button */}
        {isClosable && (
          <span
            className="ml-2 p-0.5 rounded hover:bg-gray-200 transition-colors duration-150"
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
          </span>
        )}
      </div>
    )
  }

  // Render tab pane content
  const shouldRender = isActive || !tabsContext.destroyInactiveTabPane
  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={tabPaneClasses}
      style={style}
      role="tabpanel"
      aria-hidden={!isActive}
    >
      {children}
    </div>
  )
}
