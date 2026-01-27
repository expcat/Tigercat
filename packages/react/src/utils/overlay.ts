import { useEffect, useRef, useState, useCallback } from 'react'
import {
  getFocusTrapNavigation,
  getFocusableElements,
  isEscapeKey,
  isEventOutside,
  computeFloatingPosition,
  autoUpdateFloating,
  type FloatingPlacement,
  type FloatingOptions,
  type FloatingResult
} from '@expcat/tigercat-core'

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
}

export function useEscapeKey({ enabled, onEscape }: UseEscapeKeyOptions): void {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (!isEscapeKey(event)) return
      onEscape()
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [enabled, onEscape])
}

export interface UseFocusTrapOptions {
  enabled: boolean
  containerRef: React.RefObject<HTMLElement | null>
}

export function useFocusTrap({ enabled, containerRef }: UseFocusTrapOptions): void {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return

    const handler = (event: KeyboardEvent) => {
      const focusables = getFocusableElements(container)
      const nav = getFocusTrapNavigation(event, focusables, document.activeElement)
      if (!nav.shouldHandle || !nav.next) return

      event.preventDefault()
      nav.next.focus()
    }

    container.addEventListener('keydown', handler)
    return () => container.removeEventListener('keydown', handler)
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
    onPlacementChange
  } = options

  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [placement, setPlacement] = useState<FloatingPlacement>(initialPlacement)
  const [arrowX, setArrowX] = useState<number | undefined>(undefined)
  const [arrowY, setArrowY] = useState<number | undefined>(undefined)

  // Store callback in ref to avoid effect re-runs
  const onPlacementChangeRef = useRef(onPlacementChange)
  onPlacementChangeRef.current = onPlacementChange

  const update = useCallback(async () => {
    const reference = referenceRef.current
    const floating = floatingRef.current

    if (!reference || !floating) return

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
  }, [referenceRef, floatingRef, initialPlacement, offsetDistance, arrowRef])

  useEffect(() => {
    const reference = referenceRef.current
    const floating = floatingRef.current

    if (!enabled || !reference || !floating) return

    // Initial position calculation
    update()

    // Set up auto-update
    const cleanup = autoUpdateFloating(reference, floating, update)

    return () => {
      cleanup()
    }
  }, [enabled, referenceRef, floatingRef, update])

  return {
    x,
    y,
    placement,
    arrowX,
    arrowY,
    update
  }
}
