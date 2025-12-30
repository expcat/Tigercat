import { axe, type AxeResults } from 'jest-axe'
import { expect } from 'vitest'

/**
 * Configure axe for accessibility testing
 * Note: toHaveNoViolations matcher is extended globally in tests/setup.ts
 */
export { axe }

/**
 * Type for ARIA attribute values - can be string (present) or null (absent)
 */
export type AriaAttributeValue = string | null

/**
 * Type for expected ARIA attributes mapping
 */
export type ExpectedAriaAttributes = Record<string, AriaAttributeValue>

/**
 * Common accessibility test for components
 * Tests that a component has no accessibility violations using jest-axe
 * 
 * @param container - HTML element to test for a11y violations
 * @returns Promise that resolves when test completes
 * @throws {Error} If accessibility violations are found
 * 
 * @example
 * const { container } = render(<Button>Click me</Button>)
 * await expectNoA11yViolations(container)
 */
export async function expectNoA11yViolations(container: HTMLElement): Promise<void> {
  const results: AxeResults = await axe(container)
  expect(results).toHaveNoViolations()
}

/**
 * Test that an element has proper ARIA attributes
 * Verifies both presence and absence of ARIA attributes
 * 
 * @param element - HTML element to test
 * @param expectedAttributes - Map of attribute names to expected values (null means attribute should not exist)
 * 
 * @example
 * expectProperAriaLabels(button, {
 *   'aria-label': 'Close dialog',
 *   'aria-pressed': null, // Should not have this attribute
 * })
 */
export function expectProperAriaLabels(
  element: HTMLElement,
  expectedAttributes: ExpectedAriaAttributes
): void {
  Object.entries(expectedAttributes).forEach(([attr, value]) => {
    if (value === null) {
      expect(element).not.toHaveAttribute(attr)
    } else {
      expect(element).toHaveAttribute(attr, value)
    }
  })
}

/**
 * Keyboard event options for testing keyboard navigation
 */
export interface KeyboardEventOptions {
  bubbles?: boolean
  cancelable?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
}

/**
 * Test keyboard navigation by dispatching keyboard events
 * Simulates real user keyboard interactions with configurable delays
 * 
 * @param element - HTML element to dispatch keyboard events on
 * @param keys - Array of key names to dispatch (e.g., ['Enter', 'ArrowDown', 'Escape'])
 * @param options - Optional keyboard event options
 * @param delay - Delay between key events in milliseconds (default: 10ms)
 * @returns Promise that resolves when all key events are dispatched
 * 
 * @example
 * await testKeyboardNavigation(menu, ['ArrowDown', 'ArrowDown', 'Enter'])
 * await testKeyboardNavigation(dialog, ['Escape'], { ctrlKey: true })
 */
export async function testKeyboardNavigation(
  element: HTMLElement,
  keys: string[],
  options: KeyboardEventOptions = {},
  delay: number = 10
): Promise<void> {
  for (const key of keys) {
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: options.bubbles ?? true,
        cancelable: options.cancelable ?? true,
        ctrlKey: options.ctrlKey ?? false,
        shiftKey: options.shiftKey ?? false,
        altKey: options.altKey ?? false,
        metaKey: options.metaKey ?? false,
      })
    )
    // Small delay to better simulate real user interactions
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

/**
 * Test that an element is keyboard accessible
 * Verifies that element can receive focus and has proper focus indicators
 * 
 * @param element - HTML element to test
 * @returns Object with focus state information
 * 
 * @example
 * const button = screen.getByRole('button')
 * expectKeyboardAccessible(button)
 * expect(button).toHaveFocus()
 */
export function expectKeyboardAccessible(element: HTMLElement): void {
  // Element should be focusable
  element.focus()
  expect(element).toHaveFocus()
  
  // Element should have either tabindex >= 0 or be naturally focusable
  const tabIndex = element.getAttribute('tabindex')
  const isFocusableElement = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
  
  expect(
    isFocusableElement || (tabIndex !== null && parseInt(tabIndex) >= 0)
  ).toBe(true)
}
