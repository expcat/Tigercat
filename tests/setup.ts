import '@testing-library/jest-dom/vitest'
import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup as cleanupVue } from '@testing-library/vue'
import { cleanup as cleanupReact } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { toHaveNoViolations } from 'jest-axe'

// Extend Vitest's expect method with jest-dom matchers and axe matchers
expect.extend(matchers)
expect.extend(toHaveNoViolations)

// Cleanup after each test case (both Vue and React)
afterEach(() => {
  cleanupVue()
  cleanupReact()
})

// Mock matchMedia for components that use responsive features
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: (): boolean => false,
  }),
})

// Setup global console error/warning handlers for debugging
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Filter out expected errors during tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('Error: Could not parse CSS stylesheet'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args: any[]) => {
    // Filter out expected warnings during tests
    if (typeof args[0] === 'string' && args[0].includes('[@vue/test-utils]')) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
