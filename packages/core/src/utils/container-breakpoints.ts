/**
 * Container queries that reuse the token breakpoint names (xs…2xl).
 * Viewport media queries stay in the layout grid. This sheet is `@container`.
 */

import { TIGER_BREAKPOINT_CSS_VALUES } from '../theme-runtime'

export const CONTAINER_BREAKPOINT_NAMES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const

export type ContainerBreakpointName = (typeof CONTAINER_BREAKPOINT_NAMES)[number]

const WIDTH: Record<ContainerBreakpointName, string> = {
  xs: TIGER_BREAKPOINT_CSS_VALUES.breakpointXs,
  sm: TIGER_BREAKPOINT_CSS_VALUES.breakpointSm,
  md: TIGER_BREAKPOINT_CSS_VALUES.breakpointMd,
  lg: TIGER_BREAKPOINT_CSS_VALUES.breakpointLg,
  xl: TIGER_BREAKPOINT_CSS_VALUES.breakpointXl,
  '2xl': TIGER_BREAKPOINT_CSS_VALUES.breakpoint2xl
}

/** Class that makes an element a container. Grid and layout can import it. */
export const tigerContainer = 'tiger-container'

export function containerBreakpointCss(): string {
  const queries = CONTAINER_BREAKPOINT_NAMES.map((name) => {
    const width = WIDTH[name]
    return `@container (min-width: ${width}) {\n  .tiger-container-${name} { --tiger-container-bp: ${name}; }\n}`
  })
  return [`.${tigerContainer} { container-type: inline-size; }`, ...queries].join('\n')
}
