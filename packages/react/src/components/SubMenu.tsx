import React, { useCallback, useState, useRef, useEffect } from "react";
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

  // For horizontal mode, track hover state
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLUListElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );

  // Check if this submenu is open
  const isOpen = !!menuContext && isKeyOpen(itemKey, menuContext.openKeys);

  // Determine if submenu should be shown
  const isExpanded = menuContext?.mode === "horizontal" ? isHovered : isOpen;

  // Update content height for smooth animation
  useEffect(() => {
    if (contentRef.current && menuContext?.mode !== "horizontal") {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, menuContext?.mode]);

  // Submenu title classes
  const titleClasses = menuContext
    ? classNames(getSubMenuTitleClasses(menuContext.theme, disabled))
    : "";

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
    if (menuContext?.mode === "horizontal") setIsHovered(false);
  }, [menuContext]);

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
    if (menuContext.mode === "horizontal") {
      return (
        <ul
          className={contentClasses}
          style={{ display: isExpanded ? "block" : "none" }}
          role="menu"
        >
          {children}
        </ul>
      );
    }

    return (
      <ul
        ref={contentRef}
        className={contentClasses}
        style={{
          height:
            contentHeight !== undefined ? `${contentHeight}px` : undefined,
        }}
        role="menu"
      >
        {children}
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
    >
      <div
        className={titleClasses}
        style={indentStyle}
        onClick={handleTitleClick}
        role="button"
        aria-expanded={isExpanded ? "true" : "false"}
        aria-disabled={disabled ? "true" : undefined}
      >
        {renderTitle()}
      </div>
      {renderContent()}
    </li>
  );
};
