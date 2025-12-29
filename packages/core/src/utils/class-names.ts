/**
 * Type for class name values that can be conditionally applied
 */
export type ClassValue = string | number | undefined | null | false | 0

/**
 * Utility function to merge class names conditionally
 * Filters out falsy values (null, undefined, false, empty string) and joins the remaining strings
 * Note: The number 0 is intentionally excluded as it's not a valid CSS class
 * 
 * @param classes - Array of class names, can include undefined, null, false, empty strings, or numbers
 * @returns Merged class name string
 * 
 * @example
 * classNames('btn', isActive && 'active', undefined, 'text-white')
 * // Returns: 'btn active text-white'
 * 
 * @example
 * classNames('text-lg', false, '', 'font-bold', 0)
 * // Returns: 'text-lg font-bold'
 */
export function classNames(...classes: ClassValue[]): string {
  // Single-pass filter and build for better performance
  // Filters out: null, undefined, false, empty string, and 0
  let result = ''
  for (const cls of classes) {
    if (cls && cls !== '') {
      result += (result ? ' ' : '') + String(cls)
    }
  }
  return result
}
