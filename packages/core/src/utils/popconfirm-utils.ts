/**
 * Popconfirm utility functions
 */
import { classNames } from './class-names'
import type { PopconfirmIconType } from '../types/popconfirm'

/**
 * Get base popconfirm container classes
 */
export function getPopconfirmContainerClasses(): string {
  return classNames('tiger-popconfirm', 'relative', 'inline-block', 'w-fit', 'justify-self-start')
}

/**
 * Get popconfirm trigger classes
 */
export function getPopconfirmTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-popconfirm-trigger',
    'inline-flex items-center bg-transparent p-0 border-0 font-inherit text-inherit',
    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
  )
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
    'bg-[var(--tiger-surface)]',
    'rounded-[var(--tiger-radius-md)]',
    'shadow-lg',
    'border',
    'border-[var(--tiger-border)]'
  )
}

/**
 * Arrow chrome. Position is applied via `getArrowStyles`.
 */
export function getPopconfirmArrowClasses(): string {
  return classNames(
    'tiger-popconfirm-arrow',
    'w-2',
    'h-2',
    'rotate-45',
    'bg-[var(--tiger-surface)]',
    'border border-[var(--tiger-border)]',
    'pointer-events-none'
  )
}

/**
 * Get popconfirm title classes
 */
export function getPopconfirmTitleClasses(): string {
  return classNames(
    'tiger-popconfirm-title',
    'text-sm',
    'font-medium',
    'text-[var(--tiger-text)]',
    'mb-2'
  )
}

/**
 * Get popconfirm description classes
 */
export function getPopconfirmDescriptionClasses(): string {
  return classNames(
    'tiger-popconfirm-description',
    'text-xs',
    'text-[var(--tiger-text-secondary)]',
    'mb-3'
  )
}

/**
 * Get popconfirm icon color classes based on icon type
 */
export function getPopconfirmIconClasses(iconType: PopconfirmIconType): string {
  const iconColorMap: Record<PopconfirmIconType, string> = {
    warning: 'text-[var(--tiger-warning)]',
    info: 'text-[var(--tiger-info)]',
    error: 'text-[var(--tiger-error)]',
    success: 'text-[var(--tiger-success)]',
    question: 'text-[var(--tiger-text-secondary)]'
  }

  return classNames(
    'tiger-popconfirm-icon',
    'flex-shrink-0',
    'w-5',
    'h-5',
    'me-2',
    iconColorMap[iconType] || iconColorMap.warning
  )
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
  )
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
    'rounded-[var(--tiger-radius-md)]',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2'
  )
}

/**
 * Get popconfirm cancel button classes
 */
export function getPopconfirmCancelButtonClasses(): string {
  return classNames(
    getPopconfirmButtonBaseClasses(),
    'bg-[var(--tiger-surface)]',
    'text-[var(--tiger-text)]',
    'border',
    'border-[var(--tiger-border)]',
    'hover:bg-[var(--tiger-surface-muted)]',
    'focus:ring-[var(--tiger-text-secondary)]'
  )
}

/**
 * Get popconfirm confirm button classes
 */
export function getPopconfirmOkButtonClasses(okType: 'primary' | 'danger'): string {
  const typeClasses =
    okType === 'danger'
      ? classNames(
          'bg-[var(--tiger-error)]',
          'text-white',
          'hover:bg-[var(--tiger-error-hover)]',
          'focus:ring-[var(--tiger-error)]'
        )
      : classNames(
          'bg-[var(--tiger-primary)]',
          'text-white',
          'hover:bg-[var(--tiger-primary-hover)]',
          'focus:ring-[var(--tiger-primary)]'
        )

  return classNames(getPopconfirmButtonBaseClasses(), typeClasses)
}

/**
 * Popconfirm icon SVG constants
 */
export const popconfirmIconViewBox = '0 0 24 24'
export const popconfirmIconStrokeWidth = 1.5
export const popconfirmIconPathStrokeLinecap = 'round'
export const popconfirmIconPathStrokeLinejoin = 'round'

export const popconfirmWarningIconPath =
  'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'

export const popconfirmInfoIconPath =
  'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'

export const popconfirmErrorIconPath =
  'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z'

export const popconfirmSuccessIconPath =
  'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'

export const popconfirmQuestionIconPath =
  'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z'

/**
 * Get popconfirm icon path based on icon type
 */
export function getPopconfirmIconPath(iconType: PopconfirmIconType): string {
  const iconPathMap: Record<PopconfirmIconType, string> = {
    warning: popconfirmWarningIconPath,
    info: popconfirmInfoIconPath,
    error: popconfirmErrorIconPath,
    success: popconfirmSuccessIconPath,
    question: popconfirmQuestionIconPath
  }

  return iconPathMap[iconType] || iconPathMap.warning
}
