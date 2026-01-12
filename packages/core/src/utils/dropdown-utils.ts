import { classNames } from "./class-names";
import type { DropdownPlacement } from "../types/dropdown";

/**
 * Get base dropdown container classes
 */
export function getDropdownContainerClasses(): string {
  return classNames("tiger-dropdown", "relative", "inline-block");
}

/**
 * Get dropdown trigger classes
 */
export function getDropdownTriggerClasses(disabled: boolean): string {
  return classNames(
    "tiger-dropdown-trigger",
    "cursor-pointer",
    disabled && "cursor-not-allowed opacity-50"
  );
}

/**
 * Get dropdown menu wrapper classes
 */
export function getDropdownMenuWrapperClasses(
  visible: boolean,
  placement: DropdownPlacement
): string {
  const positionClasses = getPlacementClasses(placement);

  return classNames(
    "tiger-dropdown-menu-wrapper",
    "absolute",
    "z-50",
    positionClasses,
    visible ? "block" : "hidden"
  );
}

/**
 * Get dropdown menu classes
 */
export function getDropdownMenuClasses(): string {
  return classNames(
    "tiger-dropdown-menu",
    "min-w-[160px]",
    "py-1",
    "rounded-md",
    "shadow-lg",
    "border border-[var(--tiger-border,#e5e7eb)]",
    "bg-[var(--tiger-surface,#ffffff)]"
  );
}

/**
 * Get dropdown item classes
 */
export function getDropdownItemClasses(
  disabled: boolean,
  divided: boolean
): string {
  return classNames(
    "tiger-dropdown-item",
    "flex",
    "items-center",
    "gap-2",
    "px-4",
    "py-2",
    "text-sm",
    "text-[var(--tiger-text,#374151)]",
    "transition-colors",
    "duration-150",
    "w-full",
    "text-left",
    "focus:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-opacity-50",
    divided && "border-t border-[var(--tiger-border,#e5e7eb)]",
    disabled
      ? "cursor-not-allowed opacity-50"
      : classNames(
          "cursor-pointer",
          "hover:bg-[var(--tiger-surface-muted,#f3f4f6)]",
          "active:bg-[var(--tiger-surface-muted,#e5e7eb)]"
        )
  );
}

/**
 * Get placement-specific positioning classes
 */
function getPlacementClasses(placement: DropdownPlacement): string {
  const placementMap: Record<DropdownPlacement, string> = {
    "bottom-start": "top-full left-0 mt-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    "bottom-end": "top-full right-0 mt-2",
    "top-start": "bottom-full left-0 mb-2",
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    "top-end": "bottom-full right-0 mb-2",
    "left-start": "right-full top-0 mr-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    "left-end": "right-full bottom-0 mr-2",
    "right-start": "left-full top-0 ml-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    "right-end": "left-full bottom-0 ml-2",
  };

  return placementMap[placement] || placementMap["bottom-start"];
}
