import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useMemo
} from 'react'
import { createPortal } from 'react-dom'
import {
  getFocusTrapNavigation,
  getFocusableElements,
  isEventOutside,
  lockBodyScroll,
  isBrowser,
  computeFloatingPosition,
  autoUpdateFloating,
  resolveAnchoredOverlayTarget,
  getAnchoredOverlayTabTarget,
  getAnchoredOverlayLayoutClasses,
  FLOATING_OVERLAY_Z_INDEX,
  getTransformOrigin,
  restoreFocus,
  registerEscapeDismiss,
  type AnchoredOverlayLayout,
  type FloatingPlacement,
  type FloatingOptions,
  type FloatingResult
} from '@expcat/tigercat-core'

const OVERLAY_LAYER_SELECTOR = '[data-tiger-overlay-layer]'

function resolveOverlayLayer(element: HTMLElement | null): HTMLElement | null {
  return element?.closest<HTMLElement>(OVERLAY_LAYER_SELECTOR) ?? null
}

export interface UseClickOutsideOptions {
  enabled: boolean
  refs: Array<React.RefObject<HTMLElement | null> | undefined>
  onOutsideClick: () => void
  defer?: boolean
}

export function useClickOutside({
  enabled,
  refs,
  onOutsideClick,
  defer = false
}: UseClickOutsideOptions): void {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: MouseEvent) => {
      const elements = refs.map((ref) => ref?.current)
      if (isEventOutside(event, elements)) {
        onOutsideClick()
      }
    }

    const attach = () => document.addEventListener('click', handler)
    const detach = () => document.removeEventListener('click', handler)

    if (!defer) {
      attach()
      return () => detach()
    }

    const timer = window.setTimeout(() => attach(), 0)
    return () => {
      window.clearTimeout(timer)
      detach()
    }
  }, [enabled, refs, onOutsideClick, defer])
}

export interface UseEscapeKeyOptions {
  enabled: boolean
  onEscape: () => void
  layerRef?: React.RefObject<HTMLElement | null>
}

export function useEscapeKey({ enabled, onEscape, layerRef }: UseEscapeKeyOptions): void {
  useEffect(() => {
    if (!enabled) return
    return registerEscapeDismiss(document, onEscape, () => layerRef?.current ?? null)
  }, [enabled, layerRef, onEscape])
}

export interface UseBodyScrollLockOptions {
  enabled: boolean
}

export function useBodyScrollLock({ enabled }: UseBodyScrollLockOptions): void {
  useEffect(() => {
    if (!enabled) return

    return lockBodyScroll()
  }, [enabled])
}

export function renderBodyPortal(node: React.ReactNode): React.ReactPortal | null {
  if (!isBrowser()) return null
  return createPortal(node, document.body)
}

export function renderOverlayPortal(
  node: React.ReactNode,
  target: HTMLElement | null,
  disabled = false
): React.ReactNode {
  if (node == null || typeof node === 'boolean') return node
  const layeredNode = createElement(
    'div',
    { className: 'contents', 'data-tiger-overlay-layer': '' },
    node,
    createElement('div', {
      key: 'overlay-host',
      className: 'contents',
      'data-tiger-overlay-host': ''
    })
  )
  if (disabled || !target) return layeredNode
  return createPortal(layeredNode, target)
}

export interface UseFocusTrapOptions {
  enabled: boolean
  containerRef: React.RefObject<HTMLElement | null>
}

export function useFocusTrap({ enabled, containerRef }: UseFocusTrapOptions): void {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return
    const ownerDocument = container.ownerDocument

    const handler = (event: KeyboardEvent) => {
      if (!(event.target instanceof Node) || !container.contains(event.target)) return
      const focusables = getFocusableElements(container)
      const activeElement = ownerDocument.activeElement
      const nav = getFocusTrapNavigation(event, focusables, activeElement)
      if (!nav.shouldHandle || !nav.next) return

      event.preventDefault()
      nav.next.focus()
    }

    ownerDocument.addEventListener('keydown', handler, true)
    return () => ownerDocument.removeEventListener('keydown', handler, true)
  }, [enabled, containerRef])
}

// ============================================================================
// Floating UI positioning hook
// ============================================================================

export interface UseFloatingOptions {
  /**
   * Reference element (trigger)
   */
  referenceRef: React.RefObject<HTMLElement | null>
  /**
   * Floating element (popup/tooltip)
   */
  floatingRef: React.RefObject<HTMLElement | null>
  /**
   * Whether floating positioning is enabled
   */
  enabled: boolean
  /**
   * Preferred placement
   * @default 'bottom'
   */
  placement?: FloatingPlacement
  /**
   * Offset distance in pixels
   * @default 8
   */
  offset?: number
  /**
   * Arrow element ref
   */
  arrowRef?: React.RefObject<HTMLElement | null>
  /**
   * Callback when placement changes (due to collision)
   */
  onPlacementChange?: (placement: FloatingPlacement) => void
  /** Recreate positioning when the portal target changes. */
  context?: unknown
}

export interface UseFloatingReturn {
  /**
   * X position
   */
  x: number
  /**
   * Y position
   */
  y: number
  /**
   * Current placement (may differ from requested)
   */
  placement: FloatingPlacement
  /**
   * Arrow X position
   */
  arrowX: number | undefined
  /**
   * Arrow Y position
   */
  arrowY: number | undefined
  /**
   * Manually trigger position update
   */
  update: () => Promise<void>
  isPositioned: boolean
  referenceWidth: number
}

/**
 * React hook for positioning floating elements using Floating UI.
 * Provides automatic position updates on scroll, resize, and layout changes.
 *
 * @example
 * ```tsx
 * const referenceRef = useRef<HTMLButtonElement>(null)
 * const floatingRef = useRef<HTMLDivElement>(null)
 * const [visible, setVisible] = useState(false)
 *
 * const { x, y, placement } = useFloating({
 *   referenceRef,
 *   floatingRef,
 *   enabled: visible,
 *   placement: 'top',
 *   offset: 8
 * })
 *
 * // In JSX: style={{ position: 'absolute', left: x, top: y }}
 * ```
 */
export function useFloating(options: UseFloatingOptions): UseFloatingReturn {
  const {
    referenceRef,
    floatingRef,
    enabled,
    placement: initialPlacement = 'bottom',
    offset: offsetDistance = 8,
    arrowRef,
    onPlacementChange,
    context
  } = options

  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [placement, setPlacement] = useState<FloatingPlacement>(initialPlacement)
  const [arrowX, setArrowX] = useState<number | undefined>(undefined)
  const [arrowY, setArrowY] = useState<number | undefined>(undefined)
  const [isPositioned, setIsPositioned] = useState(false)
  const [referenceWidth, setReferenceWidth] = useState(0)
  const enabledRef = useRef(enabled)
  const updateRequestRef = useRef(0)
  enabledRef.current = enabled

  // Store callback in ref to avoid effect re-runs
  const onPlacementChangeRef = useRef(onPlacementChange)
  onPlacementChangeRef.current = onPlacementChange

  const update = useCallback(async () => {
    const request = ++updateRequestRef.current
    const reference = referenceRef.current
    const floating = floatingRef.current

    if (!enabledRef.current || !reference || !floating) return

    const floatingOptions: FloatingOptions = {
      placement: initialPlacement,
      offset: offsetDistance,
      flip: true,
      shift: true,
      arrowElement: arrowRef?.current
    }

    const result: FloatingResult = await computeFloatingPosition(
      reference,
      floating,
      floatingOptions
    )

    if (
      request !== updateRequestRef.current ||
      !enabledRef.current ||
      referenceRef.current !== reference ||
      floatingRef.current !== floating
    ) {
      return
    }

    setReferenceWidth(reference.getBoundingClientRect().width)
    setX(result.x)
    setY(result.y)
    setPlacement((prev) => {
      if (prev !== result.placement) {
        onPlacementChangeRef.current?.(result.placement)
        return result.placement
      }
      return prev
    })

    if (result.arrow) {
      setArrowX(result.arrow.x)
      setArrowY(result.arrow.y)
    }
    setIsPositioned(true)
  }, [referenceRef, floatingRef, initialPlacement, offsetDistance, arrowRef])

  useEffect(() => {
    updateRequestRef.current += 1
    const reference = referenceRef.current
    const floating = floatingRef.current

    if (!enabled || !reference || !floating) {
      setIsPositioned(false)
      return
    }

    // Initial position calculation
    update()

    // Set up auto-update
    const cleanup = autoUpdateFloating(reference, floating, update)

    return () => {
      updateRequestRef.current += 1
      cleanup()
    }
  }, [enabled, referenceRef, floatingRef, update, context])

  return {
    x,
    y,
    placement,
    arrowX,
    arrowY,
    update,
    isPositioned,
    referenceWidth
  }
}

export interface UseAnchoredOverlayOptions {
  enabled: boolean
  referenceRef: React.RefObject<HTMLElement | null>
  floatingRef: React.RefObject<HTMLElement | null>
  containerRef?: React.RefObject<HTMLElement | null>
  outsideRefs?: Array<React.RefObject<HTMLElement | null> | undefined>
  placement?: FloatingPlacement
  offset?: number
  layout?: AnchoredOverlayLayout
  matchReferenceWidth?: boolean
  portal?: boolean
  dismissOnOutside?: boolean
  dismissOnEscape?: boolean
  restoreFocusOnDismiss?: boolean
  onDismiss?: (reason: AnchoredOverlayDismissReason) => void
}

export type AnchoredOverlayDismissReason = 'outside' | 'escape'

export interface UseAnchoredOverlayReturn {
  target: HTMLElement | null
  floatingStyles: React.CSSProperties
  floatingClasses: string
  positioned: boolean
  placement: FloatingPlacement
  x: number
  y: number
}

export function useAnchoredOverlay({
  enabled,
  referenceRef,
  floatingRef,
  containerRef,
  outsideRefs = [],
  placement = 'bottom-start',
  offset = 4,
  layout = 'anchored',
  matchReferenceWidth = false,
  portal = true,
  dismissOnOutside = false,
  dismissOnEscape = false,
  restoreFocusOnDismiss = false,
  onDismiss
}: UseAnchoredOverlayOptions): UseAnchoredOverlayReturn {
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const floatingLayerRef = useMemo<React.RefObject<HTMLElement | null>>(
    () => ({
      get current() {
        return resolveOverlayLayer(floatingRef.current) ?? floatingRef.current
      }
    }),
    [floatingRef]
  )

  useLayoutEffect(() => {
    if (!portal) {
      setTarget(null)
      return
    }
    setTarget(resolveAnchoredOverlayTarget(referenceRef.current))
  }, [portal, referenceRef])

  // Opening from an already-mounted trigger can resolve the layer during render.
  // This keeps the floating subtree in the same Portal from its first open frame,
  // so autofocus and keyboard state are not lost to a follow-up Portal remount.
  const resolvedTarget =
    portal && referenceRef.current ? resolveAnchoredOverlayTarget(referenceRef.current) : null
  const effectiveTarget = resolvedTarget ?? target

  const {
    x,
    y,
    placement: actualPlacement,
    isPositioned,
    referenceWidth
  } = useFloating({
    referenceRef,
    floatingRef,
    enabled,
    placement,
    offset,
    context: effectiveTarget
  })

  const dismiss = useCallback(
    (reason: AnchoredOverlayDismissReason) => {
      onDismiss?.(reason)
      if (restoreFocusOnDismiss && reason === 'escape') {
        window.setTimeout(() => restoreFocus(referenceRef.current, { preventScroll: true }), 0)
      }
    },
    [onDismiss, referenceRef, restoreFocusOnDismiss]
  )

  const dismissOutside = useCallback(() => dismiss('outside'), [dismiss])
  const dismissOnEscapeKey = useCallback(() => dismiss('escape'), [dismiss])

  useClickOutside({
    enabled: enabled && dismissOnOutside,
    refs: [containerRef, referenceRef, floatingLayerRef, ...outsideRefs],
    onOutsideClick: dismissOutside,
    defer: false
  })
  useEscapeKey({
    enabled: enabled && dismissOnEscape,
    onEscape: dismissOnEscapeKey,
    layerRef: floatingLayerRef
  })

  useEffect(() => {
    const floating = floatingRef.current
    if (!enabled || !floating) return

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const target = getAnchoredOverlayTabTarget(
        referenceRef.current,
        floatingRef.current,
        event.shiftKey
      )
      if (!target) return

      event.preventDefault()
      window.setTimeout(() => restoreFocus(target, { preventScroll: true }), 0)
    }

    floating.addEventListener('keydown', handleTab, true)
    return () => floating.removeEventListener('keydown', handleTab, true)
  }, [enabled, floatingRef, referenceRef])

  const floatingStyles = useMemo<React.CSSProperties>(
    () =>
      ({
        '--tiger-overlay-x': `${x}px`,
        '--tiger-overlay-y': `${y}px`,
        '--tiger-overlay-reference-width': `${referenceWidth}px`,
        zIndex: FLOATING_OVERLAY_Z_INDEX,
        transformOrigin: getTransformOrigin(actualPlacement)
      }) as React.CSSProperties,
    [actualPlacement, referenceWidth, x, y]
  )

  return {
    target: portal ? effectiveTarget : null,
    floatingStyles,
    floatingClasses: getAnchoredOverlayLayoutClasses(layout, matchReferenceWidth),
    positioned: isPositioned,
    placement: actualPlacement,
    x,
    y
  }
}
