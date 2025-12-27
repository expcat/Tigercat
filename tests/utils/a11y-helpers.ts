import { axe } from 'jest-axe'
import { expect } from 'vitest'

/**
 * Configure axe for accessibility testing
 * Note: toHaveNoViolations matcher is extended globally in tests/setup.ts
 */
export { axe }

/**
 * Common accessibility test for components
 * Tests that a component has no accessibility violations
 */
export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

/**
 * Test that an element has proper ARIA attributes
 */
export function expectProperAriaLabels(
  element: HTMLElement,
  expectedAttributes: Record<string, string | null>
) {
  Object.entries(expectedAttributes).forEach(([attr, value]) => {
    if (value === null) {
      expect(element).not.toHaveAttribute(attr)
    } else {
      expect(element).toHaveAttribute(attr, value)
    }
  })
}

/**
 * Test keyboard navigation
 * Dispatches keyboard events with small delays to simulate real user interactions
 */
export async function testKeyboardNavigation(
  element: HTMLElement,
  keys: string[]
) {
  for (const key of keys) {
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      })
    )
    // Small delay to better simulate real user interactions
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}
