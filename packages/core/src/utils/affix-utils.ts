/**
 * Affix component utilities
 * Shared logic for Affix components (Vue + React)
 */

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
 * @param offsetTop - Offset from top (undefined if using bottom)
 * @param offsetBottom - Offset from bottom (undefined if using top)
 * @param zIndex - z-index for the fixed element
 */
export function calculateAffixState(
  elementRect: { top: number; left: number; width: number; height: number },
  containerRect: { top: number; bottom: number },
  offsetTop: number | undefined,
  offsetBottom: number | undefined,
  zIndex: number
): AffixState {
  const useBottom = offsetBottom !== undefined
  const offset = useBottom ? offsetBottom : (offsetTop ?? 0)

  if (useBottom) {
    // Affix to bottom: element bottom is above container bottom - offset
    const shouldAffix = elementRect.top + elementRect.height > containerRect.bottom - offset
    if (shouldAffix) {
      return {
        affixed: true,
        style: {
          position: 'fixed',
          bottom: `${offset}px`,
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

/**
 * Resolve scrollable container element from a CSS selector string.
 * Returns `window` proxy info if selector is undefined.
 */
export function resolveAffixTarget(selector?: string): {
  element: Element | Window
  getRect: () => { top: number; bottom: number }
} {
  if (typeof window === 'undefined') {
    return {
      element: null as unknown as Window,
      getRect: () => ({ top: 0, bottom: 0 })
    }
  }

  if (!selector) {
    return {
      element: window,
      getRect: () => ({ top: 0, bottom: window.innerHeight })
    }
  }

  const el = document.querySelector(selector)
  if (!el) {
    return {
      element: window,
      getRect: () => ({ top: 0, bottom: window.innerHeight })
    }
  }

  return {
    element: el,
    getRect: () => {
      const r = el.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom }
    }
  }
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

  const rootMargin =
    offsetBottom !== undefined ? `0px 0px -${offsetBottom}px 0px` : `-${offsetTop}px 0px 0px 0px`

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      if (!entry) return
      const rootBoundsTop = entry.rootBounds?.top ?? 0
      const rootBoundsBottom =
        entry.rootBounds?.bottom ?? (typeof window !== 'undefined' ? window.innerHeight : 0)
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
