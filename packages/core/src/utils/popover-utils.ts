/**
 * Popover utility functions
 */
import { classNames } from "./class-names";

/**
 * Get base popover container classes
 */
export function getPopoverContainerClasses(): string {
  return classNames("tiger-popover", "relative", "inline-block");
}

/**
 * Get popover trigger classes
 */
export function getPopoverTriggerClasses(disabled: boolean): string {
  return classNames(
    "tiger-popover-trigger",
    disabled && "cursor-not-allowed opacity-50"
  );
}

/**
 * Get popover content wrapper classes
 */
export function getPopoverContentClasses(width?: string | number): string {
  let widthClass = "min-w-[200px]";

  if (width) {
    if (typeof width === "number") {
      widthClass = `w-[${width}px]`;
    } else if (width.match(/^\d+$/)) {
      widthClass = `w-[${width}px]`;
    } else {
      widthClass = width;
    }
  }

  return classNames(
    "tiger-popover-content",
    widthClass,
    "max-w-[400px]",
    "p-3",
    "bg-[var(--tiger-surface,#ffffff)]",
    "rounded-lg",
    "shadow-lg",
    "border",
    "border-[var(--tiger-border,#e5e7eb)]"
  );
}

/**
 * Get popover title classes
 */
export function getPopoverTitleClasses(): string {
  return classNames(
    "tiger-popover-title",
    "text-sm",
    "font-semibold",
    "text-[var(--tiger-text,#111827)]",
    "mb-2",
    "border-b",
    "border-[var(--tiger-border,#e5e7eb)]",
    "pb-2"
  );
}

/**
 * Get popover content text classes
 */
export function getPopoverContentTextClasses(): string {
  return classNames(
    "tiger-popover-text",
    "text-sm",
    "text-[var(--tiger-text-muted,#374151)]"
  );
}
