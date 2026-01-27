/**
 * Unified interaction style utilities
 *
 * Provides consistent focus, active, and hover feedback classes
 * for all interactive components (buttons, inputs, links, etc.)
 *
 * @module interaction-styles
 * @since 0.2.0
 */

/**
 * Focus ring classes using focus-visible (only shows on keyboard navigation)
 * Better UX: mouse clicks don't show distracting focus rings
 */
export const focusRingClasses =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tiger-surface,#ffffff)]'

/**
 * Focus ring classes for inset elements (dropdown items, menu items)
 */
export const focusRingInsetClasses =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-inset'

/**
 * Active press effect - subtle scale down on click
 * Creates a natural "button press" feeling
 */
export const activePressClasses = 'active:scale-[0.98] active:transition-transform'

/**
 * Active opacity effect - subtle opacity reduction on click
 * Alternative to scale for elements where scale looks awkward
 */
export const activeOpacityClasses = 'active:opacity-90'

/**
 * Combined interactive classes for buttons and clickable elements
 * Includes focus-visible ring + press scale effect + smooth transition
 */
export const interactiveClasses = `transition-all duration-150 ${focusRingClasses} ${activePressClasses}`

/**
 * Interactive classes for form inputs
 * Keeps focus ring visible (not focus-visible) since inputs need persistent focus indication
 */
export const inputFocusClasses =
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus:border-transparent'

/**
 * Tab/navigation item focus classes
 */
export const tabFocusClasses =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-offset-2'

/**
 * Menu item focus classes (inset ring for contained elements)
 */
export const menuItemFocusClasses =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-inset'
