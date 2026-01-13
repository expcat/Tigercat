import React, { useCallback, useMemo, useState } from "react";
import {
  classNames,
  getSubMenuTitleClasses,
  getSubMenuExpandIconClasses,
  getMenuItemIndent,
  isKeyOpen,
  menuItemIconClasses,
  submenuContentHorizontalClasses,
  submenuContentVerticalClasses,
  type SubMenuProps as CoreSubMenuProps,
} from "@tigercat/core";
import { useMenuContext } from "./Menu";
import { MenuItem } from "./MenuItem";
import { MenuItemGroup } from "./MenuItemGroup";

export interface SubMenuProps extends CoreSubMenuProps {
  /**
   * Submenu content
   */
  children?: React.ReactNode;

  /**
   * Nesting level (internal use for indentation)
   */
  level?: number;
}

// Expand/collapse icon
const ExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    className={getSubMenuExpandIconClasses(expanded)}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor"
  >
    <path d="M6 9L1.5 4.5L2.205 3.795L6 7.59L9.795 3.795L10.5 4.5L6 9Z" />
  </svg>
);

function getMenuButtonsWithin(menuEl: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    menuEl.querySelectorAll<HTMLButtonElement>(
      'button[data-tiger-menuitem="true"]'
    )
  ).filter((el) => !el.disabled);
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

function focusEdge(current: HTMLButtonElement, edge: "start" | "end") {
  const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null;
  if (!menuEl) return;
  const items = getMenuButtonsWithin(menuEl);
  if (items.length === 0) return;
  roveFocus(current, edge === "start" ? items[0] : items[items.length - 1]);
}

function focusFirstChildItemFromTitle(titleEl: HTMLButtonElement) {
  const li = titleEl.closest("li");
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
  title = "",
  icon,
  disabled = false,
  className,
  level = 0,
  children,
}) => {
  // Get menu context
  const menuContext = useMenuContext();

  if (!menuContext) {
    console.warn("SubMenu must be used within Menu component");
  }

  const [isHovered, setIsHovered] = useState(false);
  const [isOpenByKeyboard, setIsOpenByKeyboard] = useState(false);

  // Check if this submenu is open
  const isOpen = !!menuContext && isKeyOpen(itemKey, menuContext.openKeys);

  // Determine if submenu should be shown
  const isExpanded =
    menuContext?.mode === "horizontal" ? isHovered || isOpenByKeyboard : isOpen;

  // Submenu title classes
  const titleClasses = useMemo(() => {
    if (!menuContext) return "";
    return classNames(getSubMenuTitleClasses(menuContext.theme, disabled));
  }, [menuContext, disabled]);

  // Submenu content classes
  const contentClasses = !menuContext
    ? ""
    : menuContext.mode === "horizontal"
    ? submenuContentHorizontalClasses
    : submenuContentVerticalClasses;

  // Handle title click
  const handleTitleClick = useCallback(() => {
    if (!disabled && menuContext && menuContext.mode !== "horizontal") {
      menuContext.handleOpenChange(itemKey);
    }
  }, [disabled, menuContext, itemKey]);

  // Handle mouse enter for horizontal mode
  const handleMouseEnter = useCallback(() => {
    if (menuContext?.mode === "horizontal") setIsHovered(true);
  }, [menuContext]);

  // Handle mouse leave for horizontal mode
  const handleMouseLeave = useCallback(() => {
    if (menuContext?.mode === "horizontal") {
      setIsHovered(false);
      setIsOpenByKeyboard(false);
    }
  }, [menuContext]);

  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!menuContext || disabled) return;

      const current = event.currentTarget;
      const rootMenu = current.closest('ul[role="menu"]') as HTMLElement | null;
      const isRoot = rootMenu?.dataset.tigerMenuRoot === "true";
      const isHorizontalRoot = isRoot && menuContext.mode === "horizontal";

      const nextKey = isHorizontalRoot ? "ArrowRight" : "ArrowDown";
      const prevKey = isHorizontalRoot ? "ArrowLeft" : "ArrowUp";

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

      if (event.key === "Home") {
        event.preventDefault();
        focusEdge(current, "start");
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusEdge(current, "end");
        return;
      }

      if (event.key === "Escape" || event.key === "ArrowLeft") {
        if (menuContext.mode === "horizontal") {
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

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (menuContext.mode === "horizontal") {
          setIsOpenByKeyboard(true);
          return;
        }
        menuContext.handleOpenChange(itemKey);
        setTimeout(() => focusFirstChildItemFromTitle(current), 0);
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        if (menuContext.mode === "horizontal") {
          event.preventDefault();
          setIsOpenByKeyboard(true);
          return;
        }

        if (!isOpen) {
          event.preventDefault();
          menuContext.handleOpenChange(itemKey);
          setTimeout(() => focusFirstChildItemFromTitle(current), 0);
        }
      }
    },
    [menuContext, disabled, isOpen, itemKey]
  );

  // Get indent style for nested menus in inline mode
  const indentStyle =
    !menuContext || menuContext.mode === "horizontal" || level === 0
      ? {}
      : getMenuItemIndent(level, menuContext.inlineIndent);

  if (!menuContext) return null;

  // Render icon
  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === "string") {
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

  // Render title
  const renderTitle = () => {
    if (!menuContext.collapsed) {
      return (
        <>
          {renderIcon()}
          <span className="flex-1">{title}</span>
          {menuContext.mode !== "horizontal" && (
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

  // Render content based on mode
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
          child as React.ReactElement<{ level?: number }>,
          {
            level: nextLevel,
          }
        );
      }

      return child;
    });

    if (menuContext.mode === "horizontal") {
      return (
        <ul
          className={contentClasses}
          style={{ display: isExpanded ? "block" : "none" }}
          role="menu"
          aria-hidden={isExpanded ? undefined : "true"}
        >
          {enhancedChildren}
        </ul>
      );
    }

    if (!isExpanded) return null;

    return (
      <ul className={contentClasses} role="menu">
        {enhancedChildren}
      </ul>
    );
  };

  return (
    <li
      className={classNames(
        menuContext.mode === "horizontal" ? "relative" : "",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="none"
    >
      <button
        type="button"
        className={titleClasses}
        style={indentStyle}
        onClick={handleTitleClick}
        onKeyDown={handleTitleKeyDown}
        role="menuitem"
        data-tiger-menuitem="true"
        aria-expanded={isExpanded ? "true" : "false"}
        aria-haspopup="true"
        aria-disabled={disabled ? "true" : undefined}
        disabled={disabled}
        tabIndex={-1}
      >
        {renderTitle()}
      </button>
      {renderContent()}
    </li>
  );
};
