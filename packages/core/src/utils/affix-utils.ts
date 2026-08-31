/**
 * Affix component utilities
 * Shared logic for Affix components (Vue + React)
 */

import { isBrowser } from './env'

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export const affixWrapperClasses = 'relative'

// ---------------------------------------------------------------------------
// Affix state calculation
// ---------------------------------------------------------------------------

export interface AffixState {
  /** Whether the element should be fixed */
  affixed: boolean
  /** The fixed CSS position styles to apply */
  style: Record<string, string | number>
}

/**
 * Calculate whether an element should be affixed based on scroll position.
 *
 * @param elementRect - The original bounding rect of the element (before affixing)
 * @param containerRect - The bounding rect of the scroll container (or viewport)
 * @param offsetTop - Offset from the target container top (undefined if using bottom)
 * @param offsetBottom - Offset from the target container bottom (viewport when target is window)
 * @param zIndex - z-index for the fixed element
 * @param viewportHeight - Viewport height in px; defaults to `window.innerHeight` (or `containerRect.bottom` when not in a browser)
 */
export function calculateAffixState(
  elementRect: { top: number; left: number; width: number; height: number },
  containerRect: { top: number; bottom: number },
  offsetTop: number | undefined,
  offsetBottom: number | undefined,
  zIndex: number,
  viewportHeight?: number
): AffixState {
  const useBottom = offsetBottom !== undefined
  const offset = useBottom ? offsetBottom : (offsetTop ?? 0)

  if (useBottom) {
    // Affix to bottom: element bottom is below container bottom - offset
    const shouldAffix = elementRect.top + elementRect.height > containerRect.bottom - offset
    if (shouldAffix) {
      const innerHeight =
        viewportHeight ?? (isBrowser() ? window.innerHeight : containerRect.bottom)
      return {
        affixed: true,
        style: {
          position: 'fixed',
          bottom: `${innerHeight - containerRect.bottom + offset}px`,
          left: `${elementRect.left}px`,
          width: `${elementRect.width}px`,
          zIndex
        }
      }
    }
  } else {
    // Affix to top: element top is above container top + offset
    const shouldAffix = elementRect.top <= containerRect.top + offset
    if (shouldAffix) {
      return {
        affixed: true,
        style: {
          position: 'fixed',
          top: `${containerRect.top + offset}px`,
          left: `${elementRect.left}px`,
          width: `${elementRect.width}px`,
          zIndex
        }
      }
    }
  }

  return { affixed: false, style: {} }
}

// ---------------------------------------------------------------------------
// IntersectionObserver-based affix detection (preferred over scroll listeners)
// ---------------------------------------------------------------------------

export interface AffixObserverOptions {
  /** Distance from top of root to start affixing (mutually exclusive with offsetBottom) */
  offsetTop?: number
  /** Distance from bottom of root to start affixing (takes priority over offsetTop) */
  offsetBottom?: number
  /** Scroll root. `null` = viewport. */
  root?: Element | null
  /** Called whenever the affixed state toggles. */
  onToggle: (affixed: boolean) => void
}

/**
 * Create an IntersectionObserver-based affix detector.
 *
 * The `sentinel` should be a zero-height marker placed at the original DOM
 * position of the affixed content. As the viewport scrolls past the sentinel
 * (offset by `rootMargin`), `onToggle(true)` fires; when it scrolls back,
 * `onToggle(false)` fires.
 *
 * Returns a teardown function. Safe to call when `IntersectionObserver` is
 * unavailable (returns a no-op cleanup).
 */
export function createAffixObserver(sentinel: Element, options: AffixObserverOptions): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const { offsetTop = 0, offsetBottom, root = null, onToggle } = options

  const topRootMargin = offsetTop === 0 ? 0 : -offsetTop
  const rootMargin =
    offsetBottom !== undefined ? `0px 0px -${offsetBottom}px 0px` : `${topRootMargin}px 0px 0px 0px`

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      if (!entry) return
      const rootBoundsTop = entry.rootBounds?.top ?? 0
      const rootBoundsBottom = entry.rootBounds?.bottom ?? (isBrowser() ? window.innerHeight : 0)
      let affixed: boolean
      if (offsetBottom !== undefined) {
        affixed = !entry.isIntersecting && entry.boundingClientRect.bottom > rootBoundsBottom
      } else {
        affixed = !entry.isIntersecting && entry.boundingClientRect.top < rootBoundsTop
      }
      onToggle(affixed)
    },
    { root, rootMargin, threshold: [0, 1] }
  )

  observer.observe(sentinel)
  return () => observer.disconnect()
}
