import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useId,
  useRef,
  useLayoutEffect,
  useEffect,
  ReactElement
} from 'react'
import {
  classNames,
  getTabsContainerClasses,
  getTabItemClasses,
  getTabNavClasses,
  getTabNavListClasses,
  getTabPaneClasses,
  getTabIndicatorClasses,
  getTabIndicatorStyleFromBox,
  getTabContentClasses,
  getTabAddButtonClasses,
  tabCloseButtonClasses,
  getGestureTouchPoint,
  resolveSwipeGesture,
  isKeyActive,
  getNextActiveKey,
  getAdjacentEnabledKey,
  getTabKeyboardDelta,
  getTabSwipeDelta,
  isSwipeBlockedByNestedScroll,
  measureTabIndicatorBox,
  formatTabKey,
  parseTabKey,
  resolveDisplayedActiveKey,
  navLabels,
  splitOverflowTabKeys,
  tabActivationSelectsOnArrow,
  isTabPaneType,
  isTabPaneChildProps,
  readTabPaneKey,
  mergeTigerLocale,
  getTabsLabels,
  type TabActivation,
  type TabRecord,
  type TabIndicatorStyle,
  type TigerLocale,
  type TigerLocaleTabs,
  type TabType,
  type TabSize,
  type TabPosition
} from '@expcat/tigercat-core'
import { closeIconPathD, closeIconViewBox } from '@expcat/tigercat-core/icons/common'
import { useTigerConfig } from './tiger-config'
import { Dropdown } from './Dropdown'

export interface TabsContextValue {
  activeKey: string | number | undefined
  type: TabType
  size: TabSize
  tabPosition: TabPosition
  closable: boolean
  destroyInactiveTabPane: boolean
  lazy: boolean
  swipeable: boolean
  activation: TabActivation
  overflowKeys: Array<string | number>
  idBase: string
  labels: Required<TigerLocaleTabs>
  handleTabClick: (key: string | number, options?: { focus?: boolean }) => void
  handleTabClose: (key: string | number, event: React.SyntheticEvent) => void
  focusTab: (key: string | number) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabsContext(): TabsContextValue | null {
  return useContext(TabsContext)
}

export interface TabPaneProps {
  tabKey: string | number
  label: React.ReactNode
  disabled?: boolean
  closable?: boolean
  icon?: React.ReactNode
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
  /** @internal */
  renderMode?: 'tab' | 'pane'
  /** @internal */
  tabId?: string
  /** @internal */
  panelId?: string
}

function isTabPaneElement(child: React.ReactNode): child is ReactElement<TabPaneProps> {
  if (!React.isValidElement<TabPaneProps>(child)) return false
  return (
    isTabPaneType(child.type, TabPane) ||
    isTabPaneChildProps(child.props as unknown as Record<string, unknown>)
  )
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
  panelId
}) => {
  const tabsContext = useTabsContext()

  if (!tabsContext) {
    throw new Error('TabPane must be used within a Tabs component')
  }

  const isActive = isKeyActive(tabKey, tabsContext.activeKey)
  const hasBeenActivatedRef = useRef(isActive)
  if (isActive) hasBeenActivatedRef.current = true

  const isClosable =
    closable !== undefined ? closable : tabsContext.closable && tabsContext.type === 'editable-card'

  const tabItemClasses = getTabItemClasses(
    isActive,
    disabled,
    tabsContext.type,
    tabsContext.size,
    tabsContext.tabPosition
  )
  const tabPaneClasses = classNames(getTabPaneClasses(isActive), className)

  const handleClick = () => {
    if (!disabled) tabsContext.handleTabClick(tabKey)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return

    if (isClosable && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault()
      tabsContext.handleTabClose(tabKey, event)
      return
    }

    const tabList = (event.currentTarget as HTMLElement).closest('[role="tablist"]')
    const dir =
      tabList instanceof HTMLElement && getComputedStyle(tabList).direction === 'rtl'
        ? 'rtl'
        : 'ltr'
    const delta = getTabKeyboardDelta(event.key, tabsContext.tabPosition, dir)

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      tabsContext.handleTabClick(tabKey)
      return
    }

    if (delta == null) return
    event.preventDefault()

    const tabButtons = Array.from(
      tabList?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []
    ).filter((button) => !button.hasAttribute('hidden'))
    const records: TabRecord[] = tabButtons.map((button) => ({
      key: parseTabKey(button.getAttribute('data-tiger-tab-key')) ?? button.id,
      disabled: button.getAttribute('aria-disabled') === 'true'
    }))

    const enabled = records.filter((tab) => !tab.disabled)
    if (enabled.length === 0) return

    const nextKey =
      delta === 'home'
        ? enabled[0].key
        : delta === 'end'
          ? enabled[enabled.length - 1].key
          : getAdjacentEnabledKey(records, tabKey, delta)
    if (nextKey === undefined) return

    if (tabActivationSelectsOnArrow(tabsContext.activation)) {
      tabsContext.handleTabClick(nextKey, { focus: true })
      return
    }
    tabsContext.focusTab(nextKey)
  }

  const handleClose = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!disabled) tabsContext.handleTabClose(tabKey, event)
  }

  const panelMounted = tabsContext.lazy
    ? hasBeenActivatedRef.current && (isActive || !tabsContext.destroyInactiveTabPane)
    : isActive || !tabsContext.destroyInactiveTabPane

  if (renderMode === 'tab') {
    return (
      <div
        className={tabItemClasses}
        role="tab"
        id={tabId}
        aria-controls={panelMounted ? panelId : undefined}
        aria-selected={isActive}
        aria-disabled={disabled || undefined}
        aria-labelledby={`${tabId}-label`}
        tabIndex={disabled ? -1 : isActive ? 0 : -1}
        hidden={tabsContext.overflowKeys.some((key) => isKeyActive(key, tabKey)) || undefined}
        data-tiger-tabs-id={tabsContext.idBase}
        data-tiger-tab-key={formatTabKey(tabKey)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}>
        {icon && <span className="flex items-center">{icon}</span>}
        <span id={`${tabId}-label`}>{label}</span>
        {isClosable && (
          <button
            type="button"
            className={tabCloseButtonClasses}
            aria-label={tabsContext.labels.closeTabAriaLabel.replace(
              '{label}',
              typeof label === 'string' ? label : String(tabKey)
            )}
            onClick={handleClose}
            onKeyDown={(event) => event.stopPropagation()}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox={closeIconViewBox}
              aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={closeIconPathD}
              />
            </svg>
          </button>
        )}
      </div>
    )
  }

  if (!panelMounted) return null

  return (
    <div
      className={tabPaneClasses}
      style={style}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      aria-hidden={!isActive}
      inert={!isActive ? true : undefined}>
      {children}
    </div>
  )
}

TabPane.displayName = 'TabPane'

export interface TabsProps {
  activeKey?: string | number
  defaultActiveKey?: string | number
  type?: TabType
  tabPosition?: TabPosition
  size?: TabSize
  closable?: boolean
  centered?: boolean
  destroyInactiveTabPane?: boolean
  lazy?: boolean
  swipeable?: boolean
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  onChange?: (key: string | number) => void
  onTabClick?: (key: string | number) => void
  onEdit?: (info: { targetKey?: string | number; action: 'add' | 'remove' }) => void
  children?: React.ReactNode
  style?: React.CSSProperties
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleTabs>
}

export const Tabs: React.FC<TabsProps> = ({
  activeKey: controlledActiveKey,
  defaultActiveKey,
  type = 'line',
  tabPosition = 'top',
  size = 'md',
  closable = false,
  centered = false,
  destroyInactiveTabPane = false,
  lazy = true,
  swipeable = false,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  style,
  locale,
  labels: labelsOverride,
  onChange,
  onTabClick,
  onEdit,
  children
}) => {
  const activation: TabActivation = 'automatic'
  const config = useTigerConfig()
  const reactId = useId()
  const idBase = useMemo(() => `tiger-tabs-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [reactId])
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getTabsLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const dir: 'ltr' | 'rtl' = config.direction === 'rtl' ? 'rtl' : 'ltr'

  const [internalActiveKey, setInternalActiveKey] = useState<string | number | undefined>(
    defaultActiveKey
  )
  const swipeStartRef = useRef<ReturnType<typeof getGestureTouchPoint> | null>(null)
  const tabListRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const tabWidthCache = useRef(new Map<string, number>())
  const [overflowKeys, setOverflowKeys] = useState<Array<string | number>>([])

  const containerClasses = classNames(getTabsContainerClasses(tabPosition), className)
  const tabNavClasses = getTabNavClasses(tabPosition, type)
  const tabNavListClasses = getTabNavListClasses(tabPosition, centered)

  const { tabItems, tabPanes, tabRecords, labelByKey } = useMemo(() => {
    const items: ReactElement[] = []
    const panes: ReactElement[] = []
    const records: TabRecord[] = []

    React.Children.forEach(children, (child) => {
      if (!isTabPaneElement(child)) return
      const key = readTabPaneKey(child.props as unknown as Record<string, unknown>)
      if (key === undefined) return
      records.push({
        key,
        disabled: Boolean(child.props.disabled),
        closable:
          child.props.closable !== undefined
            ? child.props.closable
            : closable && type === 'editable-card',
        label: typeof child.props.label === 'string' ? child.props.label : undefined
      })
      const tabId = `${idBase}-tab-${formatTabKey(key)}`
      const panelId = `${idBase}-panel-${formatTabKey(key)}`
      items.push(
        React.cloneElement(child, {
          key: `tab-${String(key)}`,
          renderMode: 'tab',
          tabId,
          panelId
        })
      )
      panes.push(
        React.cloneElement(child, {
          key: `pane-${String(key)}`,
          renderMode: 'pane',
          tabId,
          panelId
        })
      )
    })

    const labelByKey = new Map<string, string>()
    React.Children.forEach(children, (child) => {
      if (!isTabPaneElement(child)) return
      const key = readTabPaneKey(child.props as unknown as Record<string, unknown>)
      if (key === undefined) return
      const label = child.props.label
      labelByKey.set(String(key), typeof label === 'string' ? label : String(key))
    })

    return { tabItems: items, tabPanes: panes, tabRecords: records, labelByKey }
  }, [children, idBase, closable, type])

  const requestedKey = controlledActiveKey !== undefined ? controlledActiveKey : internalActiveKey
  const activeKey = resolveDisplayedActiveKey(requestedKey, tabRecords, {
    controlled: controlledActiveKey !== undefined
  })

  const updateIndicator = useCallback(() => {
    const ink = indicatorRef.current
    const list = tabListRef.current
    if (!ink) return
    if (!list || type !== 'line') {
      ink.style.opacity = '0'
      return
    }
    const tab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    const computedDir = getComputedStyle(list).direction === 'rtl' ? 'rtl' : 'ltr'
    const box = measureTabIndicatorBox(list, tab, tabPosition, computedDir)
    const style = getTabIndicatorStyleFromBox(box, tabPosition)
    ink.style.width = style.width ?? ''
    ink.style.height = style.height ?? ''
    ink.style.insetInlineStart = style.insetInlineStart ?? ''
    ink.style.insetBlockStart = style.insetBlockStart ?? ''
    ink.style.opacity = style.opacity
  }, [tabPosition, type])

  useLayoutEffect(() => {
    updateIndicator()
  }, [updateIndicator, activeKey, tabRecords])

  useEffect(() => {
    const list = tabListRef.current
    if (!list || type !== 'line' || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => updateIndicator())
    observer.observe(list)
    return () => observer.disconnect()
  }, [type, updateIndicator])

  const pendingFocusKey = useRef<string | number | null>(null)
  const focusTab = useCallback(
    (key: string | number) => {
      const id = `${idBase}-tab-${formatTabKey(key)}`
      tabListRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.focus()
    },
    [idBase]
  )

  const handleTabClick = useCallback(
    (key: string | number, options?: { focus?: boolean }) => {
      onTabClick?.(key)
      if (options?.focus) pendingFocusKey.current = key
      if (isKeyActive(key, activeKey)) return
      if (controlledActiveKey === undefined) setInternalActiveKey(key)
      onChange?.(key)
    },
    [activeKey, controlledActiveKey, onChange, onTabClick]
  )

  useLayoutEffect(() => {
    const pending = pendingFocusKey.current
    if (pending == null || !isKeyActive(pending, activeKey)) {
      if (pending != null && !isKeyActive(pending, activeKey)) pendingFocusKey.current = null
      return
    }
    pendingFocusKey.current = null
    const id = `${idBase}-tab-${formatTabKey(pending)}`
    tabListRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.focus()
  }, [activeKey, idBase])

  const handleTabClose = useCallback(
    (key: string | number, event: React.SyntheticEvent) => {
      event.stopPropagation()
      if (isKeyActive(key, activeKey)) {
        const next = getNextActiveKey(key, activeKey, tabRecords)
        if (next !== undefined) {
          pendingFocusKey.current = next
          if (controlledActiveKey === undefined) setInternalActiveKey(next)
          onChange?.(next)
        }
      }
      onEdit?.({ targetKey: key, action: 'remove' })
    },
    [onEdit, controlledActiveKey, activeKey, tabRecords]
  )

  const handleTabAdd = useCallback(() => {
    onEdit?.({ targetKey: undefined, action: 'add' })
  }, [onEdit])

  const handleContentTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!swipeable || event.touches.length !== 1) return
      if (tabPosition === 'left' || tabPosition === 'right') {
        swipeStartRef.current = getGestureTouchPoint(event.touches, event.timeStamp)
        return
      }
      swipeStartRef.current = getGestureTouchPoint(event.touches, event.timeStamp)
    },
    [swipeable, tabPosition]
  )

  const handleContentTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!swipeable || !swipeStartRef.current || event.changedTouches.length !== 1) return
      if (isSwipeBlockedByNestedScroll(event.target, event.currentTarget)) {
        swipeStartRef.current = null
        return
      }
      const endPoint = getGestureTouchPoint(event.changedTouches, event.timeStamp)
      const swipe = resolveSwipeGesture(swipeStartRef.current, endPoint, {
        minDistance: 48,
        maxCrossAxisRatio: 0.75
      })
      swipeStartRef.current = null
      if (!swipe) return
      const computedDir =
        tabListRef.current && getComputedStyle(tabListRef.current).direction === 'rtl' ? 'rtl' : dir
      const delta = getTabSwipeDelta(swipe.direction, tabPosition, computedDir)
      if (delta == null) return
      const nextKey = getAdjacentEnabledKey(tabRecords, activeKey, delta)
      if (nextKey !== undefined) handleTabClick(nextKey)
    },
    [activeKey, dir, handleTabClick, swipeable, tabPosition, tabRecords]
  )

  useLayoutEffect(() => {
    const list = tabListRef.current
    if (!list) return
    const buttons = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'))
    const keys = buttons.map(
      (button) => parseTabKey(button.getAttribute('data-tiger-tab-key')) ?? button.id
    )
    const widths = buttons.map((button, index) => {
      const measured = button.getBoundingClientRect().width
      const cacheKey = String(keys[index])
      if (measured > 0) tabWidthCache.current.set(cacheKey, measured)
      return tabWidthCache.current.get(cacheKey) ?? measured
    })
    const available = list.getBoundingClientRect().width
    const split = splitOverflowTabKeys({
      keys,
      widths,
      available,
      activeKey
    })
    setOverflowKeys((previous) => {
      if (
        previous.length === split.overflow.length &&
        previous.every((key, index) => isKeyActive(key, split.overflow[index]))
      ) {
        return previous
      }
      return split.overflow
    })
  }, [activeKey, tabItems])

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      activeKey,
      type,
      size,
      tabPosition,
      closable,
      destroyInactiveTabPane,
      lazy,
      swipeable,
      activation,
      overflowKeys,
      focusTab,
      idBase,
      labels,
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
      swipeable,
      activation,
      overflowKeys,
      focusTab,
      idBase,
      labels,
      handleTabClick,
      handleTabClose
    ]
  )

  const tabNavContent = (
    <div className={tabNavClasses}>
      <div
        ref={tabListRef}
        className={tabNavListClasses}
        role="tablist"
        id={id}
        aria-label={ariaLabel ?? (ariaLabelledby ? undefined : labels.tablistAriaLabel)}
        aria-labelledby={ariaLabelledby}
        aria-orientation={
          tabPosition === 'left' || tabPosition === 'right' ? 'vertical' : 'horizontal'
        }>
        {type === 'line' && (
          <div
            ref={indicatorRef}
            data-tiger-tabs-indicator="true"
            aria-hidden="true"
            className={getTabIndicatorClasses(type, tabPosition)}
          />
        )}
        {tabItems}
      </div>
      {overflowKeys.length > 0 ? (
        <Dropdown
          items={overflowKeys.map((key) => ({
            key,
            label: labelByKey.get(String(key)) ?? String(key)
          }))}
          onItemSelect={(item) => handleTabClick(item.key)}>
          <button type="button" data-tiger-tabs-more="">
            {navLabels.moreTabs}
          </button>
        </Dropdown>
      ) : null}
      {type === 'editable-card' && (
        <button
          type="button"
          className={getTabAddButtonClasses(tabPosition)}
          onClick={handleTabAdd}
          aria-label={labels.addTabAriaLabel}>
          +
        </button>
      )}
    </div>
  )

  const tabContent = (
    <div
      className={getTabContentClasses(tabPosition)}
      onTouchStart={handleContentTouchStart}
      onTouchEnd={handleContentTouchEnd}
      onTouchCancel={() => {
        swipeStartRef.current = null
      }}>
      {tabPanes}
    </div>
  )

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
