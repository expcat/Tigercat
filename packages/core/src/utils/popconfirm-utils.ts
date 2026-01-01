/**
 * Popconfirm utility functions
 */
import { classNames } from './class-names'
import type { PopconfirmIconType } from '../types/popconfirm'

/**
 * Get base popconfirm container classes
 */
export function getPopconfirmContainerClasses(): string {
  return classNames(
    'tiger-popconfirm',
    'relative',
    'inline-block'
  )
}

/**
 * Get popconfirm trigger classes
 */
export function getPopconfirmTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-popconfirm-trigger',
    disabled && 'cursor-not-allowed opacity-50'
  )
}

/**
 * Get popconfirm content wrapper classes
 */
export function getPopconfirmContentClasses(): string {
  return classNames(
    'tiger-popconfirm-content',
    'min-w-[280px]',
    'max-w-[320px]',
    'p-4',
    'bg-white',
    'rounded-lg',
    'shadow-lg',
    'border',
    'border-gray-200',
    'dark:bg-gray-800',
    'dark:border-gray-700'
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
    'text-gray-900',
    'dark:text-gray-100',
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
    'text-gray-600',
    'dark:text-gray-400',
    'mb-3'
  )
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
    question: 'text-gray-500',
  }
  
  return classNames(
    'tiger-popconfirm-icon',
    'flex-shrink-0',
    'w-5',
    'h-5',
    'mr-2',
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
    'rounded-md',
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
    'bg-white',
    'text-gray-700',
    'border',
    'border-gray-300',
    'hover:bg-gray-50',
    'focus:ring-gray-500',
    'dark:bg-gray-700',
    'dark:text-gray-200',
    'dark:border-gray-600',
    'dark:hover:bg-gray-600'
  )
}

/**
 * Get popconfirm confirm button classes
 */
export function getPopconfirmOkButtonClasses(okType: 'primary' | 'danger'): string {
  const typeClasses = okType === 'danger'
    ? classNames(
        'bg-red-600',
        'text-white',
        'hover:bg-red-700',
        'focus:ring-red-500'
      )
    : classNames(
        'bg-[var(--tiger-primary,#2563eb)]',
        'text-white',
        'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]',
        'focus:ring-[var(--tiger-primary,#2563eb)]'
      )
  
  return classNames(
    getPopconfirmButtonBaseClasses(),
    typeClasses
  )
}
