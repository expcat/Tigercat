/**
 * Helper to set CSS variables for theme testing
 */
export function setThemeVariables(variables: Record<string, string>) {
  const root = document.documentElement
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * Helper to clear theme variables
 */
export function clearThemeVariables(variables: string[]) {
  const root = document.documentElement
  variables.forEach((key) => {
    root.style.removeProperty(key)
  })
}

/**
 * Helper to get computed styles of an element
 */
export function getComputedStyles(element: HTMLElement) {
  return window.getComputedStyle(element)
}

/**
 * Test theme color application
 */
export function expectThemeColor(
  element: HTMLElement,
  cssVariable: string,
  expectedColor?: string
) {
  const styles = getComputedStyles(element)
  const computedValue = styles.getPropertyValue(cssVariable).trim()
  
  if (expectedColor) {
    expect(computedValue).toBe(expectedColor)
  }
  
  return computedValue
}

/**
 * Common theme test cases
 */
export const themeTestCases = {
  primary: {
    '--tiger-primary': '#10b981',
    '--tiger-primary-hover': '#059669',
    '--tiger-primary-disabled': '#6ee7b7',
  },
  secondary: {
    '--tiger-secondary': '#6366f1',
    '--tiger-secondary-hover': '#4f46e5',
    '--tiger-secondary-disabled': '#a5b4fc',
  },
  custom: {
    '--tiger-primary': '#ff0000',
    '--tiger-primary-hover': '#cc0000',
    '--tiger-primary-disabled': '#ff9999',
  },
}
