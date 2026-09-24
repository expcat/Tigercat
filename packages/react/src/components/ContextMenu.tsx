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
  classNames,
  getSecureRel,
  resolveLinkHref,
  getContextMenuContainerClasses,
  getContextMenuTriggerClasses,
  getContextMenuMenuClasses,
  getContextMenuItemClasses,
  getContextMenuSubTriggerClasses,
  getContextMenuSubChevronClasses,
  createContextMenuVirtualReference,
  getContextMenuOpenPoint,
  getContextMenuSubKeys,
  getContextMenuSubPlacement,
  getOverlayTriggerAria,
  type ContextMenuVirtualReference,
  CONTEXT_MENU_SUB_HIDE_DELAY_MS,
  CONTEXT_MENU_ENTER_CLASS,
  CONTEXT_MENU_SUB_CHEVRON_PATH,
  isContextMenuKeyboardEvent,
  handleMenuNavigation,
  focusFirstMenuItem,
  captureActiveElement,
  restoreFocus,
  type ContextMenuPoint,
  type ContextMenuProps as CoreContextMenuProps,
  type ContextMenuMenuProps as CoreContextMenuMenuProps,
  type ContextMenuItemProps as CoreContextMenuItemProps,
  type ContextMenuSubProps as CoreContextMenuSubProps,
  type FloatingPlacement,
  type PopupMenuCheckChange,
  type PopupMenuItem
} from '@expcat/tigercat-core'
import { PopupMenuList } from './popup-menu-items'
import { useAnchoredOverlay } from '../utils/overlay'
import { OverlayPortal } from '../utils/overlay-outlet'
import { renderOverlayTrigger } from '../utils/overlay-trigger'

export interface ContextMenuContextValue {
  closeOnClick: boolean
  handleItemClick: () => void
  portal: boolean
  open: boolean
}

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

export interface ContextMenuMenuProps
  extends
    Omit<CoreContextMenuMenuProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const ContextMenuMenu: React.FC<ContextMenuMenuProps> = ({
  className,
  style,
  children,
  role,
  ...divProps
}) => {
  const menuClasses = classNames(getContextMenuMenuClasses(), className)

  return (
    <div className={menuClasses} style={style} role={role ?? 'menu'} {...divProps}>
      {children}
    </div>
  )
}

export interface ContextMenuItemProps
  extends
    Omit<CoreContextMenuItemProps, 'className'>,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ButtonHTMLAttributes<HTMLButtonElement>,
      'onClick' | 'disabled' | 'href'
    > {
  className?: string
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  children?: React.ReactNode
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  disabled = false,
  divided = false,
  href,
  className,
  onClick,
  children,
  ...rest
}) => {
  const context = useContext(ContextMenuContext)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }

    onClick?.(event)

    if (context?.closeOnClick) {
      context.handleItemClick()
    }
  }

  const itemClasses = classNames(getContextMenuItemClasses(disabled, divided), className)
  const safeHref = resolveLinkHref(href, { disabled })
  const Comp = safeHref ? 'a' : 'button'
  const { target, rel, ...itemRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>

  return (
    <Comp
      {...(itemRest as React.HTMLAttributes<HTMLElement>)}
      {...(Comp === 'a'
        ? { href: safeHref, target, rel: getSecureRel(target, rel) }
        : { type: 'button' as const })}
      className={itemClasses}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      disabled={Comp === 'button' ? disabled : undefined}
      onClick={handleClick}>
      {children}
    </Comp>
  )
}

export interface ContextMenuSubProps extends Omit<CoreContextMenuSubProps, 'className'> {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const ContextMenuSub: React.FC<ContextMenuSubProps> = ({
  title = '',
  disabled = false,
  className,
  style,
  children
}) => {
  const context = useContext(ContextMenuContext)
  const [isHovered, setIsHovered] = useState(false)
  const [isOpenByKeyboard, setIsOpenByKeyboard] = useState(false)
  const popupCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const subMenuId = `tiger-context-menu-sub-${useId()}`

  const isExpanded = isHovered || isOpenByKeyboard
  const portalEnabled = Boolean(context?.portal)

  const overlay = useAnchoredOverlay({
    referenceRef: titleRef,
    floatingRef: popupRef,
    enabled: Boolean(context) && isExpanded && !disabled,
    placement: getContextMenuSubPlacement(
      titleRef.current?.closest('[dir]')?.getAttribute('dir') ??
        (typeof document === 'undefined' ? undefined : document.documentElement.getAttribute('dir'))
    ),
    offset: 4,
    portal: portalEnabled,
    dismissOnEscape: true,
    onDismiss: () => {
      setIsOpenByKeyboard(false)
      setIsHovered(false)
    }
  })

  useEffect(() => {
    if (!context?.open) {
      setIsHovered(false)
      setIsOpenByKeyboard(false)
    }
  }, [context?.open])

  useEffect(() => {
    return () => {
      if (popupCloseTimerRef.current) {
        clearTimeout(popupCloseTimerRef.current)
      }
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (popupCloseTimerRef.current) {
      clearTimeout(popupCloseTimerRef.current)
      popupCloseTimerRef.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (disabled) return
    clearCloseTimer()
    setIsHovered(true)
  }, [clearCloseTimer, disabled])

  const handleMouseLeave = useCallback(() => {
    const close = () => {
      setIsHovered(false)
      setIsOpenByKeyboard(false)
    }

    if (portalEnabled) {
      popupCloseTimerRef.current = setTimeout(close, CONTEXT_MENU_SUB_HIDE_DELAY_MS)
      return
    }

    close()
  }, [portalEnabled])

  const focusPopupFirstItem = useCallback(() => {
    requestAnimationFrame(() => {
      if (popupRef.current) focusFirstMenuItem(popupRef.current)
    })
  }, [])

  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return

      const dir =
        titleRef.current?.closest('[dir]')?.getAttribute('dir') ??
        document.documentElement.getAttribute('dir')
      const { openKey, closeKey } = getContextMenuSubKeys(dir)

      if (event.key === openKey || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        setIsOpenByKeyboard(true)
        setIsHovered(true)
        focusPopupFirstItem()
        return
      }

      if (event.key === closeKey || event.key === 'Escape') {
        if (isExpanded) {
          event.preventDefault()
          event.stopPropagation()
          setIsOpenByKeyboard(false)
          setIsHovered(false)
          titleRef.current?.focus()
        }
      }
    },
    [disabled, focusPopupFirstItem, isExpanded]
  )

  const handlePopupKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (popupRef.current) {
      handleMenuNavigation(popupRef.current, event.nativeEvent)
    }

    const dir =
      event.currentTarget.closest('[dir]')?.getAttribute('dir') ??
      document.documentElement.getAttribute('dir')
    const { closeKey } = getContextMenuSubKeys(dir)
    if (event.key === closeKey || event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setIsOpenByKeyboard(false)
      setIsHovered(false)
      titleRef.current?.focus()
    }
  }, [])

  const handlePopupContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
  }, [])

  if (!context) return null

  const triggerClasses = classNames(getContextMenuSubTriggerClasses(disabled), className)
  const popupClasses = classNames(overlay.floatingClasses, CONTEXT_MENU_ENTER_CLASS)

  const popup = (
    <div
      ref={popupRef}
      className={popupClasses}
      style={overlay.floatingStyles}
      data-positioned={overlay.positioned}
      data-tiger-context-menu-sub=""
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handlePopupKeyDown}
      onContextMenu={handlePopupContextMenu}>
      <div id={subMenuId} className={getContextMenuMenuClasses()} role="menu">
        {children}
      </div>
    </div>
  )

  return (
    <div
      className={portalEnabled ? undefined : 'relative'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="none">
      <button
        ref={titleRef}
        type="button"
        className={triggerClasses}
        style={style}
        role="menuitem"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? subMenuId : undefined}
        aria-disabled={disabled || undefined}
        data-state={isExpanded ? 'open' : 'closed'}
        data-tiger-context-menu-sub-trigger=""
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (disabled) return
          if (isExpanded) {
            setIsOpenByKeyboard(false)
            setIsHovered(false)
            return
          }
          setIsOpenByKeyboard(true)
          setIsHovered(true)
        }}
        onKeyDown={handleTitleKeyDown}>
        <span className="flex-1 text-start">{title}</span>
        <svg
          className={getContextMenuSubChevronClasses()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d={CONTEXT_MENU_SUB_CHEVRON_PATH} />
        </svg>
      </button>
      {isExpanded ? (
        portalEnabled ? (
          <OverlayPortal target={overlay.target}>{popup}</OverlayPortal>
        ) : (
          popup
        )
      ) : null}
    </div>
  )
}

export interface ContextMenuProps
  extends
    Omit<CoreContextMenuProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'onContextMenu'> {
  style?: React.CSSProperties
  placement?: FloatingPlacement
  asChild?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  items?: PopupMenuItem[]
  onCheck?: (change: PopupMenuCheckChange) => void
  onItemSelect?: (item: PopupMenuItem) => void
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  disabled = false,
  open: controlledOpen,
  defaultOpen = false,
  closeOnClick = true,
  portal = true,
  offset = 0,
  placement = 'bottom-start',
  asChild = false,
  className,
  style,
  onOpenChange,
  children,
  items,
  onCheck,
  onItemSelect,
  ...divProps
}) => {
  const [internalVisible, setInternalVisible] = useState(defaultOpen)
  const visible = controlledOpen !== undefined ? controlledOpen : internalVisible

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const explicitPointRef = useRef(false)
  const [point, setPoint] = useState<ContextMenuPoint>({ x: 0, y: 0 })
  const virtualReferenceRef = useRef<ContextMenuVirtualReference | null>(null)
  if (virtualReferenceRef.current == null) {
    virtualReferenceRef.current = createContextMenuVirtualReference(
      point,
      typeof document === 'undefined' ? null : document.documentElement
    )
  }
  virtualReferenceRef.current.setPoint(point)
  const positionReferenceRef = useMemo(
    () => ({
      get current() {
        return virtualReferenceRef.current
      }
    }),
    []
  )

  const reactId = useId()
  const menuId = useMemo(() => `tiger-context-menu-${reactId}`, [reactId])

  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (disabled && newVisible) return

      if (newVisible && !visible) {
        previousActiveElementRef.current = captureActiveElement()
      }

      if (controlledOpen === undefined) {
        setInternalVisible(newVisible)
      }

      onOpenChange?.(newVisible)

      if (newVisible) {
        requestAnimationFrame(() => {
          if (floatingRef.current) {
            focusFirstMenuItem(floatingRef.current)
          }
        })
      } else {
        explicitPointRef.current = false
        restoreFocus(previousActiveElementRef.current)
        previousActiveElementRef.current = null
      }
    },
    [disabled, visible, controlledOpen, onOpenChange]
  )

  useLayoutEffect(() => {
    if (!visible || explicitPointRef.current) return
    if (!triggerRef.current) return
    setPoint(getContextMenuOpenPoint(null, triggerRef.current))
  }, [visible])

  const handleItemClick = useCallback(() => {
    if (closeOnClick) {
      setVisible(false)
    }
  }, [closeOnClick, setVisible])

  const openAt = useCallback(
    (next: ContextMenuPoint) => {
      explicitPointRef.current = true
      setPoint(next)
      setVisible(true)
    },
    [setVisible]
  )

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return
      event.preventDefault()
      event.stopPropagation()
      openAt(getContextMenuOpenPoint(event.nativeEvent, triggerRef.current))
    },
    [disabled, openAt]
  )

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled || !isContextMenuKeyboardEvent(event)) return
      event.preventDefault()
      openAt(getContextMenuOpenPoint(null, triggerRef.current))
    },
    [disabled, openAt]
  )

  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        setVisible(false)
        return
      }
      if (floatingRef.current) {
        handleMenuNavigation(floatingRef.current, event.nativeEvent)
      }
    },
    [setVisible]
  )

  const handleMenuContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
  }, [])

  const overlay = useAnchoredOverlay({
    referenceRef: triggerRef,
    positionReferenceRef,
    revision: `${point.x},${point.y}`,
    floatingRef,
    enabled: visible,
    placement,
    offset,
    portal,
    containerRef,
    dismissOnOutside: true,
    dismissOnEscape: true,
    onDismiss: () => setVisible(false)
  })

  const containerClasses = useMemo(
    () => classNames(getContextMenuContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getContextMenuTriggerClasses(disabled), [disabled])
  const menuWrapperClasses = classNames(overlay.floatingClasses, CONTEXT_MENU_ENTER_CLASS)
  const triggerAria = getOverlayTriggerAria({
    kind: 'menu',
    open: visible,
    controlsId: menuId,
    disabled
  })

  const contextValue = useMemo<ContextMenuContextValue>(
    () => ({ closeOnClick, handleItemClick, portal, open: visible }),
    [closeOnClick, handleItemClick, portal, visible]
  )

  const childrenArray = React.Children.toArray(children)
  const triggerChildren: React.ReactNode[] = []
  let menuElement: React.ReactNode = null

  childrenArray.forEach((child) => {
    if (React.isValidElement(child) && child.type === ContextMenuMenu) {
      menuElement = child
      return
    }
    triggerChildren.push(child)
  })

  const menuWrapperNode =
    visible && (menuElement || (items && items.length > 0)) ? (
      <div
        ref={floatingRef}
        className={menuWrapperClasses}
        style={overlay.floatingStyles}
        data-positioned={overlay.positioned}
        data-tiger-context-menu=""
        role={items && items.length > 0 && !menuElement ? 'menu' : undefined}
        onKeyDown={handleMenuKeyDown}
        onContextMenu={handleMenuContextMenu}>
        {items && items.length > 0 ? (
          <PopupMenuList
            items={items}
            onCheck={onCheck}
            onSelect={onItemSelect}
            onClose={() => setVisible(false)}
          />
        ) : null}
        {React.isValidElement(menuElement)
          ? React.cloneElement(menuElement as React.ReactElement<Record<string, unknown>>, {
              id: menuId
            })
          : menuElement}
      </div>
    ) : null

  return (
    <ContextMenuContext.Provider value={contextValue}>
      <div ref={containerRef} className={containerClasses} style={style} {...divProps}>
        {renderOverlayTrigger({
          asChild,
          child: triggerChildren.length === 1 ? triggerChildren[0] : triggerChildren,
          triggerRef,
          className: triggerClasses,
          disabled,
          aria: { ...triggerAria, 'data-tiger-context-menu-trigger': '' },
          handlers: {
            onContextMenu: handleContextMenu,
            onKeyDown: handleTriggerKeyDown
          }
        })}
        {menuWrapperNode ? (
          portal ? (
            <OverlayPortal target={overlay.target}>{menuWrapperNode}</OverlayPortal>
          ) : (
            menuWrapperNode
          )
        ) : null}
      </div>
    </ContextMenuContext.Provider>
  )
}

ContextMenu.displayName = 'ContextMenu'
ContextMenuMenu.displayName = 'ContextMenuMenu'
ContextMenuItem.displayName = 'ContextMenuItem'
ContextMenuSub.displayName = 'ContextMenuSub'

export default ContextMenu
