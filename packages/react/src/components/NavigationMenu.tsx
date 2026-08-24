import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useId
} from 'react'
import {
  classNames,
  getNavigationMenuClasses,
  getNavigationMenuListClasses,
  getNavigationMenuItemClasses,
  getNavigationMenuTriggerClasses,
  getNavigationMenuChevronClasses,
  getNavigationMenuContentClasses,
  getNavigationMenuLinkClasses,
  injectNavigationMenuStyles,
  NAVIGATION_MENU_ENTER_CLASS,
  NAVIGATION_MENU_CHEVRON_PATH,
  NAVIGATION_MENU_BAR_ITEM_ATTR,
  NAVIGATION_MENU_DEFAULT_DELAY_DURATION,
  NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION,
  NAVIGATION_MENU_DEFAULT_OFFSET,
  isNavigationMenuValueOpen,
  isNavigationMenuOpen,
  resolveNavigationMenuOpenValue,
  shouldSkipNavigationMenuOpenDelay,
  isNavigationMenuTriggerOpenKey,
  handleMenubarNavigation,
  handleMenuNavigation,
  initNavigationMenuRovingTabIndex,
  focusFirstMenuItem,
  captureActiveElement,
  restoreFocus,
  getSecureRel,
  type NavigationMenuValue,
  type NavigationMenuProps as CoreNavigationMenuProps,
  type NavigationMenuItemProps as CoreNavigationMenuItemProps,
  type NavigationMenuTriggerProps as CoreNavigationMenuTriggerProps,
  type NavigationMenuContentProps as CoreNavigationMenuContentProps,
  type NavigationMenuLinkProps as CoreNavigationMenuLinkProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

function containsFocusTarget(
  container: HTMLElement | null | undefined,
  target: EventTarget | null
): boolean {
  return Boolean(container && target instanceof Node && container.contains(target))
}

function getOpenPanelFromMenubar(menubar: HTMLElement | null): HTMLElement | null {
  if (!menubar) return null
  const trigger = menubar.querySelector<HTMLElement>('[aria-expanded="true"][aria-controls]')
  const contentId = trigger?.getAttribute('aria-controls')
  if (!contentId) return null
  return menubar.ownerDocument.getElementById(contentId)
}

export interface NavigationMenuContextValue {
  value: NavigationMenuValue | null
  setValue: (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => void
  scheduleOpen: (itemValue: NavigationMenuValue) => void
  scheduleClose: (itemValue: NavigationMenuValue) => void
  cancelClose: () => void
  closeOnClick: boolean
  handleItemClick: () => void
  handleFocusLeave: (event: React.FocusEvent<HTMLElement>) => void
  portal: boolean
  disabled: boolean
  offset: number
  placement: FloatingPlacement
  showArrow: boolean
  menubarRef: React.RefObject<HTMLElement | null>
  isFocusOpenSuppressed: () => boolean
}

export interface NavigationMenuItemContextValue {
  value: NavigationMenuValue
  isOpen: boolean
  disabled: boolean
  hasPanel: boolean
  setHasPanel: (next: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLElement | null>
  contentId: string
  open: (focusPanel?: boolean) => void
  close: () => void
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

export interface NavigationMenuLinkProps extends Omit<
  CoreNavigationMenuLinkProps,
  'className' | 'style'
> {
  className?: string
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  children?: React.ReactNode
}

export const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({
  href,
  target,
  rel,
  disabled = false,
  active = false,
  className,
  style,
  onClick,
  children
}) => {
  const root = useContext(NavigationMenuContext)
  const item = useContext(NavigationMenuItemContext)
  const content = useContext(NavigationMenuContentContext)
  const inPanel = Boolean(content)
  const isDisabled = disabled || Boolean(item?.disabled)

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
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (inPanel) return
    if (root?.menubarRef.current) {
      handleMenubarNavigation(root.menubarRef.current, event.nativeEvent)
    }
  }

  const linkClasses = classNames(
    getNavigationMenuLinkClasses(isDisabled, inPanel, active),
    className
  )
  const computedRel = href ? getSecureRel(target as '_blank' | undefined, rel) : undefined
  const shared = {
    className: linkClasses,
    style,
    role: 'menuitem' as const,
    tabIndex: -1,
    [NAVIGATION_MENU_BAR_ITEM_ATTR]: inPanel ? undefined : '',
    'aria-disabled': isDisabled || undefined,
    'aria-current': active ? ('page' as const) : undefined,
    'data-tiger-navigation-menu-link': '',
    'data-active': active ? 'true' : undefined,
    onClick: handleClick,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown
  }

  if (href) {
    return (
      <a href={href} target={target} rel={computedRel} {...shared}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" disabled={isDisabled} {...shared}>
      {children}
    </button>
  )
}

export interface NavigationMenuTriggerProps extends Omit<
  CoreNavigationMenuTriggerProps,
  'className' | 'style'
> {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const NavigationMenuTrigger: React.FC<NavigationMenuTriggerProps> = ({
  disabled = false,
  showArrow,
  className,
  style,
  children
}) => {
  const root = useContext(NavigationMenuContext)
  const item = useContext(NavigationMenuItemContext)
  const isDisabled = disabled || Boolean(item?.disabled) || Boolean(root?.disabled)
  const arrow = showArrow !== undefined ? showArrow : (item?.showArrow ?? true)

  const handleMouseEnter = () => {
    if (isDisabled) return
    item?.scheduleOpen()
  }

  const handleMouseLeave = () => {
    item?.scheduleClose()
  }

  const handleFocus = () => {
    if (isDisabled || root?.isFocusOpenSuppressed()) return
    item?.open()
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault()
      return
    }
    item?.open()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled || !item) return

    if (
      root?.menubarRef.current &&
      handleMenubarNavigation(root.menubarRef.current, event.nativeEvent)
    ) {
      return
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
      ref={item.triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      className={triggerClasses}
      style={style}
      role="menuitem"
      tabIndex={-1}
      {...{ [NAVIGATION_MENU_BAR_ITEM_ATTR]: '' }}
      aria-haspopup="menu"
      aria-expanded={item.isOpen}
      aria-controls={item.isOpen ? item.contentId : undefined}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      data-state={item.isOpen ? 'open' : 'closed'}
      data-tiger-navigation-menu-trigger=""
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
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
}

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

  useEffect(() => {
    if (!item) return
    item.setHasPanel(true)
    return () => item.setHasPanel(false)
  }, [item])

  const overlay = useAnchoredOverlay({
    referenceRef,
    floatingRef: contentRef,
    enabled: Boolean(item) && isOpen && !item?.disabled,
    placement: root?.placement ?? 'bottom-start',
    offset: root?.offset ?? NAVIGATION_MENU_DEFAULT_OFFSET,
    portal: portalEnabled,
    dismissOnOutside: true,
    dismissOnEscape: true,
    onDismiss: () => item?.close()
  })

  const handleMouseEnter = () => {
    item?.cancelClose()
  }

  const handleMouseLeave = () => {
    item?.scheduleClose()
  }

  const handleFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    root?.handleFocusLeave(event)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (contentRef.current) {
      handleMenuNavigation(contentRef.current, event.nativeEvent)
    }

    if (event.key === 'Escape' || event.key === 'ArrowLeft') {
      event.preventDefault()
      event.stopPropagation()
      item?.close()
      item?.triggerRef.current?.focus()
      return
    }

    if (event.key === 'ArrowRight' && root?.menubarRef.current && item?.triggerRef.current) {
      item.triggerRef.current.focus()
      handleMenubarNavigation(root.menubarRef.current, event.nativeEvent)
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
        style={style}
        role={mega ? 'group' : 'menu'}>
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
  const [hasPanel, setHasPanel] = useState(false)

  const isOpen = Boolean(root && !disabled && isNavigationMenuValueOpen(itemValue, root.value))

  const contentId = `${autoValue}-content`

  const open = useCallback(
    (focusPanel = false) => {
      if (disabled || !root) return
      root.cancelClose()
      root.setValue(itemValue)
      if (!focusPanel) return
      requestAnimationFrame(() => {
        const panel = contentRef.current ?? document.getElementById(contentId)
        if (panel) focusFirstMenuItem(panel)
      })
    },
    [contentId, disabled, itemValue, root]
  )

  const close = useCallback(() => {
    if (!root) return
    if (isOpen) root.setValue(null)
  }, [isOpen, root])

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
      setHasPanel,
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
      autoValue,
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

  useEffect(() => {
    if (listRef.current) initNavigationMenuRovingTabIndex(listRef.current)
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
  const rootRef = useRef<HTMLElement | null>(null)
  const menubarRef = useRef<HTMLElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastOpenAtRef = useRef(0)
  const suppressFocusOpenRef = useRef(false)

  const currentValue = resolveNavigationMenuOpenValue({
    value: controlledValue,
    internalValue,
    open: controlledOpen
  })
  const currentValueRef = useRef(currentValue)
  currentValueRef.current = currentValue
  const currentOpen = isNavigationMenuOpen(currentValue)

  useEffect(() => {
    injectNavigationMenuStyles()
  }, [])

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const setValue = useCallback(
    (next: NavigationMenuValue | null, options?: { restoreFocus?: boolean }) => {
      if (disabled && next != null) return

      clearTimers()

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

      if (!willOpen) {
        suppressFocusOpenRef.current = true
        if (options?.restoreFocus !== false) {
          restoreFocus(previousActiveElementRef.current)
        }
        previousActiveElementRef.current = null
        queueMicrotask(() => {
          suppressFocusOpenRef.current = false
        })
      }
    },
    [clearTimers, controlledValue, disabled, onOpenChange, onValueChange]
  )

  const scheduleOpen = useCallback(
    (itemValue: NavigationMenuValue) => {
      if (disabled) return
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }

      const skip = shouldSkipNavigationMenuOpenDelay(
        lastOpenAtRef.current,
        Date.now(),
        skipDelayDuration
      )
      const delay = skip ? 0 : delayDuration

      const apply = () => {
        lastOpenAtRef.current = Date.now()
        setValue(itemValue)
        openTimerRef.current = null
      }

      if (delay <= 0) {
        apply()
        return
      }

      if (openTimerRef.current) clearTimeout(openTimerRef.current)
      openTimerRef.current = setTimeout(apply, delay)
    },
    [delayDuration, disabled, setValue, skipDelayDuration]
  )

  const scheduleClose = useCallback(
    (itemValue: NavigationMenuValue) => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current)
        openTimerRef.current = null
      }

      const close = () => {
        if (currentValueRef.current === itemValue) setValue(null)
        closeTimerRef.current = null
      }

      if (skipDelayDuration <= 0) {
        close()
        return
      }

      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      closeTimerRef.current = setTimeout(close, skipDelayDuration)
    },
    [setValue, skipDelayDuration]
  )

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const handleItemClick = useCallback(() => {
    if (closeOnClick) setValue(null)
  }, [closeOnClick, setValue])

  const handleFocusLeave = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget
      if (containsFocusTarget(rootRef.current, next)) return
      if (containsFocusTarget(getOpenPanelFromMenubar(menubarRef.current), next)) return
      if (!isNavigationMenuOpen(currentValueRef.current)) return
      setValue(null, { restoreFocus: false })
    },
    [setValue]
  )

  const isFocusOpenSuppressed = useCallback(() => suppressFocusOpenRef.current, [])

  const contextValue = useMemo<NavigationMenuContextValue>(
    () => ({
      value: currentValue,
      setValue,
      scheduleOpen,
      scheduleClose,
      cancelClose,
      closeOnClick,
      handleItemClick,
      handleFocusLeave,
      portal,
      disabled,
      offset,
      placement,
      showArrow,
      menubarRef,
      isFocusOpenSuppressed
    }),
    [
      cancelClose,
      closeOnClick,
      currentValue,
      disabled,
      handleFocusLeave,
      handleItemClick,
      isFocusOpenSuppressed,
      offset,
      placement,
      portal,
      scheduleClose,
      scheduleOpen,
      setValue,
      showArrow
    ]
  )

  const childrenArray = React.Children.toArray(children)
  const hasList = childrenArray.some(
    (child) => React.isValidElement(child) && child.type === NavigationMenuList
  )

  return (
    <NavigationMenuContext.Provider value={contextValue}>
      <nav
        {...navProps}
        ref={rootRef}
        className={classNames(getNavigationMenuClasses(), className)}
        style={style}
        aria-label={navProps['aria-label'] ?? 'Main'}
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
