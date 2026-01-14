import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  classNames,
  getSubMenuTitleClasses,
  getSubMenuExpandIconClasses,
  getMenuItemIndent,
  isKeyOpen,
  menuItemIconClasses,
  submenuContentHorizontalClasses,
  submenuContentPopupClasses,
  submenuContentVerticalClasses,
  submenuContentInlineClasses,
  type SubMenuProps as CoreSubMenuProps,
} from '@tigercat/core';
import { useMenuContext } from './Menu';
import { MenuItem } from './MenuItem';
import { MenuItemGroup } from './MenuItemGroup';

export interface SubMenuProps extends CoreSubMenuProps {
  /**
   * Submenu content
   */
  children?: React.ReactNode;

  /**
   * Nesting level (internal use for indentation)
   */
  level?: number;

  /**
   * Internal override for collapsed rendering (used by SubMenu popup)
   */
  collapsed?: boolean;
}

const ExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    className={getSubMenuExpandIconClasses(expanded)}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor">
    <path d="M6 9L1.5 4.5L2.205 3.795L6 7.59L9.795 3.795L10.5 4.5L6 9Z" />
  </svg>
);

function getMenuButtonsWithin(menuEl: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    menuEl.querySelectorAll<HTMLButtonElement>(
      'button[data-tiger-menuitem="true"]'
    )
  ).filter(
    (el) => !el.disabled && !el.closest('[data-tiger-menu-hidden="true"]')
  );
}

function roveFocus(current: HTMLButtonElement, next: HTMLButtonElement) {
  const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null;
  if (!menuEl) {
    next.focus();
    return;
  }

  const items = getMenuButtonsWithin(menuEl);
  items.forEach((el) => {
    el.tabIndex = el === next ? 0 : -1;
  });
  next.focus();
}

function moveFocus(current: HTMLButtonElement, delta: number) {
  const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null;
  if (!menuEl) return;
  const items = getMenuButtonsWithin(menuEl);
  const currentIndex = items.indexOf(current);
  if (currentIndex < 0) return;
  const nextIndex = (currentIndex + delta + items.length) % items.length;
  roveFocus(current, items[nextIndex]);
}

function focusEdge(current: HTMLButtonElement, edge: 'start' | 'end') {
  const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null;
  if (!menuEl) return;
  const items = getMenuButtonsWithin(menuEl);
  if (items.length === 0) return;
  roveFocus(current, edge === 'start' ? items[0] : items[items.length - 1]);
}

function focusFirstChildItemFromTitle(titleEl: HTMLButtonElement) {
  const li = titleEl.closest('li');
  const submenu = li?.querySelector('ul[role="menu"]') as HTMLElement | null;
  if (!submenu) return;

  const items = getMenuButtonsWithin(submenu);
  if (items.length === 0) return;

  items.forEach((el, idx) => {
    el.tabIndex = idx === 0 ? 0 : -1;
  });
  items[0].focus();
}

export const SubMenu: React.FC<SubMenuProps> = ({
  itemKey,
  title = '',
  icon,
  disabled = false,
  className,
  level = 0,
  children,
  collapsed: collapsedOverride,
}) => {
  const menuContext = useMenuContext();

  if (!menuContext) {
    console.warn('SubMenu must be used within Menu component');
  }

  const [isHovered, setIsHovered] = useState(false);
  const [isOpenByKeyboard, setIsOpenByKeyboard] = useState(false);

  const effectiveCollapsed =
    collapsedOverride ?? (menuContext ? menuContext.collapsed : false);

  const isPopup =
    !!menuContext && menuContext.mode === 'vertical' && effectiveCollapsed;

  const isOpen = !!menuContext && isKeyOpen(itemKey, menuContext.openKeys);

  const isExpanded =
    menuContext?.mode === 'horizontal' || isPopup
      ? isHovered || isOpenByKeyboard
      : isOpen;

  const isInlineOrVertical = menuContext?.mode !== 'horizontal' && !isPopup;
  const [hasRenderedInline, setHasRenderedInline] = useState(() =>
    isInlineOrVertical ? isExpanded : false
  );

  useEffect(() => {
    if (!isInlineOrVertical || !isExpanded || hasRenderedInline) return;
    setHasRenderedInline(true);
  }, [hasRenderedInline, isExpanded, isInlineOrVertical]);

  const titleClasses = useMemo(() => {
    if (!menuContext) return '';
    return getSubMenuTitleClasses(menuContext.theme, disabled);
  }, [menuContext, disabled]);

  const contentClasses = useMemo(() => {
    if (!menuContext) return '';
    if (menuContext.mode === 'horizontal')
      return submenuContentHorizontalClasses;
    if (isPopup) return submenuContentPopupClasses;
    if (menuContext.mode === 'inline') return submenuContentInlineClasses;
    return submenuContentVerticalClasses;
  }, [menuContext, isPopup]);

  const handleTitleClick = useCallback(() => {
    if (!menuContext || disabled) return;

    if (menuContext.mode === 'horizontal') return;

    if (isPopup) {
      setIsOpenByKeyboard((prev) => !prev);
      setIsHovered(true);
      return;
    }

    setHasRenderedInline(true);
    menuContext.handleOpenChange(itemKey);
  }, [disabled, menuContext, itemKey, isPopup]);

  // Handle mouse enter for horizontal mode
  const handleMouseEnter = useCallback(() => {
    if (menuContext?.mode === 'horizontal' || isPopup) setIsHovered(true);
  }, [menuContext, isPopup]);

  // Handle mouse leave for horizontal mode
  const handleMouseLeave = useCallback(() => {
    if (menuContext?.mode === 'horizontal' || isPopup) {
      setIsHovered(false);
      setIsOpenByKeyboard(false);
    }
  }, [menuContext, isPopup]);

  const openInline = useCallback(
    (titleEl: HTMLButtonElement) => {
      if (!menuContext) return;
      setHasRenderedInline(true);
      menuContext.handleOpenChange(itemKey);
      setTimeout(() => focusFirstChildItemFromTitle(titleEl), 0);
    },
    [menuContext, itemKey]
  );

  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!menuContext || disabled) return;

      const current = event.currentTarget;
      const rootMenu = current.closest('ul[role="menu"]') as HTMLElement | null;
      const isRoot = rootMenu?.dataset.tigerMenuRoot === 'true';
      const isHorizontalRoot = isRoot && menuContext.mode === 'horizontal';

      const nextKey = isHorizontalRoot ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontalRoot ? 'ArrowLeft' : 'ArrowUp';

      if (event.key === nextKey) {
        event.preventDefault();
        moveFocus(current, 1);
        return;
      }

      if (event.key === prevKey) {
        event.preventDefault();
        moveFocus(current, -1);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        focusEdge(current, 'start');
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        focusEdge(current, 'end');
        return;
      }

      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        if (menuContext.mode === 'horizontal' || isPopup) {
          event.preventDefault();
          setIsOpenByKeyboard(false);
          setIsHovered(false);
          return;
        }

        if (isOpen) {
          event.preventDefault();
          menuContext.handleOpenChange(itemKey);
        }
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (menuContext.mode === 'horizontal' || isPopup) {
          setIsOpenByKeyboard(true);
          return;
        }
        openInline(current);
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        if (menuContext.mode === 'horizontal' || isPopup) {
          event.preventDefault();
          setIsOpenByKeyboard(true);
          return;
        }

        if (!isOpen) {
          event.preventDefault();
          openInline(current);
        }
      }
    },
    [menuContext, disabled, isOpen, isPopup, openInline]
  );

  const indentStyle =
    !menuContext || menuContext.mode === 'horizontal' || level === 0
      ? {}
      : getMenuItemIndent(level, menuContext.inlineIndent);

  if (!menuContext) return null;

  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === 'string') {
      return (
        <span
          className={menuItemIconClasses}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }

    return (
      <span className={menuItemIconClasses}>{icon as React.ReactNode}</span>
    );
  };

  const renderTitle = () => {
    if (!effectiveCollapsed) {
      return (
        <>
          {renderIcon()}
          <span className="flex-1">{title}</span>
          {menuContext.mode !== 'horizontal' && !isPopup && (
            <ExpandIcon expanded={isExpanded} />
          )}
        </>
      );
    } else if (!icon) {
      // Show first letter when collapsed without icon
      return (
        <span className="flex-1 text-center">
          {title.charAt(0).toUpperCase()}
        </span>
      );
    } else {
      return renderIcon();
    }
  };

  const renderContent = () => {
    const nextLevel = level + 1;
    const enhancedChildren = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      if (
        child.type === MenuItem ||
        child.type === SubMenu ||
        child.type === MenuItemGroup
      ) {
        return React.cloneElement(
          child as React.ReactElement<{ level?: number; collapsed?: boolean }>,
          {
            level: nextLevel,
            collapsed: isPopup ? false : undefined,
          }
        );
      }

      return child;
    });

    if (menuContext.mode === 'horizontal' || isPopup) {
      return (
        <ul
          className={contentClasses}
          style={{ display: isExpanded ? 'block' : 'none' }}
          role="menu"
          aria-hidden={isExpanded ? undefined : 'true'}>
          {enhancedChildren}
        </ul>
      );
    }

    if (!hasRenderedInline) return null;

    const isHidden = !isExpanded;

    return (
      <div
        className={classNames(
          'grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-in-out',
          isHidden ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
        )}
        aria-hidden={isHidden ? 'true' : undefined}
        data-tiger-menu-hidden={isHidden ? 'true' : undefined}>
        <ul className={classNames(contentClasses, 'min-h-0')} role="menu">
          {enhancedChildren}
        </ul>
      </div>
    );
  };

  return (
    <li
      className={classNames(
        menuContext.mode === 'horizontal' || isPopup ? 'relative' : '',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="none">
      <button
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
        disabled={disabled}
        tabIndex={-1}>
        {renderTitle()}
      </button>
      {renderContent()}
    </li>
  );
};
