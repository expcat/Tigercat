/**
 * Tooltip utility functions
 */
import { classNames } from "./class-names";

/**
 * Get base tooltip container classes
 */
export function getTooltipContainerClasses(): string {
  return classNames("tiger-tooltip", "relative", "inline-block");
}

/**
 * Get tooltip trigger classes
 */
export function getTooltipTriggerClasses(disabled: boolean): string {
  return classNames(
    "tiger-tooltip-trigger",
    disabled && "cursor-not-allowed opacity-50"
  );
}

/**
 * Get tooltip content classes
 * Tooltips are simpler and smaller than popovers
 */
export function getTooltipContentClasses(): string {
  return classNames(
    "tiger-tooltip-content",
    "max-w-[300px]",
    "px-2",
    "py-1",
    "text-xs",
    "text-[var(--tiger-tooltip-text,#ffffff)]",
    "bg-[var(--tiger-tooltip-bg,#111827)]",
    "rounded",
    "shadow-md",
    "whitespace-nowrap"
  );
}
