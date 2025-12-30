import { render, RenderOptions } from '@testing-library/vue'
import { Component, h, VNode } from 'vue'

/**
 * Type for slot content that can be string, VNode, or render function
 */
type SlotContent = string | VNode | (() => VNode)

/**
 * Custom render function that wraps @testing-library/vue's render
 * with default options and common providers
 * 
 * @param component - Vue component to render
 * @param options - Render options from @testing-library/vue
 * @returns Render result with utility functions
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
 * 
 * @template T - Type of component props
 * @param component - Vue component to render
 * @param props - Props to pass to the component
 * @param options - Additional render options (excluding props)
 * @returns Render result with utility functions
 * 
 * @example
 * renderWithProps(Button, { variant: 'primary', size: 'md' })
 */
export function renderWithProps<T extends Record<string, unknown>>(
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
 * 
 * @param component - Vue component to render
 * @param slots - Slots to pass to the component (can be string, VNode, or function)
 * @param options - Additional render options (excluding slots)
 * @returns Render result with utility functions
 * 
 * @example
 * renderWithSlots(Button, { default: 'Click me' })
 * renderWithSlots(Card, { header: 'Title', default: 'Content' })
 */
export function renderWithSlots(
  component: Component,
  slots: Record<string, SlotContent>,
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
 * 
 * @param component - Component to wrap
 * @param wrapperComponent - Wrapper component (e.g., Provider, Router)
 * @returns Wrapped component for testing
 * 
 * @example
 * const wrapped = createWrapper(MyComponent, ThemeProvider)
 * render(wrapped)
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
