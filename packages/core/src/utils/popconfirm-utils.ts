/**
 * Popconfirm utility functions
 */
import { classNames } from './class-names';
import type { PopconfirmIconType } from '../types/popconfirm';
import type { DropdownPlacement } from '../types/dropdown';

/**
 * Get base popconfirm container classes
 */
export function getPopconfirmContainerClasses(): string {
  return classNames(
    'tiger-popconfirm',
    'relative',
    'inline-block',
    'w-fit',
    'justify-self-start'
  );
}

/**
 * Get popconfirm trigger classes
 */
export function getPopconfirmTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-popconfirm-trigger',
    'inline-block',
    disabled && 'cursor-not-allowed opacity-50'
  );
}

/**
 * Get popconfirm content wrapper classes
 */
export function getPopconfirmContentClasses(): string {
  return classNames(
    'tiger-popconfirm-content',
    'relative',
    'z-10',
    'min-w-[280px]',
    'max-w-[320px]',
    'p-4',
    'bg-[var(--tiger-surface,#ffffff)]',
    'rounded-lg',
    'shadow-lg',
    'border',
    'border-[var(--tiger-border,#e5e7eb)]'
  );
}

/**
 * Get popconfirm arrow classes (small pointer to the trigger)
 */
export function getPopconfirmArrowClasses(
  placement: DropdownPlacement
): string {
  const base = classNames(
    'tiger-popconfirm-arrow',
    'absolute',
    'w-3',
    'h-3',
    'rotate-45',
    'bg-[var(--tiger-border,#e5e7eb)]',
    'rounded-[2px]',
    "after:content-['']",
    'after:absolute',
    'after:inset-px',
    'after:bg-[var(--tiger-surface,#ffffff)]',
    'after:rounded-[2px]',
    'pointer-events-none',
    'z-0'
  );

  const placementMap: Record<DropdownPlacement, string> = {
    'top-start': 'bottom-0 left-6 translate-y-1/2',
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    'top-end': 'bottom-0 right-6 translate-y-1/2',

    'bottom-start': 'top-0 left-6 -translate-y-1/2',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bottom-end': 'top-0 right-6 -translate-y-1/2',

    'left-start': 'right-0 top-6 translate-x-1/2',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
    'left-end': 'right-0 bottom-6 translate-x-1/2',

    'right-start': 'left-0 top-6 -translate-x-1/2',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2',
    'right-end': 'left-0 bottom-6 -translate-x-1/2',
  };

  return classNames(base, placementMap[placement] || placementMap.bottom);
}

/**
 * Get popconfirm title classes
 */
export function getPopconfirmTitleClasses(): string {
  return classNames(
    'tiger-popconfirm-title',
    'text-sm',
    'font-medium',
    'text-[var(--tiger-text,#111827)]',
    'mb-2'
  );
}

/**
 * Get popconfirm description classes
 */
export function getPopconfirmDescriptionClasses(): string {
  return classNames(
    'tiger-popconfirm-description',
    'text-xs',
    'text-[var(--tiger-text-muted,#6b7280)]',
    'mb-3'
  );
}

/**
 * Get popconfirm icon color classes based on icon type
 */
export function getPopconfirmIconClasses(iconType: PopconfirmIconType): string {
  const iconColorMap: Record<PopconfirmIconType, string> = {
    warning: 'text-[var(--tiger-warning,#eab308)]',
    info: 'text-[var(--tiger-info,#3b82f6)]',
    error: 'text-[var(--tiger-error,#ef4444)]',
    success: 'text-[var(--tiger-success,#22c55e)]',
    question: 'text-[var(--tiger-text-muted,#6b7280)]',
  };

  return classNames(
    'tiger-popconfirm-icon',
    'flex-shrink-0',
    'w-5',
    'h-5',
    'mr-2',
    iconColorMap[iconType] || iconColorMap.warning
  );
}

/**
 * Get popconfirm buttons container classes
 */
export function getPopconfirmButtonsClasses(): string {
  return classNames(
    'tiger-popconfirm-buttons',
    'flex',
    'items-center',
    'justify-end',
    'gap-2',
    'mt-3'
  );
}

/**
 * Get popconfirm button base classes
 */
export function getPopconfirmButtonBaseClasses(): string {
  return classNames(
    'px-3',
    'py-1.5',
    'text-xs',
    'font-medium',
    'rounded-md',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2'
  );
}

/**
 * Get popconfirm cancel button classes
 */
export function getPopconfirmCancelButtonClasses(): string {
  return classNames(
    getPopconfirmButtonBaseClasses(),
    'bg-[var(--tiger-surface,#ffffff)]',
    'text-[var(--tiger-text,#374151)]',
    'border',
    'border-[var(--tiger-border,#d1d5db)]',
    'hover:bg-[var(--tiger-surface-muted,#f3f4f6)]',
    'focus:ring-[var(--tiger-text-muted,#6b7280)]'
  );
}

/**
 * Get popconfirm confirm button classes
 */
export function getPopconfirmOkButtonClasses(
  okType: 'primary' | 'danger'
): string {
  const typeClasses =
    okType === 'danger'
      ? classNames(
          'bg-[var(--tiger-error,#ef4444)]',
          'text-white',
          'hover:bg-[var(--tiger-error-hover,#dc2626)]',
          'focus:ring-[var(--tiger-error,#ef4444)]'
        )
      : classNames(
          'bg-[var(--tiger-primary,#2563eb)]',
          'text-white',
          'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]',
          'focus:ring-[var(--tiger-primary,#2563eb)]'
        );

  return classNames(getPopconfirmButtonBaseClasses(), typeClasses);
}

/**
 * Popconfirm icon SVG constants
 */
export const popconfirmIconViewBox = '0 0 24 24';
export const popconfirmIconStrokeWidth = 1.5;
export const popconfirmIconPathStrokeLinecap = 'round';
export const popconfirmIconPathStrokeLinejoin = 'round';

export const popconfirmWarningIconPath =
  'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z';

export const popconfirmInfoIconPath =
  'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z';

export const popconfirmErrorIconPath =
  'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

export const popconfirmSuccessIconPath =
  'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z';

export const popconfirmQuestionIconPath =
  'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z';

/**
 * Get popconfirm icon path based on icon type
 */
export function getPopconfirmIconPath(iconType: PopconfirmIconType): string {
  const iconPathMap: Record<PopconfirmIconType, string> = {
    warning: popconfirmWarningIconPath,
    info: popconfirmInfoIconPath,
    error: popconfirmErrorIconPath,
    success: popconfirmSuccessIconPath,
    question: popconfirmQuestionIconPath,
  };

  return iconPathMap[iconType] || iconPathMap.warning;
}
