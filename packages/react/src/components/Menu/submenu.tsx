import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import {
  classNames,
  getSubMenuTitleClasses,
  getMenuItemIndent,
  isKeyOpen,
  menuItemIconClasses,
  menuCollapsedIconClasses,
  submenuContentHorizontalClasses,
  submenuContentHorizontalNestedClasses,
  submenuContentPopupClasses,
  submenuContentVerticalClasses,
  submenuContentInlineClasses,
  submenuHeightTransitionClasses,
  getInitialSubmenuHeightTransitionStyle,
  createSubmenuHeightTransitionController,
  moveFocusInMenu,
  focusMenuEdge,
  focusFirstChildItem,
  getMenuNavigationKeys,
  type SubmenuHeightTransitionController,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../../utils/overlay'
import { useMenuContext } from './context'
import { ExpandIcon } from './icons'
import { MenuItem } from './menu-item'
import { MenuItemGroup } from './menu-item-group'
import type { SubMenuProps } from './types'

export const SubMenu: React.FC<SubMenuProps> = ({
  itemKey,
  title = '',
  icon,
  disabled = false,
  className,
  level = 0,
  children,
  collapsed: collapsedOverride
}) => {
  const menuContext = useMenuContext()

  if (!menuContext) {
    console.warn('SubMenu must be used within Menu component')
  }

  const [isHovered, setIsHovered] = useState(false)
  const [isOpenByKeyboard, setIsOpenByKeyboard] = useState(false)
  const popupCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLUListElement | null>(null)
  const submenuContentRef = useRef<HTMLDivElement | null>(null)
  const heightTransitionRef = useRef<SubmenuHeightTransitionController | null>(null)

  const effectiveCollapsed = collapsedOverride ?? (menuContext ? menuContext.collapsed : false)

  const isPopup =
    !!menuContext &&
    (menuContext.mode === 'horizontal' || (menuContext.mode === 'vertical' && effectiveCollapsed))

  const isOpen = !!menuContext && isKeyOpen(itemKey, menuContext.openKeys)

  const isExpanded = isPopup ? isHovered || isOpenByKeyboard : isOpen
  const popupPortal = Boolean(isPopup && menuContext?.popupPortal)
  const popupPlacement: FloatingPlacement =
    menuContext?.mode === 'horizontal' && level === 0 ? 'bottom-start' : 'right-start'
  const overlay = useAnchoredOverlay({
    referenceRef: titleRef,
    floatingRef: popupRef,
    enabled: isPopup && isExpanded,
    placement: popupPlacement,
    offset: 4,
    portal: popupPortal,
    dismissOnEscape: true,
    onDismiss: () => {
      setIsOpenByKeyboard(false)
      setIsHovered(false)
    }
  })

  const isInlineOrVertical = menuContext?.mode !== 'horizontal' && !isPopup
  const [hasRenderedInline, setHasRenderedInline] = useState(() =>
    isInlineOrVertical ? isExpanded : false
  )

  useEffect(() => {
    if (!isInlineOrVertical || !isExpanded || hasRenderedInline) return
    setHasRenderedInline(true)
  }, [hasRenderedInline, isExpanded, isInlineOrVertical])

  const disposeHeightTransition = useCallback(() => {
    heightTransitionRef.current?.dispose()
    heightTransitionRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      disposeHeightTransition()
      if (popupCloseTimerRef.current) {
        clearTimeout(popupCloseTimerRef.current)
      }
    }
  }, [disposeHeightTransition])

  useLayoutEffect(() => {
    if (!isInlineOrVertical || !hasRenderedInline || !submenuContentRef.current) {
      disposeHeightTransition()
      return
    }

    if (!heightTransitionRef.current) {
      heightTransitionRef.current = createSubmenuHeightTransitionController(
        submenuContentRef.current,
        { expanded: isExpanded }
      )
      return
    }

    heightTransitionRef.current.update(isExpanded)
  }, [disposeHeightTransition, hasRenderedInline, isExpanded, isInlineOrVertical])

  const titleClasses = useMemo(() => {
    if (!menuContext) return ''
    return classNames(getSubMenuTitleClasses(menuContext.theme, disabled), className)
  }, [menuContext, disabled, className])

  const contentClasses = useMemo(() => {
    if (!menuContext) return ''
    if (menuContext.mode === 'horizontal') {
      return level === 0 ? submenuContentHorizontalClasses : submenuContentHorizontalNestedClasses
    }
    if (isPopup) return submenuContentPopupClasses
    if (menuContext.mode === 'inline') return submenuContentInlineClasses
    return submenuContentVerticalClasses
  }, [menuContext, isPopup, level])

  const handleTitleClick = useCallback(() => {
    if (!menuContext || disabled) return

    if (menuContext.mode === 'horizontal') return

    if (isPopup) {
      setIsOpenByKeyboard((prev) => !prev)
      setIsHovered(true)
      return
    }

    setHasRenderedInline(true)
    menuContext.handleOpenChange(itemKey)
  }, [disabled, menuContext, itemKey, isPopup])

  // Handle mouse enter for horizontal mode
  const handleMouseEnter = useCallback(() => {
    if (popupCloseTimerRef.current) {
      clearTimeout(popupCloseTimerRef.current)
      popupCloseTimerRef.current = null
    }
    if (menuContext?.mode === 'horizontal' || isPopup) setIsHovered(true)
  }, [menuContext, isPopup])

  // Handle mouse leave for horizontal mode
  const handleMouseLeave = useCallback(() => {
    if (menuContext?.mode === 'horizontal' || isPopup) {
      const close = () => {
        setIsHovered(false)
        setIsOpenByKeyboard(false)
      }

      if (popupPortal) {
        popupCloseTimerRef.current = setTimeout(close, 120)
        return
      }

      close()
    }
  }, [menuContext, isPopup, popupPortal])

  const openInline = useCallback(
    (titleEl: HTMLButtonElement) => {
      if (!menuContext) return
      setHasRenderedInline(true)
      menuContext.handleOpenChange(itemKey)
      setTimeout(() => focusFirstChildItem(titleEl), 0)
    },
    [menuContext, itemKey]
  )

  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!menuContext || disabled) return

      const current = event.currentTarget
      const rootMenu = current.closest('ul[role="menu"]') as HTMLElement | null
      const isRoot = rootMenu?.dataset.tigerMenuRoot === 'true'
      const { nextKey, prevKey } = getMenuNavigationKeys(menuContext.mode, isRoot)

      if (event.key === nextKey) {
        event.preventDefault()
        moveFocusInMenu(current, 1)
        return
      }

      if (event.key === prevKey) {
        event.preventDefault()
        moveFocusInMenu(current, -1)
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        focusMenuEdge(current, 'start')
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        focusMenuEdge(current, 'end')
        return
      }

      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        if (menuContext.mode === 'horizontal' || isPopup) {
          event.preventDefault()
          setIsOpenByKeyboard(false)
          setIsHovered(false)
          return
        }

        if (isOpen) {
          event.preventDefault()
          menuContext.handleOpenChange(itemKey)
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (menuContext.mode === 'horizontal' || isPopup) {
          setIsOpenByKeyboard(true)
          return
        }
        openInline(current)
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        if (menuContext.mode === 'horizontal' || isPopup) {
          event.preventDefault()
          setIsOpenByKeyboard(true)
          return
        }

        if (!isOpen) {
          event.preventDefault()
          openInline(current)
        }
      }
    },
    [menuContext, disabled, isOpen, isPopup, itemKey, openInline]
  )

  const indentStyle =
    !menuContext || menuContext.mode === 'horizontal' || level === 0
      ? {}
      : getMenuItemIndent(level, menuContext.inlineIndent)

  if (!menuContext) return null

  const renderIcon = () => {
    if (!icon) return null

    const iconClasses = effectiveCollapsed ? menuCollapsedIconClasses : menuItemIconClasses
    if (typeof icon === 'string') {
      return <span className={iconClasses} dangerouslySetInnerHTML={{ __html: icon }} />
    }

    return <span className={iconClasses}>{icon as React.ReactNode}</span>
  }

  const renderTitle = () => {
    if (!effectiveCollapsed) {
      return (
        <>
          {renderIcon()}
          <span className="flex-1">{title}</span>
          {menuContext.mode !== 'horizontal' && !isPopup && <ExpandIcon expanded={isExpanded} />}
        </>
      )
    } else if (!icon) {
      // First-letter fallback is aria-hidden; the sr-only full title below
      // keeps the accessible name complete.
      return (
        <>
          <span className="flex-1 text-center" aria-hidden="true">
            {title.charAt(0).toUpperCase()}
          </span>
          <span className="sr-only">{title}</span>
        </>
      )
    } else {
      return (
        <>
          {renderIcon()}
          <span className="sr-only">{title}</span>
        </>
      )
    }
  }

  const renderContent = () => {
    const nextLevel = level + 1
    const enhancedChildren = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child

      if (child.type === MenuItem || child.type === SubMenu || child.type === MenuItemGroup) {
        return React.cloneElement(
          child as React.ReactElement<{ level?: number; collapsed?: boolean }>,
          {
            level: nextLevel,
            collapsed: isPopup ? false : undefined
          }
        )
      }

      return child
    })

    if (isPopup) {
      const popup = (
        <ul
          ref={popupRef}
          className={classNames(contentClasses, overlay.floatingClasses)}
          style={{ ...overlay.floatingStyles, display: isExpanded ? 'block' : 'none' }}
          data-positioned={overlay.positioned}
          role="menu"
          aria-hidden={isExpanded ? undefined : 'true'}
          onMouseEnter={popupPortal ? handleMouseEnter : undefined}
          onMouseLeave={popupPortal ? handleMouseLeave : undefined}
          data-tiger-submenu-popup="">
          {enhancedChildren}
        </ul>
      )

      return renderOverlayPortal(popup, overlay.target, !popupPortal)
    }

    if (!hasRenderedInline) return null

    const isHidden = !isExpanded

    return (
      <div
        ref={submenuContentRef}
        className={submenuHeightTransitionClasses}
        style={
          heightTransitionRef.current
            ? undefined
            : getInitialSubmenuHeightTransitionStyle(isExpanded)
        }
        aria-hidden={isHidden ? 'true' : undefined}
        data-tiger-menu-hidden={isHidden ? 'true' : undefined}
        data-tiger-submenu-motion="height">
        <ul className={contentClasses} role="menu">
          {enhancedChildren}
        </ul>
      </div>
    )
  }

  return (
    <li
      className={isPopup && !popupPortal ? 'relative' : ''}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="none">
      <button
        ref={titleRef}
        type="button"
        className={titleClasses}
        style={indentStyle}
        onClick={handleTitleClick}
        onKeyDown={handleTitleKeyDown}
        role="menuitem"
        data-tiger-menuitem="true"
        aria-expanded={isExpanded ? 'true' : 'false'}
        aria-haspopup="true"
        aria-disabled={disabled ? 'true' : undefined}
        data-state={isExpanded ? 'open' : 'closed'}
        disabled={disabled}
        tabIndex={-1}>
        {renderTitle()}
      </button>
      {renderContent()}
    </li>
  )
}
