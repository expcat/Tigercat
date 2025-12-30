import { render, RenderOptions, RenderResult } from '@testing-library/react'
import React from 'react'

/**
 * Helper to render a React component with props
 * 
 * @template T - Type of component props
 * @param Component - React component to render
 * @param props - Props to pass to the component
 * @param options - Additional render options
 * @returns Render result with utility functions
 * 
 * @example
 * renderWithProps(Button, { variant: 'primary', size: 'md' })
 */
export function renderWithProps<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  props: T,
  options?: Omit<RenderOptions, 'props'>
): RenderResult {
  return render(React.createElement(Component, props), options)
}

/**
 * Helper to render a React component with children
 * 
 * @template T - Type of component props (excluding children)
 * @param Component - React component to render
 * @param children - Children to render inside the component
 * @param props - Additional props (excluding children)
 * @param options - Additional render options
 * @returns Render result with utility functions
 * 
 * @example
 * renderWithChildren(Button, 'Click me', { variant: 'primary' })
 */
export function renderWithChildren<T extends Record<string, unknown>>(
  Component: React.ComponentType<T & { children?: React.ReactNode }>,
  children: React.ReactNode,
  props?: Omit<T, 'children'>,
  options?: RenderOptions
): RenderResult {
  return render(
    React.createElement(Component, props as T & { children?: React.ReactNode }, children),
    options
  )
}

/**
 * Helper to create a wrapper component for testing
 * Useful for testing components that need a parent context (e.g., providers, routers)
 * 
 * @template P - Type of wrapper component props
 * @param WrapperComponent - Component to use as wrapper (e.g., ThemeProvider, Router)
 * @param wrapperProps - Props to pass to the wrapper component
 * @returns Wrapper function compatible with Testing Library's wrapper option
 * 
 * @example
 * const wrapper = createReactWrapper(ThemeProvider, { theme: 'dark' })
 * render(<MyComponent />, { wrapper })
 */
export function createReactWrapper<P extends Record<string, unknown> = Record<string, never>>(
  WrapperComponent: React.ComponentType<P & { children?: React.ReactNode }>,
  wrapperProps?: P
) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(WrapperComponent, { ...wrapperProps, children } as P & { children: React.ReactNode })
}
