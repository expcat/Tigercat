/**
 * Utility function to merge class names conditionally
 * Filters out falsy values and joins the remaining strings
 * 
 * @param classes - Array of class names, can include undefined, null, or false
 * @returns Merged class name string
 * 
 * @example
 * classNames('btn', isActive && 'active', undefined, 'text-white')
 * // Returns: 'btn active text-white'
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
