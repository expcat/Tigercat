/**
 * Input component styling utilities
 */

import type { InputSize } from '../types/input'

/**
 * Base input classes that apply to all inputs
 */
export const baseInputClasses = [
  'w-full',
  'border border-gray-300',
  'rounded-md shadow-sm',
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:border-transparent',
  'transition-colors',
  'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
  'placeholder:text-gray-400',
].join(' ')

/**
 * Size-specific classes for inputs
 */
export const inputSizeClasses: Record<InputSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
}

/**
 * Get complete input class string based on size
 * 
 * @param size - Input size variant
 * @returns Complete class string for the input
 */
export function getInputClasses(size: InputSize = 'md'): string {
  return `${baseInputClasses} ${inputSizeClasses[size]}`
}
