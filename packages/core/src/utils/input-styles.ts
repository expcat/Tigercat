/**
 * Input component styling utilities
 */

import type { InputSize } from '../types/input';
import { classNames } from './class-names';

/**
 * Base input classes that apply to all inputs
 */
const BASE_INPUT_CLASSES = [
  'w-full',
  'border',
  'border-[var(--tiger-border,#e5e7eb)]',
  'rounded-md',
  'shadow-sm',
  'bg-[var(--tiger-surface,#ffffff)]',
  'text-[var(--tiger-text,#111827)]',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-[var(--tiger-primary,#2563eb)]',
  'focus:border-transparent',
  'transition-colors',
  'disabled:bg-[var(--tiger-surface-muted,#f3f4f6)]',
  'disabled:text-[var(--tiger-text-muted,#6b7280)]',
  'disabled:cursor-not-allowed',
  'placeholder:text-[var(--tiger-text-muted,#6b7280)]',
] as const;

/**
 * Size-specific classes for inputs
 */
const INPUT_SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
} as const;

/**
 * Get complete input class string based on size
 *
 * @param size - Input size variant
 * @returns Complete class string for the input
 *
 * @example
 * getInputClasses('md')
 * // Returns: 'w-full border border-gray-300 ... px-3 py-2 text-base'
 */
export function getInputClasses(size: InputSize = 'md'): string {
  return classNames(...BASE_INPUT_CLASSES, INPUT_SIZE_CLASSES[size]);
}
