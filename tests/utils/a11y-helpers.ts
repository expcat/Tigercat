import { axe, type AxeResults } from 'jest-axe'
import { expect } from 'vitest'

type AxeOptions = NonNullable<Parameters<typeof axe>[1]>

/**
 * Configure axe for accessibility testing
 * Note: toHaveNoViolations matcher is extended globally in tests/setup.ts
 */
export { axe }

const DEDICATED_A11Y_SPEC =
  /a11y-aa-regression|a11y-interactive-regression|composite-a11y-roles|a11y-utils/

/**
 * Per-component jest-axe is skipped in the default `pnpm test` run (~20% of
 * suite time). Dedicated a11y specs always scan when executed via
 * `pnpm test:a11y` (they are excluded from the default unit project). Set
 * `TIGER_A11Y=1` to scan every component spec locally (`TIGER_A11Y=1 pnpm test`).
 */
function shouldRunAxe(): boolean {
  if (process.env.TIGER_A11Y === '1') return true
  const testPath = (expect.getState().testPath ?? '').replace(/\\/g, '/')
  return DEDICATED_A11Y_SPEC.test(testPath)
}

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
  if (!shouldRunAxe()) return
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
  if (!shouldRunAxe()) return
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
