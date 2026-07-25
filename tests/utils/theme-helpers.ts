/**
 * Helper to set CSS variables for theme testing
 * Sets custom theme colors on the document root element
 *
 * @param variables - Map of CSS variable names to values
 *
 * @example
 * setThemeVariables({
 *   '--tiger-primary': '#10b981',
 *   '--tiger-primary-hover': '#059669'
 * })
 */
export function setThemeVariables(variables: Record<string, string>): void {
  const root = document.documentElement
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * Helper to clear theme variables
 * Removes custom theme colors from the document root element
 *
 * @param variables - Array of CSS variable names to remove
 *
 * @example
 * clearThemeVariables(['--tiger-primary', '--tiger-primary-hover'])
 */
export function clearThemeVariables(variables: string[]): void {
  const root = document.documentElement
  variables.forEach((key) => {
    root.style.removeProperty(key)
  })
}
