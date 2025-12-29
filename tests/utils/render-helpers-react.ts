import { render, RenderOptions, RenderResult } from '@testing-library/react'
import React from 'react'

/**
 * Helper to render a React component with props
 * 
 * @example
 * renderWithProps(Button, { variant: 'primary', size: 'md' })
 */
export function renderWithProps<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  props: T,
  options?: Omit<RenderOptions, 'props'>
): RenderResult {
  return render(React.createElement(Component, props), options)
}

/**
 * Helper to render a React component with children
 * 
 * @example
 * renderWithChildren(Button, 'Click me', { variant: 'primary' })
 */
export function renderWithChildren<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  children: React.ReactNode,
  props?: Omit<T, 'children'>,
  options?: RenderOptions
): RenderResult {
  return render(
    React.createElement(Component, props as T, children),
    options
  )
}

/**
 * Helper to create a wrapper component for testing
 * Useful for testing components that need a parent context
 * 
 * @example
 * const wrapper = createReactWrapper(ThemeProvider)
 */
export function createReactWrapper(
  WrapperComponent: React.ComponentType<any>
) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(WrapperComponent, {}, children)
}
