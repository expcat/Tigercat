import { axe, type AxeResults } from 'jest-axe'
import { expect } from 'vitest'

type AxeOptions = NonNullable<Parameters<typeof axe>[1]>

/**
 * Configure axe for accessibility testing
 * Note: toHaveNoViolations matcher is extended globally in tests/setup.ts
 */
export { axe }

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
 * Accessibility test for components rendered in isolation (without form/label context).
 * Disables rules that require parent context (label, aria-required-children) which
 * are not applicable when testing a component standalone.
 *
 * @param container - HTML element to test
 */
export async function expectNoA11yViolationsIsolated(
  container: HTMLElement,
  options: AxeOptions = {}
): Promise<void> {
  const results: AxeResults = await axe(container, {
    ...options,
    rules: {
      label: { enabled: false },
      'button-name': { enabled: false },
      'aria-required-children': { enabled: false },
      'aria-prohibited-attr': { enabled: false },
      'aria-input-field-name': { enabled: false },
      ...options.rules
    }
  })
  expect(results).toHaveNoViolations()
}
