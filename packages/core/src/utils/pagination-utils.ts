import type { PaginationSize, PaginationAlign } from "../types/pagination";
import { classNames } from "./class-names";

/**
 * Calculate total number of pages
 */
export function getTotalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 0;
  return Math.ceil(total / pageSize);
}

/**
 * Calculate the range of items shown on current page
 */
export function getPageRange(
  current: number,
  pageSize: number,
  total: number
): [number, number] {
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);
  return [start, end];
}

/**
 * Validate and adjust current page number
 */
export function validateCurrentPage(
  current: number,
  totalPages: number
): number {
  if (current < 1) return 1;
  if (current > totalPages && totalPages > 0) return totalPages;
  return current;
}

/**
 * Calculate page numbers to display
 * @param current - Current page number
 * @param totalPages - Total number of pages
 * @param showLessItems - Whether to show less items (affects range size)
 * @returns Array of page numbers and separators ('...')
 */
export function getPageNumbers(
  current: number,
  totalPages: number,
  showLessItems: boolean = false
): (number | string)[] {
  if (totalPages <= 0) return [];

  // Show fewer page numbers in less items mode
  const pageRange = showLessItems ? 1 : 2;
  const pages: (number | string)[] = [];

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const rangeStart = Math.max(2, current - pageRange);
  const rangeEnd = Math.min(totalPages - 1, current + pageRange);

  // Add ellipsis before range if needed
  if (rangeStart > 2) {
    pages.push("...");
  }

  // Add pages in range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis after range if needed
  if (rangeEnd < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page if there's more than one page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Default total text function
 */
export function defaultTotalText(
  total: number,
  _range: [number, number]
): string {
  return `共 ${total} 条`;
}

/**
 * Get container classes for pagination
 */
export function getPaginationContainerClasses(
  align: PaginationAlign = "center",
  className?: string
): string {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return classNames("flex items-center gap-1", alignClasses[align], className);
}

/**
 * Get base button classes for pagination buttons
 */
export function getPaginationButtonBaseClasses(
  size: PaginationSize = "medium"
): string {
  const sizeClasses = {
    small: "min-w-7 h-7 text-sm px-2",
    medium: "min-w-8 h-8 text-base px-2.5",
    large: "min-w-10 h-10 text-lg px-3",
  };

  return classNames(
    "inline-flex items-center justify-center",
    "rounded border border-[var(--tiger-border,#d1d5db)]",
    "bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#374151)]",
    "transition-colors duration-200",
    "hover:border-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary,#2563eb)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-opacity-50",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--tiger-border,#d1d5db)] disabled:hover:text-[var(--tiger-text,#374151)]",
    sizeClasses[size]
  );
}

/**
 * Get active button classes
 */
export function getPaginationButtonActiveClasses(): string {
  return classNames(
    "border-[var(--tiger-primary,#2563eb)]",
    "bg-[var(--tiger-primary,#2563eb)]",
    "text-white",
    "hover:border-[var(--tiger-primary-hover,#1d4ed8)] hover:bg-[var(--tiger-primary-hover,#1d4ed8)] hover:text-white"
  );
}

/**
 * Get ellipsis classes
 */
export function getPaginationEllipsisClasses(
  size: PaginationSize = "medium"
): string {
  const sizeClasses = {
    small: "min-w-7 h-7 text-sm",
    medium: "min-w-8 h-8 text-base",
    large: "min-w-10 h-10 text-lg",
  };

  return classNames(
    "inline-flex items-center justify-center",
    "text-[var(--tiger-text-muted,#6b7280)] cursor-default",
    sizeClasses[size]
  );
}

/**
 * Get quick jumper input classes
 */
export function getQuickJumperInputClasses(
  size: PaginationSize = "medium"
): string {
  const sizeClasses = {
    small: "w-12 h-7 text-sm",
    medium: "w-14 h-8 text-base",
    large: "w-16 h-10 text-lg",
  };

  return classNames(
    "inline-block",
    "px-2 py-1",
    "rounded border border-[var(--tiger-border,#d1d5db)]",
    "text-center",
    "transition-colors duration-200",
    "hover:border-[var(--tiger-primary,#2563eb)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-opacity-50",
    "disabled:cursor-not-allowed disabled:opacity-50",
    sizeClasses[size]
  );
}

/**
 * Get page size selector classes
 */
export function getPageSizeSelectorClasses(
  size: PaginationSize = "medium"
): string {
  const sizeClasses = {
    small: "h-7 text-sm",
    medium: "h-8 text-base",
    large: "h-10 text-lg",
  };

  return classNames(
    "inline-block",
    "px-2 py-1",
    "rounded border border-[var(--tiger-border,#d1d5db)]",
    "bg-[var(--tiger-surface,#ffffff)]",
    "transition-colors duration-200",
    "hover:border-[var(--tiger-primary,#2563eb)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-opacity-50",
    "disabled:cursor-not-allowed disabled:opacity-50",
    sizeClasses[size]
  );
}

/**
 * Get total text classes
 */
export function getTotalTextClasses(size: PaginationSize = "medium"): string {
  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return classNames(
    "text-[var(--tiger-text-muted,#6b7280)]",
    "mr-2",
    sizeClasses[size]
  );
}
