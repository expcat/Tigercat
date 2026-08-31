import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  useId
} from 'react'
import {
  applyNavigationMenuPanelKey,
  classNames,
  createNavigationMenuHoverSession,
  focusFirstMenuItem,
  captureActiveElement,
  restoreFocus,
  getNavigationMenuBarItems,
  getNavigationMenuClasses,
  getNavigationMenuListClasses,
  getNavigationMenuItemClasses,
  getNavigationMenuTriggerClasses,
  getNavigationMenuChevronClasses,
  getNavigationMenuContentClasses,
  getNavigationMenuLinkClasses,
  getNavigationMenuItemValue,
  getNavigationMenuRovingTabIndex,
  getNavigationMenuTabExitTarget,
  getSecureRel,
  handleMenubarNavigation,
  injectNavigationMenuStyles,
  isFocusInsideNavigationMenu,
  isNavigationMenuOpen,
  isNavigationMenuTriggerOpenKey,
  isNavigationMenuValueOpen,
  NAVIGATION_MENU_BAR_ITEM_ATTR,
  NAVIGATION_MENU_CHEVRON_PATH,
  NAVIGATION_MENU_DEFAULT_DELAY_DURATION,
  NAVIGATION_MENU_DEFAULT_OFFSET,
  NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION,
  NAVIGATION_MENU_ENTER_CLASS,
  NAVIGATION_MENU_ITEM_VALUE_ATTR,
  resolveElementDir,
  resolveNavigationMenuOpenValue,
  resolveNavigationMenuTabStopValue,
  warnNavigationMenuOpenWithoutValue,
  type NavigationMenuValue,
  type NavigationMenuProps as CoreNavigationMenuProps,
  type NavigationMenuItemProps as CoreNavigationMenuItemProps,
  type NavigationMenuTriggerProps as CoreNavigationMenuTriggerProps,
  type NavigationMenuContentProps as CoreNavigationMenuContentProps,
  type NavigationMenuLinkProps as CoreNavigationMenuLinkProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'
import { composeRefs } from '../utils/overlay-trigger'

export interface NavigationMenuContextValue {
  value: NavigationMenuValue | null
  tabStopValue: NavigationMenuValue | null
  setTabStopValue: (next: NavigationMenuValue | null) => void
  setValue: (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => void
  scheduleOpen: (itemValue: NavigationMenuValue) => void
  scheduleClose: (itemValue: NavigationMenuValue) => void
  cancelClose: () => void
  closeOnClick: boolean
  openOnHover: boolean
  handleItemClick: () => void
  handleFocusLeave: (event: React.FocusEvent<HTMLElement>) => void
  portal: boolean
  disabled: boolean
  offset: number
  placement: FloatingPlacement
  showArrow: boolean
  rootRef: React.RefObject<HTMLElement | null>
  menubarRef: React.RefObject<HTMLElement | null>
}

export interface NavigationMenuItemContextValue {
  value: NavigationMenuValue
  isOpen: boolean
  disabled: boolean
  hasPanel: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLElement | null>
  contentId: string
  open: (focusPanel?: boolean) => void
  close: (options?: { restoreFocus?: boolean }) => void
  scheduleOpen: () => void
  scheduleClose: () => void
  cancelClose: () => void
  showArrow: boolean
}

export interface NavigationMenuContentContextValue {
  inPanel: true
}

export const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null)
export const NavigationMenuItemContext = createContext<NavigationMenuItemContextValue | null>(null)
export const NavigationMenuContentContext = createContext<NavigationMenuContentContextValue | null>(
  null
)

function hasNavigationMenuList(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false
    if (child.type === NavigationMenuList) return true
    if (child.type === React.Fragment) {
      return hasNavigationMenuList((child.props as { children?: React.ReactNode }).children)
    }
    return false
  })
}

function childIsContent(child: React.ReactNode): boolean {
  return React.isValidElement(child) && child.type === NavigationMenuContent
}

export interface NavigationMenuLinkProps
  extends
    Omit<CoreNavigationMenuLinkProps, 'className' | 'style'>,
    Omit<
      React.AnchorHTMLAttributes<HTMLElement>,
      'href' | 'target' | 'rel' | 'className' | 'style' | 'onClick'
    > {
  className?: string
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  children?: React.ReactNode
}

export const NavigationMenuLink = React.forwardRef<HTMLElement, NavigationMenuLinkProps>(
  (
    {
      href,
      target,
      rel,
      disabled = false,
      active = false,
      className,
      style,
      onClick,
      children,
      ...rest
    },
    forwardedRef
  ) => {
    const root = useContext(NavigationMenuContext)
    const item = useContext(NavigationMenuItemContext)
    const content = useContext(NavigationMenuContentContext)
    const inPanel = Boolean(content)
    const isDisabled = disabled || Boolean(item?.disabled) || Boolean(!inPanel && root?.disabled)
    const tabIndex = inPanel
      ? -1
      : getNavigationMenuRovingTabIndex(item?.value ?? '', root?.tabStopValue)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      if (isDisabled) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      onClick?.(event)
      root?.handleItemClick()
    }

    const handleFocus = () => {
      if (inPanel) return
      if (!item?.hasPanel) {
        root?.setValue(null, { restoreFocus: false })
      }
      if (item) root?.setTabStopValue(item.value)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      if (inPanel || !root?.menubarRef.current) return
      const next = handleMenubarNavigation(root.menubarRef.current, event.nativeEvent)
      if (!next) return
      const value = getNavigationMenuItemValue(next)
      if (value != null) root.setTabStopValue(value)
    }

    const linkClasses = classNames(
      getNavigationMenuLinkClasses(isDisabled, inPanel, active),
      className
    )
    const computedRel =
      href && !isDisabled ? getSecureRel(target as '_blank' | undefined, rel) : undefined
    const shared = {
      ...rest,
      className: linkClasses,
      style,
      role: 'menuitem' as const,
      tabIndex,
      [NAVIGATION_MENU_BAR_ITEM_ATTR]: inPanel || isDisabled ? undefined : '',
      [NAVIGATION_MENU_ITEM_VALUE_ATTR]: inPanel ? undefined : String(item?.value ?? ''),
      'aria-disabled': isDisabled || undefined,
      'aria-current': active ? ('page' as const) : undefined,
      'data-tiger-navigation-menu-link': '',
      'data-active': active ? 'true' : undefined,
      onClick: handleClick,
      onFocus: handleFocus,
      onKeyDown: handleKeyDown
    }

    if (href && !isDisabled) {
      return (
        <a
          ref={forwardedRef as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={computedRel}
          {...shared}>
          {children}
        </a>
      )
    }

    if (href && isDisabled) {
      return (
        <span ref={forwardedRef as React.Ref<HTMLSpanElement>} {...shared}>
          {children}
        </span>
      )
    }

    return (
      <button
        ref={forwardedRef as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={isDisabled}
        {...shared}>
        {children}
      </button>
    )
  }
)
NavigationMenuLink.displayName = 'NavigationMenuLink'

export interface NavigationMenuTriggerProps
  extends
    Omit<CoreNavigationMenuTriggerProps, 'className' | 'style'>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'className' | 'style'> {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(({ disabled = false, showArrow, className, style, children, ...buttonProps }, forwardedRef) => {
  const root = useContext(NavigationMenuContext)
  const item = useContext(NavigationMenuItemContext)
  const isDisabled = disabled || Boolean(item?.disabled) || Boolean(root?.disabled)
  const arrow = showArrow !== undefined ? showArrow : (item?.showArrow ?? true)
  const tabIndex = getNavigationMenuRovingTabIndex(item?.value ?? '', root?.tabStopValue)

  const handleMouseEnter = () => {
    if (isDisabled || !root?.openOnHover) return
    item?.scheduleOpen()
  }

  const handleMouseLeave = () => {
    if (!root?.openOnHover) return
    item?.scheduleClose()
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault()
      return
    }
    if (item?.isOpen) item.close({ restoreFocus: false })
    else item?.open()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled || !item) return

    if (root?.menubarRef.current) {
      const next = handleMenubarNavigation(root.menubarRef.current, event.nativeEvent)
      if (next) {
        const value = getNavigationMenuItemValue(next)
        if (value != null) root.setTabStopValue(value)
        return
      }
    }

    if (isNavigationMenuTriggerOpenKey(event.key) && item.hasPanel) {
      event.preventDefault()
      item.open(true)
      return
    }

    if (event.key === 'Escape' && item.isOpen) {
      event.preventDefault()
      item.close()
      item.triggerRef.current?.focus()
    }
  }

  if (!item) return null

  const triggerClasses = classNames(
    getNavigationMenuTriggerClasses(isDisabled, item.isOpen),
    className
  )

  return (
    <button
      {...buttonProps}
      ref={composeRefs(forwardedRef, item.triggerRef as React.Ref<HTMLButtonElement>)}
      type="button"
      className={triggerClasses}
      style={style}
      role="menuitem"
      tabIndex={tabIndex}
      {...{ [NAVIGATION_MENU_BAR_ITEM_ATTR]: isDisabled ? undefined : '' }}
      {...{ [NAVIGATION_MENU_ITEM_VALUE_ATTR]: String(item.value) }}
      aria-haspopup="menu"
      aria-expanded={item.isOpen}
      aria-controls={item.contentId}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      data-state={item.isOpen ? 'open' : 'closed'}
      data-tiger-navigation-menu-trigger=""
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => root?.setTabStopValue(item.value)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      {children}
      {arrow ? (
        <svg
          className={getNavigationMenuChevronClasses(item.isOpen)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d={NAVIGATION_MENU_CHEVRON_PATH} />
        </svg>
      ) : null}
    </button>
  )
})
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger'

export interface NavigationMenuContentProps
  extends
    Omit<CoreNavigationMenuContentProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const NavigationMenuContent: React.FC<NavigationMenuContentProps> = ({
  mega = false,
  className,
  style,
  children,
  ...divProps
}) => {
  const root = useContext(NavigationMenuContext)
  const item = useContext(NavigationMenuItemContext)
  const triggerRef = useRef<HTMLElement | null>(null)
  const floatingRef = useRef<HTMLDivElement | null>(null)

  const referenceRef = item?.triggerRef ?? triggerRef
  const contentRef = item?.contentRef ?? floatingRef
  const isOpen = Boolean(item?.isOpen)
  const portalEnabled = Boolean(root?.portal)

  const overlay = useAnchoredOverlay({
    referenceRef,
    floatingRef: contentRef,
    enabled: Boolean(item) && isOpen && !item?.disabled,
    placement: root?.placement ?? 'bottom-start',
    offset: root?.offset ?? NAVIGATION_MENU_DEFAULT_OFFSET,
    portal: portalEnabled,
    dismissOnOutside: true,
    dismissOnEscape: true,
    onDismiss: () => item?.close({ restoreFocus: false })
  })

  const handleMouseEnter = () => {
    item?.cancelClose()
  }

  const handleMouseLeave = () => {
    if (!root?.openOnHover) return
    item?.scheduleClose()
  }

  const handleFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    root?.handleFocusLeave(event)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const panel = contentRef.current
    if (!panel || !item || !root) return
    const dir = resolveElementDir(root.rootRef.current ?? root.menubarRef.current)
    const action = applyNavigationMenuPanelKey({ event: event.nativeEvent, panel, dir })
    if (!action || action === 'menu-nav') return

    event.stopPropagation()

    if (action === 'close-to-trigger') {
      item.close()
      item.triggerRef.current?.focus()
      return
    }

    if (action === 'move-menubar-next' && root.menubarRef.current) {
      item.close({ restoreFocus: false })
      item.triggerRef.current?.focus()
      const next = handleMenubarNavigation(root.menubarRef.current, event.nativeEvent)
      const value = getNavigationMenuItemValue(next)
      if (value != null) root.setTabStopValue(value)
      return
    }

    if (action === 'tab-exit' || action === 'shift-tab-exit') {
      const nav = root.rootRef.current
      const target = nav
        ? getNavigationMenuTabExitTarget(nav, panel, action === 'shift-tab-exit')
        : null
      item.close({ restoreFocus: false })
      target?.focus()
    }
  }

  if (!item || !root) return null

  const popup = (
    <div
      ref={contentRef as React.RefObject<HTMLDivElement>}
      className={classNames(overlay.floatingClasses, NAVIGATION_MENU_ENTER_CLASS)}
      style={overlay.floatingStyles}
      data-positioned={overlay.positioned}
      data-tiger-navigation-menu-content=""
      hidden={!isOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleFocusOut}
      onKeyDown={handleKeyDown}>
      <div
        {...divProps}
        id={item.contentId}
        className={classNames(getNavigationMenuContentClasses(mega), className)}
        style={mega ? { minWidth: '28rem', ...style } : style}
        role="menu">
        {children}
      </div>
    </div>
  )

  return (
    <NavigationMenuContentContext.Provider value={{ inPanel: true }}>
      {renderOverlayPortal(popup, overlay.target, !portalEnabled)}
    </NavigationMenuContentContext.Provider>
  )
}

export interface NavigationMenuItemProps extends Omit<
  CoreNavigationMenuItemProps,
  'className' | 'style'
> {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  value: valueProp,
  disabled = false,
  className,
  style,
  children
}) => {
  const root = useContext(NavigationMenuContext)
  const reactId = useId()
  const autoValue = useMemo(() => `tiger-navigation-menu-item-${reactId}`, [reactId])
  const itemValue = valueProp ?? autoValue
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const hasPanel = React.Children.toArray(children).some(childIsContent)

  const isOpen = Boolean(root && !disabled && isNavigationMenuValueOpen(itemValue, root.value))

  const contentId = `${autoValue}-content`

  const open = useCallback(
    (focusPanel = false) => {
      if (disabled || !root) return
      root.cancelClose()
      root.setValue(itemValue)
      root.setTabStopValue(itemValue)
      if (!focusPanel) return
      requestAnimationFrame(() => {
        const panel = contentRef.current ?? document.getElementById(contentId)
        if (panel) focusFirstMenuItem(panel)
      })
    },
    [contentId, disabled, itemValue, root]
  )

  const close = useCallback(
    (options?: { restoreFocus?: boolean }) => {
      if (!root) return
      if (isOpen) root.setValue(null, options)
    },
    [isOpen, root]
  )

  const scheduleOpen = useCallback(() => {
    if (disabled || !root) return
    root.scheduleOpen(itemValue)
  }, [disabled, itemValue, root])

  const scheduleClose = useCallback(() => {
    root?.scheduleClose(itemValue)
  }, [itemValue, root])

  const cancelClose = useCallback(() => {
    root?.cancelClose()
  }, [root])

  const itemContext = useMemo<NavigationMenuItemContextValue>(
    () => ({
      value: itemValue,
      isOpen,
      disabled,
      hasPanel,
      triggerRef,
      contentRef,
      contentId,
      open,
      close,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      showArrow: root?.showArrow ?? true
    }),
    [
      cancelClose,
      close,
      disabled,
      hasPanel,
      isOpen,
      itemValue,
      open,
      root?.showArrow,
      scheduleClose,
      scheduleOpen
    ]
  )

  return (
    <NavigationMenuItemContext.Provider value={itemContext}>
      <li
        className={classNames(getNavigationMenuItemClasses(), className)}
        style={style}
        role="none"
        data-tiger-navigation-menu-item=""
        data-state={isOpen ? 'open' : 'closed'}>
        {children}
      </li>
    </NavigationMenuItemContext.Provider>
  )
}

export interface NavigationMenuListProps extends Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'style'
> {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const NavigationMenuList: React.FC<NavigationMenuListProps> = ({
  className,
  style,
  children,
  ...ulProps
}) => {
  const root = useContext(NavigationMenuContext)
  const listRef = useRef<HTMLUListElement | null>(null)

  const setListRef = useCallback(
    (node: HTMLUListElement | null) => {
      listRef.current = node
      if (root) {
        ;(root.menubarRef as React.MutableRefObject<HTMLElement | null>).current = node
      }
    },
    [root]
  )

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !root) return
    const next = resolveNavigationMenuTabStopValue({
      items: getNavigationMenuBarItems(list),
      tabStopValue: root.tabStopValue
    })
    if (next != null && next !== String(root.tabStopValue ?? '')) {
      root.setTabStopValue(next)
    }
  })

  return (
    <ul
      {...ulProps}
      ref={setListRef}
      className={classNames(getNavigationMenuListClasses(), className)}
      style={style}
      role="menubar"
      data-tiger-navigation-menu-list="">
      {children}
    </ul>
  )
}

export interface NavigationMenuProps
  extends
    Omit<CoreNavigationMenuProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'defaultValue' | 'color'> {
  style?: React.CSSProperties
  placement?: FloatingPlacement
  onValueChange?: (value: NavigationMenuValue | null) => void
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  value: controlledValue,
  defaultValue,
  open: controlledOpen,
  defaultOpen = false,
  openOnHover = false,
  disabled = false,
  closeOnClick = true,
  delayDuration = NAVIGATION_MENU_DEFAULT_DELAY_DURATION,
  skipDelayDuration = NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION,
  showArrow = true,
  portal = true,
  offset = NAVIGATION_MENU_DEFAULT_OFFSET,
  placement = 'bottom-start',
  className,
  style,
  onValueChange,
  onOpenChange,
  children,
  ...navProps
}) => {
  const initialValue = defaultValue ?? (defaultOpen ? (controlledValue ?? null) : null)
  const [internalValue, setInternalValue] = useState<NavigationMenuValue | null>(
    isNavigationMenuOpen(initialValue) ? (initialValue as NavigationMenuValue) : null
  )
  const [tabStopValue, setTabStopValue] = useState<NavigationMenuValue | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)
  const menubarRef = useRef<HTMLElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const currentValue = resolveNavigationMenuOpenValue({
    value: controlledValue,
    internalValue,
    open: controlledOpen
  })
  const currentValueRef = useRef(currentValue)
  currentValueRef.current = currentValue
  const currentOpen = isNavigationMenuOpen(currentValue)
  const delayDurationRef = useRef(delayDuration)
  delayDurationRef.current = delayDuration
  const skipDelayDurationRef = useRef(skipDelayDuration)
  skipDelayDurationRef.current = skipDelayDuration
  const disabledRef = useRef(disabled)
  disabledRef.current = disabled
  const setValueRef = useRef<
    (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => void
  >(() => undefined)
  const hoverRef = useRef<ReturnType<typeof createNavigationMenuHoverSession> | null>(null)
  if (!hoverRef.current) {
    hoverRef.current = createNavigationMenuHoverSession({
      getDelayDuration: () => delayDurationRef.current,
      getSkipDelayDuration: () => skipDelayDurationRef.current,
      getValue: () => currentValueRef.current,
      setValue: (next) => setValueRef.current(next),
      isDisabled: () => disabledRef.current
    })
  }

  useEffect(() => {
    injectNavigationMenuStyles()
  }, [])

  useEffect(() => {
    warnNavigationMenuOpenWithoutValue(
      controlledOpen,
      isNavigationMenuOpen(controlledValue ?? defaultValue ?? internalValue)
    )
  }, [controlledOpen, controlledValue, defaultValue, internalValue])

  const setValue = useCallback(
    (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => {
      if (disabled && next != null) return

      hoverRef.current?.clear()

      const resolvedNext = isNavigationMenuOpen(next) ? next : null
      const wasOpen = isNavigationMenuOpen(currentValueRef.current)
      const willOpen = resolvedNext != null

      if (willOpen && !wasOpen) {
        const active = captureActiveElement()
        if (active && menubarRef.current?.contains(active)) {
          previousActiveElementRef.current = active
        }
      }

      currentValueRef.current = resolvedNext

      if (controlledValue === undefined) {
        setInternalValue(resolvedNext)
      }

      onValueChange?.(resolvedNext)
      onOpenChange?.(willOpen)

      if (!willOpen && options?.restoreFocus !== false) {
        restoreFocus(previousActiveElementRef.current)
        previousActiveElementRef.current = null
      }
    },
    [controlledValue, disabled, onOpenChange, onValueChange]
  )
  setValueRef.current = setValue

  useEffect(() => () => hoverRef.current?.clear(), [])

  const handleItemClick = useCallback(() => {
    if (closeOnClick) setValue(null, { restoreFocus: false })
  }, [closeOnClick, setValue])

  const handleFocusLeave = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (isFocusInsideNavigationMenu(rootRef.current, menubarRef.current, event.relatedTarget)) {
        return
      }
      if (!isNavigationMenuOpen(currentValueRef.current)) return
      setValue(null, { restoreFocus: false })
    },
    [setValue]
  )

  const contextValue = useMemo<NavigationMenuContextValue>(
    () => ({
      value: currentValue,
      tabStopValue,
      setTabStopValue,
      setValue,
      scheduleOpen: (itemValue) => hoverRef.current?.scheduleOpen(itemValue),
      scheduleClose: (itemValue) => hoverRef.current?.scheduleClose(itemValue),
      cancelClose: () => hoverRef.current?.cancelClose(),
      closeOnClick,
      openOnHover,
      handleItemClick,
      handleFocusLeave,
      portal,
      disabled,
      offset,
      placement,
      showArrow,
      rootRef,
      menubarRef
    }),
    [
      closeOnClick,
      currentValue,
      disabled,
      handleFocusLeave,
      handleItemClick,
      offset,
      openOnHover,
      placement,
      portal,
      setValue,
      showArrow,
      tabStopValue
    ]
  )

  const hasList = hasNavigationMenuList(children)

  return (
    <NavigationMenuContext.Provider value={contextValue}>
      <nav
        {...navProps}
        ref={rootRef}
        className={classNames(getNavigationMenuClasses(), className)}
        style={style}
        data-tiger-navigation-menu=""
        data-state={currentOpen ? 'open' : 'closed'}
        onBlur={(event) => {
          navProps.onBlur?.(event)
          handleFocusLeave(event)
        }}>
        {hasList ? children : <NavigationMenuList>{children}</NavigationMenuList>}
      </nav>
    </NavigationMenuContext.Provider>
  )
}
