import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useId
} from 'react'
import {
  classNames,
  createSubmenuHeightTransitionController,
  focusFirstChildItem,
  focusMenuEdge,
  getMenuItemIndent,
  getMenuListRole,
  getMenuNavigationKeys,
  getMenuPopupPlacement,
  getSubMenuTitleClasses,
  hasSelectedMenuDescendant,
  isKeyOpen,
  isMenuRoving,
  isSubmenuPopup,
  MENU_POPUP_HOVER_CLOSE_MS,
  moveFocusInMenu,
  sameMenuKey,
  shouldIndentMenuItem,
  submenuContentInlineClasses,
  submenuContentPopupClasses,
  submenuContentVerticalClasses,
  submenuHeightTransitionClasses,
  type SubmenuHeightTransitionController
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../../utils/overlay'
import {
  MenuContext,
  SubMenuScopeContext,
  useMenuContext,
  useSubMenuScope,
  warnMissingMenuContext
} from './context'
import { ExpandIcon } from './icons'
import {
  collectReactMenuKeys,
  getReactMenuPlainText,
  mapMenuChildren,
  renderCollapsedLabel,
  renderMenuIcon
} from './render'
import type { SubMenuProps } from './types'

export const SubMenu: React.FC<SubMenuProps> = ({
  itemKey,
  title = '',
  icon,
  disabled = false,
  className,
  level = 0,
  children,
  collapsed: collapsedOverride,
  ...rest
}) => {
  const menuContext = useMenuContext()
  const parentScope = useSubMenuScope()

  if (!menuContext) {
    warnMissingMenuContext('SubMenu')
  }

  const titleRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLUListElement | null>(null)
  const submenuContentRef = useRef<HTMLDivElement | null>(null)
  const heightTransitionRef = useRef<SubmenuHeightTransitionController | null>(null)
  const popupCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleId = useId()
  const listId = useId()

  const effectiveCollapsed = collapsedOverride ?? (menuContext ? menuContext.collapsed : false)
  const isPopup = Boolean(menuContext && isSubmenuPopup(menuContext.mode, effectiveCollapsed))
  const isOpen = Boolean(menuContext && isKeyOpen(itemKey, menuContext.openKeys))
  const isExpanded = isOpen
  const popupPortal = Boolean(isPopup && menuContext?.popupPortal)
  const overlay = useAnchoredOverlay({
    referenceRef: titleRef,
    floatingRef: popupRef,
    enabled: isPopup && isExpanded,
    placement: getMenuPopupPlacement(menuContext?.mode ?? 'vertical', level),
    offset: popupPortal ? 4 : 0,
    portal: popupPortal,
    dismissOnEscape: true,
    dismissOnOutside: true,
    onDismiss: () => {
      menuContext?.handleOpenChange(itemKey, false)
    }
  })

  const isInlineOrVertical = Boolean(menuContext && !isPopup)
  const [hasRenderedInline, setHasRenderedInline] = useState(() =>
    isInlineOrVertical ? isExpanded : false
  )

  useEffect(() => {
    if (!isInlineOrVertical || !isExpanded || hasRenderedInline) return
    setHasRenderedInline(true)
  }, [hasRenderedInline, isExpanded, isInlineOrVertical])

  useEffect(() => {
    return () => {
      heightTransitionRef.current?.dispose()
      heightTransitionRef.current = null
      if (popupCloseTimerRef.current) clearTimeout(popupCloseTimerRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    if (!isInlineOrVertical || !hasRenderedInline || !submenuContentRef.current) {
      heightTransitionRef.current?.dispose()
      heightTransitionRef.current = null
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
  }, [hasRenderedInline, isExpanded, isInlineOrVertical])

  const descendantKeys = useMemo(() => collectReactMenuKeys(children), [children])
  const childSelected = Boolean(
    menuContext && hasSelectedMenuDescendant(menuContext.selectedKeys, descendantKeys)
  )

  const titleClasses = useMemo(() => {
    if (!menuContext) return ''
    return classNames(
      getSubMenuTitleClasses(menuContext.theme, disabled, {
        collapsed: effectiveCollapsed,
        childSelected
      }),
      className
    )
  }, [menuContext, disabled, className, effectiveCollapsed, childSelected])

  const contentClasses = useMemo(() => {
    if (!menuContext) return ''
    if (isPopup) return submenuContentPopupClasses
    if (menuContext.mode === 'inline') return submenuContentInlineClasses
    return submenuContentVerticalClasses
  }, [menuContext, isPopup])

  const clearCloseTimer = () => {
    if (popupCloseTimerRef.current) {
      clearTimeout(popupCloseTimerRef.current)
      popupCloseTimerRef.current = null
    }
  }

  const handleTitleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!menuContext || disabled) return
      if (isInlineOrVertical) setHasRenderedInline(true)
      const pointerType = 'pointerType' in event.nativeEvent ? event.nativeEvent.pointerType : ''
      if (isPopup && isExpanded && pointerType === 'mouse') return
      menuContext.handleOpenChange(itemKey)
    },
    [disabled, menuContext, itemKey, isInlineOrVertical, isPopup, isExpanded]
  )

  const handleMouseEnter = useCallback(() => {
    if (!menuContext || disabled || !isPopup) return
    clearCloseTimer()
    menuContext.handleOpenChange(itemKey, true)
  }, [menuContext, disabled, isPopup, itemKey])

  const handleMouseLeave = useCallback(() => {
    if (!menuContext || !isPopup) return
    clearCloseTimer()
    popupCloseTimerRef.current = setTimeout(() => {
      menuContext.handleOpenChange(itemKey, false)
    }, MENU_POPUP_HOVER_CLOSE_MS)
  }, [menuContext, isPopup, itemKey])

  const focusFirstChild = useCallback(
    (titleEl: HTMLButtonElement) => {
      const run = () => focusFirstChildItem(titleEl, isPopup ? popupRef.current : null)
      if (isPopup) {
        requestAnimationFrame(run)
        return
      }
      requestAnimationFrame(run)
    },
    [isPopup]
  )

  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!menuContext || disabled) return

      const current = event.currentTarget
      const rootMenu = current.closest('[data-tiger-menu-root="true"]') as HTMLElement | null
      const isRoot = Boolean(rootMenu && current.closest('[data-tiger-menu-list]') === rootMenu)
      const { nextKey, prevKey, openKey, closeKey } = getMenuNavigationKeys(
        menuContext.mode,
        isRoot,
        menuContext.dir
      )

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

      if (event.key === 'Escape' || event.key === closeKey) {
        if (isExpanded) {
          event.preventDefault()
          menuContext.handleOpenChange(itemKey, false)
          return
        }
        if (parentScope) {
          event.preventDefault()
          parentScope.close()
          parentScope.titleRef.current?.focus()
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isExpanded) {
          setHasRenderedInline(true)
          menuContext.handleOpenChange(itemKey, true)
        }
        focusFirstChild(current)
        return
      }

      if (event.key === openKey || (isPopup && event.key === 'ArrowDown')) {
        event.preventDefault()
        if (!isExpanded) {
          setHasRenderedInline(true)
          menuContext.handleOpenChange(itemKey, true)
        }
        focusFirstChild(current)
      }
    },
    [menuContext, disabled, isExpanded, isPopup, itemKey, parentScope, focusFirstChild]
  )

  const indentStyle =
    !menuContext || !shouldIndentMenuItem(menuContext.mode, level)
      ? {}
      : getMenuItemIndent(level, menuContext.inlineIndent)

  const closeSelf = useCallback(() => {
    menuContext?.handleOpenChange(itemKey, false)
  }, [menuContext, itemKey])

  const scopeValue = useMemo(
    () => ({
      itemKey,
      popup: isPopup,
      titleRef,
      close: closeSelf
    }),
    [itemKey, isPopup, closeSelf]
  )

  if (!menuContext) return null

  const inPopup = Boolean(parentScope?.popup)
  const roving = isMenuRoving(menuContext.mode, { popup: inPopup, isRoot: !parentScope })
  const isTabStop =
    !disabled &&
    roving &&
    menuContext.tabStopKey != null &&
    sameMenuKey(itemKey, menuContext.tabStopKey)
  const titleRole = inPopup || menuContext.mode === 'horizontal' ? 'menuitem' : undefined
  const listRole = getMenuListRole(menuContext.mode, { popup: isPopup })
  const label = title || getReactMenuPlainText(children)

  const renderTitle = () => {
    if (effectiveCollapsed) {
      return (
        <>
          {renderMenuIcon(icon, true)}
          {renderCollapsedLabel(label, icon)}
        </>
      )
    }
    return (
      <>
        {renderMenuIcon(icon, false)}
        <span className="flex-1">{title}</span>
        <ExpandIcon expanded={isExpanded} popup={isPopup} />
      </>
    )
  }

  const nestedContext = isPopup
    ? {
        ...menuContext,
        collapsed: false
      }
    : menuContext

  const enhancedChildren = (
    <MenuContext.Provider value={nestedContext}>
      <SubMenuScopeContext.Provider value={scopeValue}>
        {mapMenuChildren(children, {
          level: level + 1,
          collapsed: isPopup ? false : undefined
        })}
      </SubMenuScopeContext.Provider>
    </MenuContext.Provider>
  )

  const renderContent = () => {
    if (isPopup) {
      const popup = (
        <ul
          ref={popupRef}
          id={listId}
          className={classNames(contentClasses, overlay.floatingClasses)}
          style={{ ...overlay.floatingStyles, display: isExpanded ? 'block' : 'none' }}
          data-positioned={overlay.positioned}
          role={listRole}
          aria-labelledby={titleId}
          aria-hidden={isExpanded ? undefined : 'true'}
          data-tiger-menu-list=""
          data-tiger-submenu-popup=""
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
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
        aria-hidden={isHidden ? 'true' : undefined}
        data-tiger-menu-hidden={isHidden ? 'true' : undefined}
        data-tiger-submenu-motion="height">
        <ul
          id={listId}
          className={contentClasses}
          role={listRole}
          aria-labelledby={titleId}
          data-tiger-menu-list="">
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
      role={inPopup || menuContext.mode === 'horizontal' ? 'none' : undefined}
      data-tiger-submenu=""
      data-child-selected={childSelected ? 'true' : undefined}>
      <button
        {...rest}
        ref={titleRef}
        id={titleId}
        type="button"
        className={titleClasses}
        style={indentStyle}
        onClick={handleTitleClick}
        onKeyDown={handleTitleKeyDown}
        role={titleRole}
        data-tiger-menuitem="true"
        data-tiger-submenu-title=""
        aria-expanded={isExpanded ? 'true' : 'false'}
        aria-haspopup={isPopup ? 'menu' : undefined}
        aria-controls={listId}
        aria-disabled={disabled ? true : undefined}
        data-state={isExpanded ? 'open' : 'closed'}
        disabled={disabled}
        tabIndex={disabled ? -1 : roving ? (isTabStop ? 0 : -1) : 0}>
        {renderTitle()}
      </button>
      {renderContent()}
    </li>
  )
}

SubMenu.displayName = 'SubMenu'
