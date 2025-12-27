import { render, RenderOptions } from '@testing-library/vue'
import { Component, h } from 'vue'

/**
 * Custom render function that wraps @testing-library/vue's render
 * with default options and common providers
 */
export function renderComponent(
  component: Component,
  options?: RenderOptions
) {
  return render(component, {
    ...options,
  })
}

/**
 * Helper to render a component with props
 */
export function renderWithProps<T extends Record<string, any>>(
  component: Component,
  props: T,
  options?: Omit<RenderOptions, 'props'>
) {
  return render(component, {
    props,
    ...options,
  })
}

/**
 * Helper to render a component with slots
 */
export function renderWithSlots(
  component: Component,
  slots: Record<string, any>,
  options?: Omit<RenderOptions, 'slots'>
) {
  return render(component, {
    slots,
    ...options,
  })
}

/**
 * Helper to create a wrapper component for testing
 * Useful for testing components that need a parent context
 */
export function createWrapper(
  component: Component,
  wrapperComponent: Component
) {
  return {
    setup() {
      return () => h(wrapperComponent, null, () => h(component))
    },
  }
}
