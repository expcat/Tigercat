/**
 * Shared chrome for anchored overlay panels (Popover and the same surface
 * language). Values read runtime theme tokens that tokens.css actually emits.
 */
import { classNames } from './class-names'
import { floatingArrowSide } from './floating-arrow'

/** Padding, radius, surface, and elevation for an overlay card. */
export function getOverlayPanelClasses(): string {
  return classNames(
    'tiger-overlay-panel',
    'relative',
    'p-[var(--tiger-spacing-lg)]',
    'bg-[var(--tiger-surface)]',
    'text-[var(--tiger-text)]',
    'rounded-[var(--tiger-radius-lg)]',
    'shadow-[var(--tiger-shadow-lg)]',
    'border',
    'border-[var(--tiger-border)]'
  )
}

/**
 * Borders that form the outer point of a 45°-rotated square.
 * The other two sides stay transparent so the diamond joins the panel
 * instead of drawing a full outline that looks detached.
 */
function overlayArrowBorderClasses(placement: string): string {
  const side = floatingArrowSide(placement)
  if (side === 'bottom') return 'border-t border-s border-b-transparent border-e-transparent'
  if (side === 'left') return 'border-b border-s border-t-transparent border-e-transparent'
  if (side === 'right') return 'border-t border-e border-b-transparent border-s-transparent'
  return 'border-b border-e border-t-transparent border-s-transparent'
}

/** Arrow chrome. Position comes from `getFloatingArrowStyle`. */
export function getOverlayArrowClasses(placement: string): string {
  return classNames(
    'tiger-overlay-arrow',
    'z-10',
    'box-border',
    'rotate-45',
    'pointer-events-none',
    'bg-[var(--tiger-surface)]',
    'border',
    'border-[var(--tiger-border)]',
    overlayArrowBorderClasses(placement)
  )
}
