import { render, RenderOptions } from '@testing-library/vue'
import { Component, VNode } from 'vue'

/**
 * Type for slot content that can be string, VNode, or render function
 */
type SlotContent = string | VNode | (() => VNode)

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
    ...options
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
  const maybeOptions = options ?? {}

  // Many tests historically passed component props as the 3rd argument.
  // Detect that pattern and map it into { props } so props aren't silently dropped.
  const renderOptionKeys = new Set([
    'props',
    'attrs',
    'global',
    'container',
    'baseElement',
    'attachTo',
    'queries',
    'wrapper'
  ])

  const hasRenderOptionKey = Object.keys(maybeOptions).some((key) => renderOptionKeys.has(key))

  if (hasRenderOptionKey) {
    return render(component, {
      slots,
      ...maybeOptions
    })
  }

  return render(component, {
    slots,
    props: maybeOptions
  })
}
