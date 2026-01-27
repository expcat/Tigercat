import {
  isEscapeKey,
  isEventOutside,
  computeFloatingPosition,
  autoUpdateFloating,
  type FloatingPlacement,
  type FloatingOptions,
  type FloatingResult,
  type FloatingCleanup
} from '@expcat/tigercat-core'
import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

export interface UseVueClickOutsideOptions {
  enabled: Ref<boolean>
  containerRef: Ref<HTMLElement | null>
  onOutsideClick: () => void
  defer?: boolean
}

export function useVueClickOutside({
  enabled,
  containerRef,
  onOutsideClick,
  defer = false
}: UseVueClickOutsideOptions): () => void {
  let timer: number | undefined

  const handler = (event: MouseEvent) => {
    if (!enabled.value) return
    const container = containerRef.value
    if (!container) return

    if (isEventOutside(event, [container])) {
      onOutsideClick()
    }
  }

  const attach = () => document.addEventListener('click', handler)
  const detach = () => document.removeEventListener('click', handler)

  if (!defer) {
    attach()
    return () => detach()
  }

  timer = window.setTimeout(() => attach(), 0)
  return () => {
    if (timer !== undefined) window.clearTimeout(timer)
    detach()
  }
}

export interface UseVueEscapeKeyOptions {
  enabled: Ref<boolean>
  onEscape: () => void
}

export function useVueEscapeKey({ enabled, onEscape }: UseVueEscapeKeyOptions): () => void {
  const handler = (event: KeyboardEvent) => {
    if (!enabled.value) return
    if (event.defaultPrevented) return
    if (!isEscapeKey(event)) return
    onEscape()
  }

  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}

// ============================================================================
// Floating UI positioning composable
// ============================================================================

export interface UseVueFloatingOptions {
  /**
   * Reference element (trigger)
   */
  referenceRef: Ref<HTMLElement | null>
  /**
   * Floating element (popup/tooltip)
   */
  floatingRef: Ref<HTMLElement | null>
  /**
   * Whether floating positioning is enabled
   */
  enabled: Ref<boolean>
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
  arrowRef?: Ref<HTMLElement | null>
  /**
   * Callback when placement changes (due to collision)
   */
  onPlacementChange?: (placement: FloatingPlacement) => void
}

export interface UseVueFloatingReturn {
  /**
   * X position
   */
  x: Ref<number>
  /**
   * Y position
   */
  y: Ref<number>
  /**
   * Current placement (may differ from requested)
   */
  placement: Ref<FloatingPlacement>
  /**
   * Arrow X position
   */
  arrowX: Ref<number | undefined>
  /**
   * Arrow Y position
   */
  arrowY: Ref<number | undefined>
  /**
   * Manually trigger position update
   */
  update: () => Promise<void>
}

/**
 * Vue composable for positioning floating elements using Floating UI.
 * Provides automatic position updates on scroll, resize, and layout changes.
 *
 * @example
 * ```ts
 * const referenceRef = ref<HTMLElement | null>(null)
 * const floatingRef = ref<HTMLElement | null>(null)
 * const visible = ref(false)
 *
 * const { x, y, placement } = useVueFloating({
 *   referenceRef,
 *   floatingRef,
 *   enabled: visible,
 *   placement: 'top',
 *   offset: 8
 * })
 *
 * // In template: style="position: absolute; left: `${x}px`; top: `${y}px`"
 * ```
 */
export function useVueFloating(options: UseVueFloatingOptions): UseVueFloatingReturn {
  const {
    referenceRef,
    floatingRef,
    enabled,
    placement: initialPlacement = 'bottom',
    offset: offsetDistance = 8,
    arrowRef,
    onPlacementChange
  } = options

  const x = ref(0)
  const y = ref(0)
  const placement = ref<FloatingPlacement>(initialPlacement)
  const arrowX = ref<number | undefined>(undefined)
  const arrowY = ref<number | undefined>(undefined)

  let cleanup: FloatingCleanup | null = null

  const update = async () => {
    const reference = referenceRef.value
    const floating = floatingRef.value

    if (!reference || !floating) return

    const floatingOptions: FloatingOptions = {
      placement: initialPlacement,
      offset: offsetDistance,
      flip: true,
      shift: true,
      arrowElement: arrowRef?.value
    }

    const result: FloatingResult = await computeFloatingPosition(
      reference,
      floating,
      floatingOptions
    )

    x.value = result.x
    y.value = result.y

    if (result.placement !== placement.value) {
      placement.value = result.placement
      onPlacementChange?.(result.placement)
    }

    if (result.arrow) {
      arrowX.value = result.arrow.x
      arrowY.value = result.arrow.y
    }
  }

  watch(
    [enabled, referenceRef, floatingRef],
    ([isEnabled, reference, floating]) => {
      // Cleanup previous auto-update
      if (cleanup) {
        cleanup()
        cleanup = null
      }

      if (!isEnabled || !reference || !floating) return

      // Initial position calculation
      update()

      // Set up auto-update
      cleanup = autoUpdateFloating(reference, floating, update)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  })

  return {
    x,
    y,
    placement,
    arrowX,
    arrowY,
    update
  }
}
