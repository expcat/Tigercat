import { expect } from 'vitest'

/**
 * Type for CSS variable names used in Tigercat theme system
 */
export type ThemeVariableName =
  | '--tiger-primary'
  | '--tiger-primary-hover'
  | '--tiger-primary-disabled'
  | '--tiger-secondary'
  | '--tiger-secondary-hover'
  | '--tiger-secondary-disabled'
  | '--tiger-outline-bg-hover'
  | '--tiger-ghost-bg-hover'

/**
 * Type for theme variable map
 */
export type ThemeVariables = Partial<Record<ThemeVariableName, string>>

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

/**
 * Helper to get computed styles of an element
 * Returns the CSSStyleDeclaration for the element
 *
 * @param element - HTML element to get styles for
 * @returns Computed style declaration
 *
 * @example
 * const styles = getComputedStyles(button)
 * const color = styles.getPropertyValue('color')
 */
export function getComputedStyles(element: HTMLElement): CSSStyleDeclaration {
  return window.getComputedStyle(element)
}

/**
 * Test theme color application on an element
 * Verifies that a CSS variable is applied correctly
 *
 * @param element - HTML element to test
 * @param cssVariable - CSS variable name to check
 * @param expectedColor - Optional expected color value
 * @returns The actual computed value
 *
 * @example
 * expectThemeColor(button, '--tiger-primary', '#10b981')
 */
export function expectThemeColor(
  element: HTMLElement,
  cssVariable: string,
  expectedColor?: string
): string {
  const styles = getComputedStyles(element)
  const computedValue = styles.getPropertyValue(cssVariable).trim()

  if (expectedColor) {
    expect(computedValue).toBe(expectedColor)
  }

  return computedValue
}

/**
 * Get theme variable value from document root
 * Retrieves the current value of a theme CSS variable
 *
 * @param variableName - CSS variable name
 * @returns The current value or empty string if not set
 *
 * @example
 * const primaryColor = getThemeVariable('--tiger-primary')
 */
export function getThemeVariable(variableName: string): string {
  const rootStyles = window.getComputedStyle(document.documentElement)
  return rootStyles.getPropertyValue(variableName).trim()
}

/**
 * Verify that theme variables are properly applied
 * Checks multiple theme variables at once and reports all failures
 *
 * @param expectedVariables - Map of variable names to expected values
 *
 * @example
 * expectThemeVariables({
 *   '--tiger-primary': '#10b981',
 *   '--tiger-primary-hover': '#059669'
 * })
 */
export function expectThemeVariables(expectedVariables: Record<string, string>): void {
  const failures: string[] = []

  Object.entries(expectedVariables).forEach(([variable, expectedValue]) => {
    const actualValue = getThemeVariable(variable)
    if (actualValue !== expectedValue) {
      failures.push(`${variable}: expected "${expectedValue}", got "${actualValue}"`)
    }
  })

  if (failures.length > 0) {
    throw new Error(`Theme variable mismatches:\n${failures.join('\n')}`)
  }
}

/**
 * Common theme test cases for component testing
 * Predefined theme color sets for testing different themes
 */
export const themeTestCases = {
  primary: {
    '--tiger-primary': '#10b981',
    '--tiger-primary-hover': '#059669',
    '--tiger-primary-disabled': '#6ee7b7'
  },
  secondary: {
    '--tiger-secondary': '#6366f1',
    '--tiger-secondary-hover': '#4f46e5',
    '--tiger-secondary-disabled': '#a5b4fc'
  },
  custom: {
    '--tiger-primary': '#ff0000',
    '--tiger-primary-hover': '#cc0000',
    '--tiger-primary-disabled': '#ff9999'
  },
  dark: {
    '--tiger-primary': '#1e293b',
    '--tiger-primary-hover': '#0f172a',
    '--tiger-primary-disabled': '#475569'
  },
  light: {
    '--tiger-primary': '#f8fafc',
    '--tiger-primary-hover': '#f1f5f9',
    '--tiger-primary-disabled': '#cbd5e1'
  }
} as const

/**
 * Default Tigercat theme colors for reference
 */
export const defaultThemeColors = {
  '--tiger-primary': '#2563eb',
  '--tiger-primary-hover': '#1d4ed8',
  '--tiger-primary-disabled': '#93c5fd',
  '--tiger-secondary': '#4b5563',
  '--tiger-secondary-hover': '#374151',
  '--tiger-secondary-disabled': '#9ca3af',
  '--tiger-outline-bg-hover': '#eff6ff',
  '--tiger-ghost-bg-hover': '#eff6ff'
} as const
