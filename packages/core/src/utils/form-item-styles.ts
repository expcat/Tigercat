import { classNames } from './class-names'
import type { FormLabelAlign, FormLabelPosition, FormSize } from '../types/form'

const FORM_ITEM_SPACING: Record<FormSize, string> = {
  sm: 'mb-3 last:mb-0',
  md: 'mb-4 last:mb-0',
  lg: 'mb-6 last:mb-0'
}

const LABEL_TEXT_SIZE: Record<FormSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
}

const LABEL_PADDING_TOP: Record<FormSize, string> = {
  sm: 'pt-1',
  md: 'pt-2',
  lg: 'pt-3'
}

const ERROR_TEXT_SIZE: Record<FormSize, string> = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm'
}

const ERROR_MIN_HEIGHT: Record<FormSize, string> = {
  sm: 'min-h-[1rem]',
  md: 'min-h-[1.25rem]',
  lg: 'min-h-[1.5rem]'
}

export interface FormItemClassOptions {
  size?: FormSize
  labelPosition?: FormLabelPosition
  hasError?: boolean
  disabled?: boolean
}

export interface FormItemLabelClassOptions {
  size?: FormSize
  labelPosition?: FormLabelPosition
  labelAlign?: FormLabelAlign
  isRequired?: boolean
}

export function getFormItemClasses(options: FormItemClassOptions = {}): string {
  const { size = 'md', labelPosition = 'right', hasError = false, disabled = false } = options

  const layoutClasses = labelPosition === 'top' ? 'flex flex-col gap-2' : 'flex items-start gap-4'

  return classNames(
    'tiger-form-item',
    'w-full',
    `tiger-form-item--${size}`,
    `tiger-form-item--label-${labelPosition}`,
    layoutClasses,
    FORM_ITEM_SPACING[size],
    hasError && 'tiger-form-item--error',
    disabled && 'tiger-form-item--disabled'
  )
}

export function getFormItemLabelClasses(options: FormItemLabelClassOptions = {}): string {
  const { size = 'md', labelPosition = 'right', labelAlign = 'right', isRequired = false } = options

  const alignClass =
    labelAlign === 'right' ? 'text-right' : labelAlign === 'left' ? 'text-left' : 'text-left'

  const positionClasses = labelPosition === 'top' ? 'w-full' : 'shrink-0'
  const paddingClass = labelPosition === 'top' ? '' : LABEL_PADDING_TOP[size]

  return classNames(
    'tiger-form-item__label',
    `tiger-form-item__label--${labelAlign}`,
    'font-medium',
    'text-[var(--tiger-text,#111827)]',
    LABEL_TEXT_SIZE[size],
    alignClass,
    positionClasses,
    paddingClass,
    isRequired && 'tiger-form-item__label--required'
  )
}

export function getFormItemContentClasses(labelPosition: FormLabelPosition = 'right'): string {
  return classNames(
    'tiger-form-item__content',
    labelPosition === 'top' ? 'w-full' : 'flex-1',
    'min-w-0',
    'flex',
    'flex-col'
  )
}

export function getFormItemFieldClasses(): string {
  return classNames('tiger-form-item__field', 'w-full')
}

export function getFormItemErrorClasses(size: FormSize = 'md'): string {
  return classNames(
    'tiger-form-item__error',
    'mt-1',
    ERROR_TEXT_SIZE[size],
    ERROR_MIN_HEIGHT[size],
    'text-[var(--tiger-error,#ef4444)]',
    'transition-opacity',
    'duration-150',
    'opacity-0'
  )
}

export function getFormItemAsteriskClasses(): string {
  return classNames(
    'tiger-form-item__asterisk',
    'mr-1',
    'font-semibold',
    'text-red-500',
    'text-[var(--tiger-error,#ef4444)]'
  )
}

export function getFormItemAsteriskStyle(): Record<string, string> {
  return {
    color: 'var(--tiger-error,#ef4444)'
  }
}
