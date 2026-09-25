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
 * Uses a soft shadow glow instead of hard ring for a modern feel
 */
export const focusRingClasses =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tiger-surface)]'

/**
 * Focus ring classes for inset elements (dropdown items, menu items)
 * that have their own radius and sit inset from the popup border.
 */
export const focusRingInsetClasses =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40 focus-visible:ring-inset'

/**
 * Active row inside a bordered popup list (Select, TreeSelect, Cascader,
 * AutoComplete, Mentions).
 *
 * The panel is `overflow-hidden` with `--tiger-radius-lg` and a 1px border.
 * These rows are not focused (`aria-activedescendant`); the trigger owns the
 * focus ring. An inset ring on the row is a second box — square, or a smaller
 * radius — and stacks on that border. The first and last rows show it most.
 * This fill is clipped by the panel, so the highlight follows the same corners.
 */
export const popupListOptionActiveClasses = 'bg-[var(--tiger-outline-bg-hover)]'

export function getPopupListOptionActiveClasses(options: {
  active?: boolean
  disabled?: boolean
  selected?: boolean
}): string {
  if (!options.active || options.disabled || options.selected) return ''
  return popupListOptionActiveClasses
}

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
export const interactiveClasses = `[transition:var(--tiger-transition-quick)] ${focusRingClasses} ${activePressClasses}`

/**
 * Interactive classes for form inputs
 * Keeps focus ring visible (not focus-visible) since inputs need persistent focus indication
 */
export const inputFocusClasses =
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-focus-ring)]/40 focus:border-transparent'

/**
 * Tab/navigation item focus classes
 */
export const tabFocusClasses =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)] focus-visible:ring-offset-2'

/**
 * Menu item focus classes (inset ring for contained elements)
 */
export const menuItemFocusClasses =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)] focus-visible:ring-inset'
