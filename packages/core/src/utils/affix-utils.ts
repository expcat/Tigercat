/**
 * Affix component utilities
 * Shared logic for Affix components (Vue + React)
 */

import type { ScrollRootInput } from '../types/scroll-root'
import { isBrowser } from './env'
import { getScrollRootEventTarget, resolveScrollRoot, type ResolvedScrollRoot } from './scroll-root'

export interface AffixLayoutRect {
  top: number
  left: number
  width: number
  height: number
}

export interface AffixState {
  /** Whether the element should be fixed */
  affixed: boolean
  /** The fixed CSS position styles to apply */
  style: Record<string, string | number>
  /** In-flow placeholder size while affixed */
  placeholder: { width: string; height: string }
}

export const AFFIX_UNPINNED_STATE: AffixState = {
  affixed: false,
  style: {},
  placeholder: { width: '0px', height: '0px' }
}

const AFFIX_SENTINEL_STYLE = {
  display: 'block',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  pointerEvents: 'none'
} as const

export function getAffixSentinelStyle(): typeof AFFIX_SENTINEL_STYLE {
  return AFFIX_SENTINEL_STYLE
}

export function finiteNonNegativePx(value: number | undefined, fallback: number = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return fallback
  return value
}

export function buildAffixRootMargin(offsetTop?: number, offsetBottom?: number): string {
  if (offsetBottom !== undefined) {
    return `0px 0px -${finiteNonNegativePx(offsetBottom)}px 0px`
  }
  const top = finiteNonNegativePx(offsetTop)
  return `${top === 0 ? 0 : -top}px 0px 0px 0px`
}

/**
 * Build the fixed geometry from the in-flow box (placeholder or content).
 * Does not decide whether to affix — callers pass a live flow rect.
 */
export function buildAffixStyle(
  flowRect: AffixLayoutRect,
  containerRect: { top: number; bottom: number },
  offsetTop: number | undefined,
  offsetBottom: number | undefined,
  zIndex: number,
  viewportHeight?: number
): Record<string, string | number> {
  const innerHeight = viewportHeight ?? (isBrowser() ? window.innerHeight : containerRect.bottom)

  if (offsetBottom !== undefined) {
    const offset = finiteNonNegativePx(offsetBottom)
    return {
      position: 'fixed',
      bottom: `${innerHeight - containerRect.bottom + offset}px`,
      left: `${flowRect.left}px`,
      width: `${flowRect.width}px`,
      zIndex
    }
  }

  const offset = finiteNonNegativePx(offsetTop)
  return {
    position: 'fixed',
    top: `${containerRect.top + offset}px`,
    left: `${flowRect.left}px`,
    width: `${flowRect.width}px`,
    zIndex
  }
}

export function buildAffixPlaceholderStyle(flowRect: AffixLayoutRect): {
  width: string
  height: string
} {
  return {
    width: '100%',
    height: `${flowRect.height}px`
  }
}

/**
 * Calculate whether an element should be affixed based on scroll position.
 */
export function calculateAffixState(
  elementRect: AffixLayoutRect,
  containerRect: { top: number; bottom: number },
  offsetTop: number | undefined,
  offsetBottom: number | undefined,
  zIndex: number,
  viewportHeight?: number
): AffixState {
  const useBottom = offsetBottom !== undefined
  const offset = useBottom ? finiteNonNegativePx(offsetBottom) : finiteNonNegativePx(offsetTop)

  const shouldAffix = useBottom
    ? elementRect.top + elementRect.height > containerRect.bottom - offset
    : elementRect.top <= containerRect.top + offset

  if (!shouldAffix) return { ...AFFIX_UNPINNED_STATE }

  return {
    affixed: true,
    style: buildAffixStyle(
      elementRect,
      containerRect,
      offsetTop,
      offsetBottom,
      zIndex,
      viewportHeight
    ),
    placeholder: buildAffixPlaceholderStyle(elementRect)
  }
}

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
 * The `sentinel` should be a ≥1px marker at the original in-flow edge.
 * Returns a teardown. When `IntersectionObserver` is missing, returns a no-op
 * — callers should use scroll/resize + `calculateAffixState`.
 */
export function createAffixObserver(sentinel: Element, options: AffixObserverOptions): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const { offsetTop = 0, offsetBottom, root = null, onToggle } = options
  const rootMargin = buildAffixRootMargin(offsetTop, offsetBottom)

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

export interface AffixControllerOptions {
  getSentinel: () => HTMLElement | null
  getPlaceholder: () => HTMLElement | null
  getContent: () => HTMLElement | null
  getTarget: () => ScrollRootInput
  getOffsetTop: () => number | undefined
  getOffsetBottom: () => number | undefined
  getZIndex: () => number
  onState: (state: AffixState) => void
  onChange?: (affixed: boolean) => void
}

export interface AffixController {
  bind(): void
  unbind(): void
  /** Rebuild geometry from the in-flow box. Does not recreate observers. */
  updateStyle(): void
  /** Re-attach ResizeObserver after placeholder mounts. */
  observeFlow(): void
}

function readLayoutRect(el: HTMLElement | null): AffixLayoutRect | null {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

/**
 * Own toggle, live placeholder measurement, and observers.
 * Vue/React only bind refs and DOM.
 */
export function createAffixController(options: AffixControllerOptions): AffixController {
  let affixed = false
  let lastSerialized = ''
  let stopObserver: (() => void) | null = null
  let resizeObs: ResizeObserver | null = null
  let observed = new Set<Element>()
  let scrollTarget: EventTarget | null = null
  let resolved: ResolvedScrollRoot | null = null

  const getFlowRect = (): AffixLayoutRect | null => {
    if (affixed) {
      return readLayoutRect(options.getPlaceholder()) ?? readLayoutRect(options.getContent())
    }
    return readLayoutRect(options.getContent())
  }

  const emitState = (next: AffixState, emitChange: boolean): void => {
    const was = affixed
    affixed = next.affixed
    const serialized = JSON.stringify(next)
    if (serialized !== lastSerialized) {
      lastSerialized = serialized
      options.onState(next)
    }
    if (emitChange && was !== next.affixed) options.onChange?.(next.affixed)
  }

  const pinFromFlow = (emitChange: boolean): void => {
    const flow = getFlowRect()
    if (!flow) return
    const root = resolved ?? resolveScrollRoot(options.getTarget())
    const style = buildAffixStyle(
      flow,
      root.getRect(),
      options.getOffsetTop(),
      options.getOffsetBottom(),
      options.getZIndex()
    )
    emitState(
      {
        affixed: true,
        style,
        placeholder: buildAffixPlaceholderStyle(flow)
      },
      emitChange
    )
  }

  const unpin = (emitChange: boolean): void => {
    if (!affixed && !emitChange) return
    emitState({ ...AFFIX_UNPINNED_STATE }, emitChange)
  }

  const applyToggle = (nextAffixed: boolean): void => {
    if (nextAffixed) pinFromFlow(true)
    else unpin(true)
  }

  const updateStyle = (): void => {
    if (affixed) pinFromFlow(false)
  }

  const onLayoutWhilePinned = (): void => {
    if (affixed) pinFromFlow(false)
  }

  const observeFlow = (): void => {
    if (typeof ResizeObserver === 'undefined') return
    const placeholder = options.getPlaceholder()
    const content = options.getContent()
    const parent = (placeholder ?? content)?.parentElement ?? null
    const next = [placeholder, content, parent].filter((el): el is HTMLElement => el != null)
    const same =
      resizeObs !== null && next.length === observed.size && next.every((el) => observed.has(el))
    if (same) return
    resizeObs?.disconnect()
    resizeObs = null
    observed = new Set()
    if (next.length === 0) return
    resizeObs = new ResizeObserver(() => onLayoutWhilePinned())
    for (const el of next) {
      resizeObs.observe(el)
      observed.add(el)
    }
  }

  const unbind = (): void => {
    stopObserver?.()
    stopObserver = null
    resizeObs?.disconnect()
    resizeObs = null
    observed = new Set()
    if (scrollTarget) {
      scrollTarget.removeEventListener('scroll', onLayoutWhilePinned)
      scrollTarget = null
    }
    if (isBrowser()) {
      window.removeEventListener('resize', onLayoutWhilePinned)
    }
    resolved = null
  }

  const bind = (): void => {
    unbind()
    if (!isBrowser()) return
    const sentinel = options.getSentinel()
    if (!sentinel) return

    resolved = resolveScrollRoot(options.getTarget())
    const root = resolved.isWindow ? null : (resolved.target as Element | null)

    if (typeof IntersectionObserver === 'undefined') {
      const onScrollLayout = (): void => {
        const flow = getFlowRect()
        if (!flow || !resolved) return
        const next = calculateAffixState(
          flow,
          resolved.getRect(),
          options.getOffsetTop(),
          options.getOffsetBottom(),
          options.getZIndex()
        )
        if (next.affixed) pinFromFlow(true)
        else unpin(true)
      }
      const eventTarget = getScrollRootEventTarget(resolved)
      eventTarget?.addEventListener('scroll', onScrollLayout, { passive: true })
      window.addEventListener('resize', onScrollLayout, { passive: true })
      onScrollLayout()
      stopObserver = () => {
        eventTarget?.removeEventListener('scroll', onScrollLayout)
        window.removeEventListener('resize', onScrollLayout)
      }
    } else {
      stopObserver = createAffixObserver(sentinel, {
        offsetTop: options.getOffsetTop(),
        offsetBottom: options.getOffsetBottom(),
        root,
        onToggle: applyToggle
      })
    }

    scrollTarget = getScrollRootEventTarget(resolved)
    scrollTarget?.addEventListener('scroll', onLayoutWhilePinned, { passive: true })
    window.addEventListener('resize', onLayoutWhilePinned, { passive: true })
    observeFlow()
  }

  return { bind, unbind, updateStyle, observeFlow }
}
