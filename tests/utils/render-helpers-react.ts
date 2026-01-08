import { render, RenderOptions, RenderResult } from '@testing-library/react';
import React from 'react';

export * from './a11y-helpers';

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
  return render(React.createElement(Component, props), options);
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
  a: React.ReactNode | Omit<T, 'children'>,
  b?: React.ReactNode | Omit<T, 'children'>,
  c?: RenderOptions
): RenderResult {
  const isPropsObject = (value: unknown): value is Record<string, unknown> => {
    if (!value || typeof value !== 'object') return false;
    if (React.isValidElement(value)) return false;
    return true;
  };

  let children: React.ReactNode;
  let props: Omit<T, 'children'> | undefined;
  let options: RenderOptions | undefined;

  // Support both call signatures:
  // - renderWithChildren(Component, children, props?, options?)
  // - renderWithChildren(Component, props, children, options?)
  if (isPropsObject(a) && b !== undefined && !isPropsObject(b)) {
    props = a as Omit<T, 'children'>;
    children = b as React.ReactNode;
    options = c;
  } else {
    children = a as React.ReactNode;
    props = isPropsObject(b) ? (b as Omit<T, 'children'>) : undefined;
    options = isPropsObject(b) ? c : (b as RenderOptions | undefined);
  }

  return render(
    React.createElement(
      Component,
      props as T & { children?: React.ReactNode },
      children
    ),
    options
  );
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
export function createReactWrapper<
  P extends Record<string, unknown> = Record<string, never>
>(
  WrapperComponent: React.ComponentType<P & { children?: React.ReactNode }>,
  wrapperProps?: P
) {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(WrapperComponent, { ...wrapperProps, children } as P & {
      children: React.ReactNode;
    });
}
