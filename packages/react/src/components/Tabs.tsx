import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useId,
  useRef,
  ReactElement
} from 'react'
import {
  classNames,
  closeIconPathD,
  closeIconViewBox,
  getTabsContainerClasses,
  getTabItemClasses,
  getTabNavClasses,
  getTabNavListClasses,
  getTabNavListStyle,
  getTabPaneClasses,
  getTabIndicatorClasses,
  getTabIndicatorStyle,
  isKeyActive,
  tabAddButtonClasses,
  tabCloseButtonClasses,
  tabContentBaseClasses,
  type TabType,
  type TabSize,
  type TabPosition
} from '@expcat/tigercat-core'

// Tabs context interface
export interface TabsContextValue {
  activeKey: string | number | undefined
  type: TabType
  size: TabSize
  tabPosition: TabPosition
  closable: boolean
  destroyInactiveTabPane: boolean
  lazy: boolean
  idBase: string
  handleTabClick: (key: string | number) => void
  handleTabClose: (key: string | number, event: React.SyntheticEvent) => void
}

// Create tabs context
const TabsContext = createContext<TabsContextValue | null>(null)

// Hook to use tabs context
export function useTabsContext(): TabsContextValue | null {
  return useContext(TabsContext)
}

export interface TabPaneProps {
  /**
   * Unique key for the tab pane (required)
   */
  tabKey: string | number

  /**
   * Tab label/title
   */
  label: string

  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the tab can be closed (overrides parent closable)
   */
  closable?: boolean

  /**
   * Icon for the tab
   */
  icon?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Tab pane content
   */
  children?: React.ReactNode

  /**
   * Custom styles
   */
  style?: React.CSSProperties

  /**
   * Render mode - 'tab' for tab item, 'pane' for content pane
   * @internal
   */
  renderMode?: 'tab' | 'pane'

  /**
   * @internal
   */
  tabId?: string

  /**
   * @internal
   */
  panelId?: string

  /**
   * @internal
   */
  tabIndex?: number
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
  tabId,
  panelId,
  tabIndex
}) => {
  const tabsContext = useTabsContext()

  if (!tabsContext) {
    throw new Error('TabPane must be used within a Tabs component')
  }

  const isActive = useMemo(() => {
    return isKeyActive(tabKey, tabsContext.activeKey)
  }, [tabKey, tabsContext.activeKey])

  const hasBeenActivatedRef = useRef(isActive)
  if (isActive) hasBeenActivatedRef.current = true

  const isClosable = useMemo(() => {
    return closable !== undefined
      ? closable
      : tabsContext.closable && tabsContext.type === 'editable-card'
  }, [closable, tabsContext.closable, tabsContext.type])

  const tabItemClasses = useMemo(() => {
    return getTabItemClasses(isActive, disabled, tabsContext.type, tabsContext.size)
  }, [isActive, disabled, tabsContext.type, tabsContext.size])

  const tabPaneClasses = useMemo(() => {
    return classNames(getTabPaneClasses(isActive), className)
  }, [isActive, className])

  const handleClick = () => {
    if (!disabled) {
      tabsContext.handleTabClick(tabKey)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) {
      return
    }

    if (isClosable && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault()
      tabsContext.handleTabClose(tabKey, event)
      return
    }

    const isVertical = tabsContext.tabPosition === 'left' || tabsContext.tabPosition === 'right'

    const nextKeys = isVertical ? ['ArrowDown'] : ['ArrowRight']
    const prevKeys = isVertical ? ['ArrowUp'] : ['ArrowLeft']

    const key = event.key
    if (
      nextKeys.includes(key) ||
      prevKeys.includes(key) ||
      key === 'Home' ||
      key === 'End' ||
      key === 'Enter' ||
      key === ' '
    ) {
      event.preventDefault()
    }

    if (key === 'Enter' || key === ' ') {
      tabsContext.handleTabClick(tabKey)
      return
    }

    const tabList = (event.currentTarget as HTMLElement | null)?.closest('[role="tablist"]')

    const tabButtons = Array.from(
      tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
    )

    const enabled = tabButtons.filter((button) => !button.disabled)
    const currentIndex = enabled.findIndex((button) => button.id === tabId)
    if (currentIndex === -1) {
      return
    }

    const focusByIndex = (index: number) => {
      const next = enabled[index]
      if (!next) return
      next.focus()
      const nextKey = next.getAttribute('data-tiger-tab-key')
      if (nextKey != null) {
        const parsed: string | number = nextKey.startsWith('n:')
          ? Number(nextKey.slice(2))
          : nextKey.startsWith('s:')
            ? nextKey.slice(2)
            : nextKey
        tabsContext.handleTabClick(parsed)
      }
    }

    if (nextKeys.includes(key)) {
      focusByIndex((currentIndex + 1) % enabled.length)
      return
    }

    if (prevKeys.includes(key)) {
      focusByIndex((currentIndex - 1 + enabled.length) % enabled.length)
      return
    }

    if (key === 'Home') {
      focusByIndex(0)
      return
    }

    if (key === 'End') {
      focusByIndex(enabled.length - 1)
    }
  }

  const handleClose = (event: React.MouseEvent) => {
    if (!disabled) {
      tabsContext.handleTabClose(tabKey, event)
    }
  }

  if (renderMode === 'tab') {
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
        tabIndex={typeof tabIndex === 'number' ? tabIndex : isActive ? 0 : -1}
        data-tiger-tabs-id={tabsContext.idBase}
        data-tiger-tab-key={typeof tabKey === 'number' ? `n:${tabKey}` : `s:${tabKey}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}>
        {icon && <span className="flex items-center">{icon}</span>}
        <span>{label}</span>
        {isClosable && (
          <span
            role="button"
            className={tabCloseButtonClasses}
            aria-label={`Close ${String(label)}`}
            tabIndex={-1}
            onClick={handleClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox={closeIconViewBox}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={closeIconPathD}
              />
            </svg>
          </span>
        )}
      </button>
    )
  }

  const shouldRender = tabsContext.lazy
    ? hasBeenActivatedRef.current && (isActive || !tabsContext.destroyInactiveTabPane)
    : isActive || !tabsContext.destroyInactiveTabPane
  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={tabPaneClasses}
      style={style}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      aria-hidden={!isActive}>
      {children}
    </div>
  )
}

export interface TabsProps {
  /**
   * Currently active tab key
   */
  activeKey?: string | number
  /**
   * Default active tab key (for uncontrolled mode)
   */
  defaultActiveKey?: string | number
  /**
   * Tab type - line, card, or editable-card
   * @default 'line'
   */
  type?: TabType
  /**
   * Tab position - top, bottom, left, or right
   * @default 'top'
   */
  tabPosition?: TabPosition
  /**
   * Tab size - small, medium, or large
   * @default 'medium'
   */
  size?: TabSize
  /**
   * Whether tabs can be closed (only works with editable-card type)
   * @default false
   */
  closable?: boolean
  /**
   * Whether tabs are centered
   * @default false
   */
  centered?: boolean
  /**
   * Whether to destroy inactive tab panes
   * @default false
   */
  destroyInactiveTabPane?: boolean
  /**
   * Whether to lazily render tab panes (only render when first activated)
   * @default false
   * @since 0.6.0
   */
  lazy?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Tab change event handler
   */
  onChange?: (key: string | number) => void
  /**
   * Tab click event handler
   */
  onTabClick?: (key: string | number) => void
  /**
   * Tab edit event handler (for closable tabs)
   */
  onEdit?: (info: { targetKey?: string | number; action: 'add' | 'remove' }) => void
  /**
   * Tab panes
   */
  children?: React.ReactNode
  /**
   * Custom styles
   */
  style?: React.CSSProperties
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
  lazy = false,
  className,
  style,
  onChange,
  onTabClick,
  onEdit,
  children
}) => {
  const reactId = useId()
  const idBase = useMemo(() => `tiger-tabs-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [reactId])

  // Internal state for uncontrolled mode
  const [internalActiveKey, setInternalActiveKey] = useState<string | number | undefined>(
    defaultActiveKey
  )

  // Container classes
  const containerClasses = useMemo(() => {
    return classNames(getTabsContainerClasses(tabPosition), className)
  }, [tabPosition, className])

  // Tab nav classes
  const tabNavClasses = useMemo(() => {
    return getTabNavClasses(tabPosition, type)
  }, [tabPosition, type])

  // Tab nav list classes
  const tabNavListClasses = useMemo(() => {
    return getTabNavListClasses(tabPosition, centered)
  }, [tabPosition, centered])

  // Extract tab items and tab panes from children (single pass)
  const { tabItems, tabPanes, firstTabKey, tabKeys } = useMemo(() => {
    const items: ReactElement[] = []
    const panes: ReactElement[] = []
    const keys: Array<string | number> = []
    let firstKey: string | number | undefined

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement<TabPaneProps>(child) || child.type !== TabPane) return

      const key = child.props.tabKey
      if (firstKey === undefined) firstKey = key
      keys.push(key)

      const resolvedActiveKey = controlledActiveKey ?? defaultActiveKey ?? firstKey
      const tabId = `${idBase}-tab-${String(key)}`
      const panelId = `${idBase}-panel-${String(key)}`

      items.push(
        React.cloneElement(child, {
          renderMode: 'tab',
          tabId,
          panelId,
          tabIndex: key === resolvedActiveKey ? 0 : -1
        })
      )
      panes.push(React.cloneElement(child, { renderMode: 'pane', tabId, panelId }))
    })

    return { tabItems: items, tabPanes: panes, firstTabKey: firstKey, tabKeys: keys }
  }, [children, controlledActiveKey, defaultActiveKey, idBase])

  // Use controlled or uncontrolled state, defaulting to the first tab if none is specified
  const activeKey =
    controlledActiveKey !== undefined
      ? controlledActiveKey
      : internalActiveKey !== undefined
        ? internalActiveKey
        : firstTabKey

  const activeTabIndex = useMemo(() => tabKeys.indexOf(activeKey ?? ''), [tabKeys, activeKey])

  // Handle tab click
  const handleTabClick = useCallback(
    (key: string | number) => {
      onTabClick?.(key)

      if (key === activeKey) {
        return
      }

      // Update internal state if uncontrolled
      if (controlledActiveKey === undefined) {
        setInternalActiveKey(key)
      }

      onChange?.(key)
    },
    [activeKey, controlledActiveKey, onChange, onTabClick]
  )

  // Handle tab close
  const handleTabClose = useCallback(
    (key: string | number, event: React.SyntheticEvent) => {
      event.stopPropagation()

      onEdit?.({ targetKey: key, action: 'remove' })
    },
    [onEdit]
  )

  const handleTabAdd = useCallback(() => {
    onEdit?.({ targetKey: undefined, action: 'add' })
  }, [onEdit])

  // Context value
  const contextValue = useMemo<TabsContextValue>(
    () => ({
      activeKey,
      type,
      size,
      tabPosition,
      closable,
      destroyInactiveTabPane,
      lazy,
      idBase,
      handleTabClick,
      handleTabClose
    }),
    [
      activeKey,
      type,
      size,
      tabPosition,
      closable,
      destroyInactiveTabPane,
      lazy,
      idBase,
      handleTabClick,
      handleTabClose
    ]
  )

  // Render tab nav
  const tabNavContent = (
    <div
      className={tabNavClasses}
      role="tablist"
      aria-orientation={
        tabPosition === 'left' || tabPosition === 'right' ? 'vertical' : 'horizontal'
      }>
      <div
        className={tabNavListClasses}
        style={getTabNavListStyle(type, tabPosition, tabKeys.length)}>
        {type === 'line' && (
          <div
            data-tiger-tabs-indicator="true"
            aria-hidden="true"
            className={getTabIndicatorClasses(type, tabPosition)}
            style={getTabIndicatorStyle(activeTabIndex, tabKeys.length, tabPosition)}
          />
        )}
        {tabItems}
        {type === 'editable-card' && (
          <button
            type="button"
            className={tabAddButtonClasses}
            onClick={handleTabAdd}
            aria-label="Add tab">
            +
          </button>
        )}
      </div>
    </div>
  )

  // Render tab content
  const tabContent = <div className={tabContentBaseClasses}>{tabPanes}</div>

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={containerClasses} style={style}>
        {tabPosition === 'bottom' ? (
          <>
            {tabContent}
            {tabNavContent}
          </>
        ) : (
          <>
            {tabNavContent}
            {tabContent}
          </>
        )}
      </div>
    </TabsContext.Provider>
  )
}
