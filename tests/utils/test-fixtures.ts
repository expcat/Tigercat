import { nextTick } from 'vue'

/**
 * Common test data and fixtures for Vue component tests
 */

import { vi } from 'vitest'

/**
 * Common button variants for testing
 */
export const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'link'] as const

/**
 * Common sizes for components
 */
export const componentSizes = ['sm', 'md', 'lg'] as const

/**
 * Common input types
 */
export const inputTypes = ['text', 'number', 'email', 'password', 'tel', 'url'] as const

/**
 * Mock event handlers
 */
export const createMockHandlers = () => ({
  onClick: vi.fn(),
  onChange: vi.fn(),
  onInput: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
  onSubmit: vi.fn(),
})

/**
 * Wait for next tick helper using Vue's nextTick
 */
export const waitForNextTick = () => nextTick()

/**
 * Wait for condition helper
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  const startTime = Date.now()
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
}

/**
 * Common test labels and text content
 */
export const testLabels = {
  button: 'Test Button',
  input: 'Test Input',
  placeholder: 'Enter text here',
  label: 'Form Label',
  helperText: 'Helper text',
  errorText: 'Error message',
}

/**
 * Common CSS classes to check
 */
export const commonClasses = {
  disabled: 'cursor-not-allowed',
  focus: 'focus:outline-none',
  hover: 'hover:',
  transition: 'transition',
}
