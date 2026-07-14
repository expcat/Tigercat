import {
  getFocusTrapNavigation,
  getFocusableElements,
  isEventOutside,
  lockBodyScroll,
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
  type FloatingResult,
  type FloatingCleanup
} from '@expcat/tigercat-core'
import { h, ref, computed, Teleport, watch, onBeforeUnmount, type Ref, type VNodeChild } from 'vue'

const OVERLAY_LAYER_SELECTOR = '[data-tiger-overlay-layer]'

function resolveOverlayLayer(element: HTMLElement | null): HTMLElement | null {
  return element?.closest<HTMLElement>(OVERLAY_LAYER_SELECTOR) ?? null
}

export interface UseVueClickOutsideOptions {
  enabled: Ref<boolean>
  containerRef?: Ref<HTMLElement | null>
  outsideRefs?: Array<Ref<HTMLElement | null> | undefined>
  refs?: Array<Ref<HTMLElement | null> | undefined>
  onOutsideClick: () => void
  defer?: boolean
}

export function useVueClickOutside({
  enabled,
  containerRef,
  refs,
  onOutsideClick,
  defer = false
}: UseVueClickOutsideOptions): () => void {
  let timer: number | undefined

  const handler = (event: MouseEvent) => {
    if (!enabled.value) return
    const elements = refs?.length ? refs.map((ref) => ref?.value) : [containerRef?.value]
    if (!elements.some(Boolean)) return

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

  timer = window.setTimeout(() => attach(), 0)
  return () => {
    if (timer !== undefined) window.clearTimeout(timer)
    detach()
  }
}

export interface UseVueEscapeKeyOptions {
  enabled: Ref<boolean>
  onEscape: () => void
  layerRef?: Ref<HTMLElement | null>
}

export function useVueEscapeKey({
  enabled,
  onEscape,
  layerRef
}: UseVueEscapeKeyOptions): () => void {
  let removeEntry: (() => void) | undefined
  const stop = watch(
    enabled,
    (isEnabled) => {
      removeEntry?.()
      removeEntry = isEnabled
        ? registerEscapeDismiss(document, onEscape, () => layerRef?.value ?? null)
        : undefined
    },
    { immediate: true, flush: 'sync' }
  )

  return () => {
    stop()
    removeEntry?.()
  }
}

export function useVueBodyScrollLock(enabled: Ref<boolean>): void {
  watch(
    enabled,
    (isEnabled, _prevEnabled, onCleanup) => {
      if (!isEnabled) return

      const unlock = lockBodyScroll()
      onCleanup(() => unlock())
    },
    { immediate: true }
  )
}

export function renderVueBodyTeleport(children: VNodeChild, disabled = false): VNodeChild {
  const normalizedChildren = children == null ? [] : Array.isArray(children) ? children : [children]
  return h(Teleport as never, { to: 'body', disabled }, normalizedChildren)
}

export function renderVueOverlayTeleport(
  children: VNodeChild,
  target: HTMLElement | null,
  disabled = false
): VNodeChild {
  if (children == null || typeof children === 'boolean') return children
  const layeredChildren = h('div', { class: 'contents', 'data-tiger-overlay-layer': '' }, [
    children,
    h('div', { class: 'contents', 'data-tiger-overlay-host': '' })
  ])
  if (disabled || !target) return layeredChildren
  return h(Teleport as never, { to: target }, [layeredChildren])
}

export interface UseVueFocusTrapOptions {
  enabled: Ref<boolean>
  containerRef: Ref<HTMLElement | null>
}

export function useVueFocusTrap({ enabled, containerRef }: UseVueFocusTrapOptions): void {
  watch(
    [enabled, containerRef],
    ([isEnabled, container], _previous, onCleanup) => {
      if (!isEnabled || !container) return
      const ownerDocument = container.ownerDocument

      const handler = (event: KeyboardEvent) => {
        if (!(event.target instanceof Node) || !container.contains(event.target)) return
        const focusables = getFocusableElements(container)
        const activeElement = ownerDocument.activeElement
        const navigation = getFocusTrapNavigation(event, focusables, activeElement)

        if (!navigation.shouldHandle || !navigation.next) return

        event.preventDefault()
        navigation.next.focus()
      }

      ownerDocument.addEventListener('keydown', handler, true)
      onCleanup(() => ownerDocument.removeEventListener('keydown', handler, true))
    },
    { immediate: true, flush: 'post' }
  )
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
  isPositioned: Ref<boolean>
  referenceWidth: Ref<number>
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
  const isPositioned = ref(false)
  const referenceWidth = ref(0)

  let cleanup: FloatingCleanup | null = null
  let updateRequest = 0

  const update = async () => {
    const request = ++updateRequest
    const reference = referenceRef.value
    const floating = floatingRef.value

    if (!enabled.value || !reference || !floating) return

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

    if (
      request !== updateRequest ||
      !enabled.value ||
      referenceRef.value !== reference ||
      floatingRef.value !== floating
    ) {
      return
    }

    referenceWidth.value = reference.getBoundingClientRect().width
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
    isPositioned.value = true
  }

  watch(
    [enabled, referenceRef, floatingRef],
    ([isEnabled, reference, floating]) => {
      updateRequest += 1
      // Cleanup previous auto-update
      if (cleanup) {
        cleanup()
        cleanup = null
      }

      if (!isEnabled || !reference || !floating) {
        isPositioned.value = false
        return
      }

      // Initial position calculation
      update()

      // Set up auto-update
      cleanup = autoUpdateFloating(reference, floating, update)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    updateRequest += 1
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
    update,
    isPositioned,
    referenceWidth
  }
}

export interface UseVueAnchoredOverlayOptions {
  enabled: Ref<boolean>
  referenceRef: Ref<HTMLElement | null>
  floatingRef: Ref<HTMLElement | null>
  containerRef?: Ref<HTMLElement | null>
  outsideRefs?: Array<Ref<HTMLElement | null> | undefined>
  placement?: FloatingPlacement
  offset?: number
  layout?: AnchoredOverlayLayout
  matchReferenceWidth?: boolean
  portal?: Ref<boolean> | boolean
  dismissOnOutside?: Ref<boolean> | boolean
  dismissOnEscape?: Ref<boolean> | boolean
  restoreFocusOnDismiss?: boolean
  onDismiss?: (reason: AnchoredOverlayDismissReason) => void
}

export type AnchoredOverlayDismissReason = 'outside' | 'escape'

export function useVueAnchoredOverlay(options: UseVueAnchoredOverlayOptions) {
  const target = ref<HTMLElement | null>(null)
  const floatingLayerRef = computed(
    () => resolveOverlayLayer(options.floatingRef.value) ?? options.floatingRef.value
  )
  const portalEnabled = () =>
    typeof options.portal === 'object' ? options.portal.value : (options.portal ?? true)
  const optionEnabled = (value: Ref<boolean> | boolean | undefined) =>
    typeof value === 'object' ? value.value : Boolean(value)

  const targetSources = [
    options.enabled,
    options.referenceRef,
    ...(typeof options.portal === 'object' ? [options.portal] : [])
  ]
  watch(
    targetSources,
    () => {
      if (!portalEnabled()) {
        target.value = null
        return
      }
      target.value = resolveAnchoredOverlayTarget(options.referenceRef.value)
    },
    { immediate: true, flush: 'post' }
  )

  watch(
    [options.enabled, options.floatingRef],
    ([enabled, floating], _previous, onCleanup) => {
      if (!enabled || !floating) return

      const handleTab = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return
        const target = getAnchoredOverlayTabTarget(
          options.referenceRef.value,
          options.floatingRef.value,
          event.shiftKey
        )
        if (!target) return

        event.preventDefault()
        window.setTimeout(() => restoreFocus(target, { preventScroll: true }), 0)
      }

      floating.addEventListener('keydown', handleTab, true)
      onCleanup(() => floating.removeEventListener('keydown', handleTab, true))
    },
    { immediate: true, flush: 'post' }
  )

  const floating = useVueFloating({
    referenceRef: options.referenceRef,
    floatingRef: options.floatingRef,
    enabled: options.enabled,
    placement: options.placement ?? 'bottom-start',
    offset: options.offset ?? 4
  })

  const dismiss = (reason: AnchoredOverlayDismissReason) => {
    options.onDismiss?.(reason)
    if (options.restoreFocusOnDismiss && reason === 'escape') {
      window.setTimeout(() => restoreFocus(options.referenceRef.value, { preventScroll: true }), 0)
    }
  }

  let outsideCleanup: (() => void) | undefined
  let escapeCleanup: (() => void) | undefined
  const dismissSources = [
    options.enabled,
    ...(typeof options.dismissOnOutside === 'object' ? [options.dismissOnOutside] : []),
    ...(typeof options.dismissOnEscape === 'object' ? [options.dismissOnEscape] : [])
  ]
  watch(
    dismissSources,
    ([enabled]) => {
      outsideCleanup?.()
      escapeCleanup?.()
      outsideCleanup = undefined
      escapeCleanup = undefined
      if (!enabled) return
      if (optionEnabled(options.dismissOnOutside)) {
        outsideCleanup = useVueClickOutside({
          enabled: options.enabled,
          refs: [
            options.containerRef,
            options.referenceRef,
            floatingLayerRef,
            ...(options.outsideRefs ?? [])
          ],
          onOutsideClick: () => dismiss('outside'),
          defer: false
        })
      }
      if (optionEnabled(options.dismissOnEscape)) {
        escapeCleanup = useVueEscapeKey({
          enabled: options.enabled,
          onEscape: () => dismiss('escape'),
          layerRef: floatingLayerRef
        })
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    outsideCleanup?.()
    escapeCleanup?.()
  })

  const floatingStyles = computed(() => ({
    '--tiger-overlay-x': `${floating.x.value}px`,
    '--tiger-overlay-y': `${floating.y.value}px`,
    '--tiger-overlay-reference-width': `${floating.referenceWidth.value}px`,
    zIndex: FLOATING_OVERLAY_Z_INDEX,
    transformOrigin: getTransformOrigin(floating.placement.value)
  }))
  const floatingClasses = computed(() =>
    getAnchoredOverlayLayoutClasses(
      options.layout ?? 'anchored',
      options.matchReferenceWidth ?? false
    )
  )

  return {
    target,
    floatingStyles,
    floatingClasses,
    positioned: floating.isPositioned,
    placement: floating.placement,
    x: floating.x,
    y: floating.y
  }
}
