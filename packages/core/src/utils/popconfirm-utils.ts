/**
 * Popconfirm utility functions
 */
import { classNames } from "./class-names";
import type { PopconfirmIconType } from "../types/popconfirm";
import type { DropdownPlacement } from "../types/dropdown";

/**
 * Get base popconfirm container classes
 */
export function getPopconfirmContainerClasses(): string {
  return classNames(
    "tiger-popconfirm",
    "relative",
    "inline-block",
    "w-fit",
    "justify-self-start"
  );
}

/**
 * Get popconfirm trigger classes
 */
export function getPopconfirmTriggerClasses(disabled: boolean): string {
  return classNames(
    "tiger-popconfirm-trigger",
    "inline-block",
    disabled && "cursor-not-allowed opacity-50"
  );
}

/**
 * Get popconfirm content wrapper classes
 */
export function getPopconfirmContentClasses(): string {
  return classNames(
    "tiger-popconfirm-content",
    "relative",
    "z-10",
    "min-w-[280px]",
    "max-w-[320px]",
    "p-4",
    "bg-[var(--tiger-surface,#ffffff)]",
    "rounded-lg",
    "shadow-lg",
    "border",
    "border-[var(--tiger-border,#e5e7eb)]"
  );
}

/**
 * Get popconfirm arrow classes (small pointer to the trigger)
 */
export function getPopconfirmArrowClasses(
  placement: DropdownPlacement
): string {
  const base = classNames(
    "tiger-popconfirm-arrow",
    "absolute",
    "w-3",
    "h-3",
    "rotate-45",
    "bg-[var(--tiger-border,#e5e7eb)]",
    "rounded-[2px]",
    "after:content-['']",
    "after:absolute",
    "after:inset-px",
    "after:bg-[var(--tiger-surface,#ffffff)]",
    "after:rounded-[2px]",
    "pointer-events-none",
    "z-0"
  );

  const placementMap: Record<DropdownPlacement, string> = {
    "top-start": "bottom-0 left-6 translate-y-1/2",
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    "top-end": "bottom-0 right-6 translate-y-1/2",

    "bottom-start": "top-0 left-6 -translate-y-1/2",
    bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "bottom-end": "top-0 right-6 -translate-y-1/2",

    "left-start": "right-0 top-6 translate-x-1/2",
    left: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
    "left-end": "right-0 bottom-6 translate-x-1/2",

    "right-start": "left-0 top-6 -translate-x-1/2",
    right: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
    "right-end": "left-0 bottom-6 -translate-x-1/2",
  };

  return classNames(base, placementMap[placement] || placementMap.bottom);
}

/**
 * Get popconfirm title classes
 */
export function getPopconfirmTitleClasses(): string {
  return classNames(
    "tiger-popconfirm-title",
    "text-sm",
    "font-medium",
    "text-[var(--tiger-text,#111827)]",
    "mb-2"
  );
}

/**
 * Get popconfirm description classes
 */
export function getPopconfirmDescriptionClasses(): string {
  return classNames(
    "tiger-popconfirm-description",
    "text-xs",
    "text-[var(--tiger-text-muted,#6b7280)]",
    "mb-3"
  );
}

/**
 * Get popconfirm icon color classes based on icon type
 */
export function getPopconfirmIconClasses(iconType: PopconfirmIconType): string {
  const iconColorMap: Record<PopconfirmIconType, string> = {
    warning: "text-[var(--tiger-warning,#eab308)]",
    info: "text-[var(--tiger-info,#3b82f6)]",
    error: "text-[var(--tiger-error,#ef4444)]",
    success: "text-[var(--tiger-success,#22c55e)]",
    question: "text-[var(--tiger-text-muted,#6b7280)]",
  };

  return classNames(
    "tiger-popconfirm-icon",
    "flex-shrink-0",
    "w-5",
    "h-5",
    "mr-2",
    iconColorMap[iconType] || iconColorMap.warning
  );
}

/**
 * Get popconfirm buttons container classes
 */
export function getPopconfirmButtonsClasses(): string {
  return classNames(
    "tiger-popconfirm-buttons",
    "flex",
    "items-center",
    "justify-end",
    "gap-2",
    "mt-3"
  );
}

/**
 * Get popconfirm button base classes
 */
export function getPopconfirmButtonBaseClasses(): string {
  return classNames(
    "px-3",
    "py-1.5",
    "text-xs",
    "font-medium",
    "rounded-md",
    "transition-colors",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2"
  );
}

/**
 * Get popconfirm cancel button classes
 */
export function getPopconfirmCancelButtonClasses(): string {
  return classNames(
    getPopconfirmButtonBaseClasses(),
    "bg-[var(--tiger-surface,#ffffff)]",
    "text-[var(--tiger-text,#374151)]",
    "border",
    "border-[var(--tiger-border,#d1d5db)]",
    "hover:bg-[var(--tiger-surface-muted,#f3f4f6)]",
    "focus:ring-[var(--tiger-text-muted,#6b7280)]"
  );
}

/**
 * Get popconfirm confirm button classes
 */
export function getPopconfirmOkButtonClasses(
  okType: "primary" | "danger"
): string {
  const typeClasses =
    okType === "danger"
      ? classNames(
          "bg-[var(--tiger-error,#ef4444)]",
          "text-white",
          "hover:bg-[var(--tiger-error-hover,#dc2626)]",
          "focus:ring-[var(--tiger-error,#ef4444)]"
        )
      : classNames(
          "bg-[var(--tiger-primary,#2563eb)]",
          "text-white",
          "hover:bg-[var(--tiger-primary-hover,#1d4ed8)]",
          "focus:ring-[var(--tiger-primary,#2563eb)]"
        );

  return classNames(getPopconfirmButtonBaseClasses(), typeClasses);
}
