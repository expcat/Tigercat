/**
 * Menu component utilities
 * Shared styles and helpers for Menu components
 */

import type { MenuMode, MenuTheme } from "../types/menu";

/**
 * Base menu container classes
 */
export const menuBaseClasses = "flex bg-white border-gray-200";

/**
 * Menu mode classes
 */
export const menuModeClasses = {
  horizontal: "flex-row border-b",
  vertical: "flex-col border-r min-w-[200px]",
  inline: "flex-col min-w-[200px]",
};

/**
 * Menu theme classes - light theme
 */
export const menuLightThemeClasses = "bg-white text-gray-800";

/**
 * Menu theme classes - dark theme
 */
export const menuDarkThemeClasses = "bg-gray-800 text-white";

/**
 * Menu item base classes
 */
export const menuItemBaseClasses =
  "flex w-full items-center px-4 py-2 text-left bg-transparent border-0 cursor-pointer transition-colors duration-200 select-none appearance-none";

/**
 * Menu item hover classes - light theme
 */
export const menuItemHoverLightClasses = "hover:bg-gray-100";

/**
 * Menu item hover classes - dark theme
 */
export const menuItemHoverDarkClasses = "hover:bg-gray-700";

/**
 * Menu item selected classes - light theme
 */
export const menuItemSelectedLightClasses =
  "bg-[var(--tiger-primary,#2563eb)] bg-opacity-10 text-[var(--tiger-primary,#2563eb)] font-medium";

/**
 * Menu item selected classes - dark theme
 */
export const menuItemSelectedDarkClasses =
  "bg-[var(--tiger-primary,#2563eb)] text-white font-medium";

/**
 * Menu item disabled classes
 */
export const menuItemDisabledClasses =
  "opacity-50 cursor-not-allowed pointer-events-none";

/**
 * Menu item icon classes
 */
export const menuItemIconClasses = "mr-2 flex-shrink-0";

/**
 * Submenu title classes
 */
export const submenuTitleClasses =
  "flex w-full items-center justify-between px-4 py-2 text-left bg-transparent border-0 cursor-pointer transition-colors duration-200 select-none appearance-none";

/**
 * Submenu expand icon classes
 */
export const submenuExpandIconClasses =
  "ml-2 transition-transform duration-200";

/**
 * Submenu expand icon expanded classes
 */
export const submenuExpandIconExpandedClasses = "transform rotate-180";

/**
 * Submenu content classes - horizontal mode
 */
export const submenuContentHorizontalClasses =
  "absolute left-0 top-full mt-0 min-w-[160px] bg-white border border-gray-200 rounded shadow-lg z-50";

/**
 * Submenu content classes - vertical/inline mode
 */
export const submenuContentVerticalClasses =
  "overflow-hidden transition-all duration-200";

/**
 * Menu item group title classes
 */
export const menuItemGroupTitleClasses =
  "px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider";

/**
 * Menu collapsed classes
 */
export const menuCollapsedClasses = "min-w-[64px]";

/**
 * Menu collapsed item classes
 */
export const menuCollapsedItemClasses = "justify-center px-2";

/**
 * Get menu classes based on mode and theme
 */
export function getMenuClasses(
  mode: MenuMode,
  theme: MenuTheme,
  collapsed?: boolean
): string {
  const classes = [menuBaseClasses, menuModeClasses[mode]];

  if (theme === "dark") {
    classes.push(menuDarkThemeClasses);
  } else {
    classes.push(menuLightThemeClasses);
  }

  if (collapsed && mode === "vertical") {
    classes.push(menuCollapsedClasses);
  }

  return classes.filter(Boolean).join(" ");
}

/**
 * Get menu item classes based on state and theme
 */
export function getMenuItemClasses(
  selected: boolean,
  disabled: boolean,
  theme: MenuTheme,
  collapsed?: boolean
): string {
  const classes = [menuItemBaseClasses];

  if (collapsed) {
    classes.push(menuCollapsedItemClasses);
  }

  if (disabled) {
    classes.push(menuItemDisabledClasses);
  } else {
    if (selected) {
      classes.push(
        theme === "dark"
          ? menuItemSelectedDarkClasses
          : menuItemSelectedLightClasses
      );
    } else {
      classes.push(
        theme === "dark" ? menuItemHoverDarkClasses : menuItemHoverLightClasses
      );
    }
  }

  return classes.filter(Boolean).join(" ");
}

/**
 * Get submenu title classes based on theme
 */
export function getSubMenuTitleClasses(
  theme: MenuTheme,
  disabled?: boolean
): string {
  const classes = [submenuTitleClasses];

  if (disabled) {
    classes.push(menuItemDisabledClasses);
  } else {
    classes.push(
      theme === "dark" ? menuItemHoverDarkClasses : menuItemHoverLightClasses
    );
  }

  return classes.filter(Boolean).join(" ");
}

/**
 * Get submenu expand icon classes
 */
export function getSubMenuExpandIconClasses(expanded: boolean): string {
  const classes = [submenuExpandIconClasses];

  if (expanded) {
    classes.push(submenuExpandIconExpandedClasses);
  }

  return classes.filter(Boolean).join(" ");
}

/**
 * Get indent style for nested menu items
 */
export function getMenuItemIndent(
  level: number,
  inlineIndent: number = 24
): Record<string, string> {
  return {
    paddingLeft: `${level * inlineIndent}px`,
  };
}

/**
 * Check if a key is in the selected keys array
 */
export function isKeySelected(
  key: string | number,
  selectedKeys: (string | number)[]
): boolean {
  return selectedKeys.includes(key);
}

/**
 * Check if a key is in the open keys array
 */
export function isKeyOpen(
  key: string | number,
  openKeys: (string | number)[]
): boolean {
  return openKeys.includes(key);
}

/**
 * Toggle a key in an array
 */
export function toggleKey(
  key: string | number,
  keys: (string | number)[]
): (string | number)[] {
  const index = keys.indexOf(key);
  if (index > -1) {
    return keys.filter((k) => k !== key);
  }
  return [...keys, key];
}

/**
 * Replace keys array with single key (for single selection mode)
 */
export function replaceKeys(
  key: string | number,
  keys: (string | number)[]
): (string | number)[] {
  if (keys.includes(key)) {
    return keys;
  }
  return [key];
}
