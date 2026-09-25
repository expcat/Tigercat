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
  createFocusScope,
  isEventOutside,
  lockBodyScroll,
  setBackgroundInert,
  isBrowser,
  computeFloatingPosition,
  autoUpdateFloating,
  resolveAnchoredOverlayTarget,
  retainPortaledOverlay,
  collectOverlayListenerDocuments,
  getAnchoredOverlayTabTarget,
  getAnchoredOverlayLayoutClasses,
  getOverlayDirLang,
  OVERLAY_Z_INDEX,
  getTransformOrigin,
  restoreFocus,
  captureActiveElement,
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

    let listening: Document[] = []
    const attach = () => {
      listening = collectOverlayListenerDocuments(refs.map((ref) => ref?.current))
      for (const doc of listening) doc.addEventListener('click', handler)
    }
    const detach = () => {
      for (const doc of listening) doc.removeEventListener('click', handler)
      listening = []
    }

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
    const releases = collectOverlayListenerDocuments([layerRef?.current]).map((doc) =>
      registerEscapeDismiss(doc, onEscape, () => layerRef?.current ?? null)
    )
    return () => {
      for (const release of releases) release()
    }
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

export function useBackgroundInert({
  enabled,
  containerRef
}: {
  enabled: boolean
  containerRef: React.RefObject<HTMLElement | null>
}): void {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return
    return setBackgroundInert(container)
  }, [enabled, containerRef])
}

function PortaledOverlayLayer({
  target,
  children
}: {
  target: HTMLElement | null
  children: React.ReactNode
}): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    return retainPortaledOverlay(node)
  }, [])
  const dirLang = getOverlayDirLang(target)
  return createElement(
    'div',
    { ref, className: 'contents', 'data-tiger-overlay-layer': '', ...dirLang },
    children,
    createElement('div', {
      key: 'overlay-host',
      className: 'contents',
      'data-tiger-overlay-host': ''
    })
  )
}

function wrapOverlayLayer(node: React.ReactNode, target: HTMLElement | null): React.ReactElement {
  return createElement(PortaledOverlayLayer, { target }, node)
}

export function renderBodyPortal(node: React.ReactNode, disabled = false): React.ReactNode {
  if (node == null || typeof node === 'boolean') return node
  const target = isBrowser() ? resolveAnchoredOverlayTarget(null) : null
  const layeredNode = wrapOverlayLayer(node, target)
  if (disabled || !target) return layeredNode
  return createPortal(layeredNode, target)
}

/** Resolve the overlay-host chain from an in-tree anchor so nested Modal/Drawer enter the parent host. */
export function useOverlayPortalTarget(): {
  anchorRef: React.RefObject<HTMLSpanElement | null>
  target: HTMLElement | null
} {
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setTarget(resolveAnchoredOverlayTarget(anchorRef.current))
  }, [])

  return {
    anchorRef,
    target: target ?? (isBrowser() ? resolveAnchoredOverlayTarget(anchorRef.current) : null)
  }
}

export function renderOverlayPortal(
  node: React.ReactNode,
  target: HTMLElement | null,
  disabled = false
): React.ReactNode {
  if (node == null || typeof node === 'boolean') return node
  const layeredNode = wrapOverlayLayer(node, target)
  if (disabled || !target) return layeredNode
  return createPortal(layeredNode, target)
}

export interface UseFocusTrapOptions {
  enabled: boolean
  containerRef: React.RefObject<HTMLElement | null>
  /** Inert the rest of the document while the trap is active. */
  inert?: boolean
  /** Capture the active element, focus the trap, and restore on disable or unmount. */
  autoFocus?: boolean
  /**
   * Restore focus when the trap closes. Defaults to `autoFocus`.
   * Set false when the previously focused control opens the layer on focus.
   */
  returnFocus?: boolean
  /** Focus this node instead of the first tabbable control. */
  initialFocusRef?: React.RefObject<HTMLElement | null>
  /** Outside node that stays active (interactive tour target). */
  exemptRef?: React.RefObject<HTMLElement | null>
  /** Modal scopes lock scroll unless this is false. */
  lockScroll?: boolean
}

export function useFocusTrap({
  enabled,
  containerRef,
  inert = false,
  autoFocus = false,
  returnFocus,
  initialFocusRef,
  exemptRef,
  lockScroll = true
}: UseFocusTrapOptions): void {
  const restoreTargetRef = useRef<HTMLElement | null>(null)
  const wasEnabledRef = useRef(false)

  if (autoFocus && enabled && !wasEnabledRef.current) {
    restoreTargetRef.current = captureActiveElement()
  }
  wasEnabledRef.current = enabled

  useLayoutEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    if (!container) return
    const active = captureActiveElement()
    if (autoFocus && active && !container.contains(active)) {
      restoreTargetRef.current = active
    }
    const restore = returnFocus ?? autoFocus
    const scope = createFocusScope(container, {
      modal: inert,
      moveFocus: autoFocus || Boolean(initialFocusRef?.current),
      initialFocus: initialFocusRef?.current ?? null,
      returnFocus: restore,
      previouslyFocused: restore ? (restoreTargetRef.current ?? undefined) : null,
      lockScroll,
      exempt: exemptRef ? () => exemptRef.current : undefined
    })
    scope.activate()
    return () => {
      scope.deactivate()
    }
  }, [enabled, containerRef, inert, autoFocus, returnFocus, initialFocusRef, exemptRef, lockScroll])
}

// ============================================================================
// Floating UI positioning hook
// ============================================================================

interface FloatingClientRect {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
  x: number
  y: number
}

export type FloatingReference =
  | HTMLElement
  | {
      getBoundingClientRect: () => FloatingClientRect
      contextElement?: Element
    }

export interface UseFloatingOptions {
  /**
   * Reference element (trigger) or a virtual rect.
   */
  referenceRef: React.RefObject<FloatingReference | null>
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
  /** Recreate positioning when the portal target or virtual point changes. */
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
  referenceHidden: boolean
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
  const [referenceHidden, setReferenceHidden] = useState(false)
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

    const rect = reference.getBoundingClientRect()
    setReferenceWidth('width' in rect ? Number(rect.width) : 0)
    setX(result.x)
    setY(result.y)
    setReferenceHidden(result.referenceHidden)
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
    let stopped = false
    let attempts = 0
    let cleanupAuto: (() => void) | undefined

    const attach = () => {
      if (stopped) return
      const reference = referenceRef.current
      const floating = floatingRef.current
      if (!enabled || !reference || !floating) {
        // The overlay outlet commits the layer after this effect.
        if (enabled && attempts < 8) {
          attempts += 1
          queueMicrotask(attach)
          return
        }
        setIsPositioned(false)
        return
      }

      void update()
      cleanupAuto = autoUpdateFloating(reference, floating, update)
    }

    attach()

    return () => {
      stopped = true
      updateRequestRef.current += 1
      cleanupAuto?.()
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
    referenceHidden,
    referenceWidth
  }
}

export interface UseAnchoredOverlayOptions {
  enabled: boolean
  referenceRef: React.RefObject<HTMLElement | null>
  /** Positioning reference when it is not the trigger (context-menu pointer). */
  positionReferenceRef?: React.RefObject<FloatingReference | null>
  floatingRef: React.RefObject<HTMLElement | null>
  containerRef?: React.RefObject<HTMLElement | null>
  outsideRefs?: Array<React.RefObject<HTMLElement | null> | undefined>
  placement?: FloatingPlacement
  offset?: number
  layout?: AnchoredOverlayLayout
  matchReferenceWidth?: boolean
  portal?: boolean
  getContainer?: () => HTMLElement | null
  dismissOnOutside?: boolean
  dismissOnEscape?: boolean
  restoreFocusOnDismiss?: boolean
  arrowRef?: React.RefObject<HTMLElement | null>
  onDismiss?: (reason: AnchoredOverlayDismissReason) => void
  /** Bust positioning when a virtual reference moves without changing identity. */
  revision?: unknown
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
  arrowX: number | undefined
  arrowY: number | undefined
}

function resolveOverlayPortalTarget(
  reference: HTMLElement | null,
  getContainer?: () => HTMLElement | null
): HTMLElement | null {
  return getContainer?.() ?? resolveAnchoredOverlayTarget(reference)
}

export function useAnchoredOverlay({
  enabled,
  referenceRef,
  positionReferenceRef,
  floatingRef,
  containerRef,
  outsideRefs = [],
  placement = 'bottom-start',
  offset = 4,
  layout = 'anchored',
  matchReferenceWidth = false,
  portal = true,
  getContainer,
  dismissOnOutside = false,
  dismissOnEscape = false,
  restoreFocusOnDismiss = false,
  arrowRef,
  onDismiss,
  revision
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
    setTarget(resolveOverlayPortalTarget(referenceRef.current, getContainer))
  }, [portal, referenceRef, getContainer])

  // Opening from an already-mounted trigger can resolve the layer during render.
  // This keeps the floating subtree in the same Portal from its first open frame,
  // so autofocus and keyboard state are not lost to a follow-up Portal remount.
  const resolvedTarget =
    portal && referenceRef.current
      ? resolveOverlayPortalTarget(referenceRef.current, getContainer)
      : null
  const effectiveTarget = resolvedTarget ?? target

  const {
    x,
    y,
    placement: actualPlacement,
    isPositioned,
    referenceHidden,
    referenceWidth,
    arrowX,
    arrowY
  } = useFloating({
    referenceRef: positionReferenceRef ?? referenceRef,
    floatingRef,
    enabled,
    placement,
    offset,
    arrowRef,
    context: revision ?? effectiveTarget
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
    defer: true
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
        zIndex: OVERLAY_Z_INDEX.overlay,
        transformOrigin: getTransformOrigin(actualPlacement),
        ...(referenceHidden ? { visibility: 'hidden' as const } : {})
      }) as React.CSSProperties,
    [actualPlacement, referenceHidden, referenceWidth, x, y]
  )

  return {
    target: portal ? effectiveTarget : null,
    floatingStyles,
    floatingClasses: getAnchoredOverlayLayoutClasses(layout, matchReferenceWidth),
    positioned: isPositioned,
    placement: actualPlacement,
    x,
    y,
    arrowX,
    arrowY
  }
}
